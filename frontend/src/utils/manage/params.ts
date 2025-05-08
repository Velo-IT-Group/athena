import { env } from "@/lib/utils";
import type { Contact } from "@/types/manage";
import { AxiosHeaders } from "axios";
import { z } from "zod";

type SlashPrefix<T extends string> = T extends "" ? "" : `/${T}`;

type WithNestedKeys<T> = (
  T extends object ? {
      [
        K in Exclude<
          keyof T,
          symbol
        >
      ]: `${K}${SlashPrefix<WithNestedKeys<T[K]>>}`;
    }[Exclude<keyof T, symbol>]
    : ""
) extends infer D ? Extract<D, string>
  : never;

const test2: Array<WithNestedKeys<Contact>> = ["company/id"];

export const psaConfig = {
  textOperators: [
    { label: "Contains", value: "contains" as const },
    { label: "Does not contain", value: "not contains" as const },
    { label: "Is", value: "=" as const },
    { label: "Is not", value: "!=" as const },
    { label: "Is empty", value: "null" as const },
    { label: "Is not empty", value: "not null" as const },
  ],
  numericOperators: [
    { label: "Is", value: "=" as const },
    { label: "Is not", value: "!=" as const },
    { label: "Is less than", value: "lt" as const },
    { label: "Is less than or equal to", value: "lte" as const },
    { label: "Is greater than", value: "gt" as const },
    { label: "Is greater than or equal to", value: "gte" as const },
    { label: "Is empty", value: "null" as const },
    { label: "Is not empty", value: "not null" as const },
  ],
  dateOperators: [
    { label: "Is", value: "=" as const },
    { label: "Is not", value: "!=" as const },
    { label: "Is before", value: "lt" as const },
    { label: "Is after", value: "gt" as const },
    { label: "Is on or before", value: "lte" as const },
    { label: "Is on or after", value: "gte" as const },
    { label: "Is between", value: "isBetween" as const },
    { label: "Is relative to today", value: "isRelativeToToday" as const },
    { label: "Is empty", value: "null" as const },
    { label: "Is not empty", value: "not null" as const },
  ],
  selectOperators: [
    { label: "Is", value: "in" as const },
    { label: "Is not", value: "not in" as const },
    { label: "Is empty", value: "null" as const },
    { label: "Is not empty", value: "not null" as const },
  ],
  booleanOperators: [
    { label: "Is", value: "=" as const },
    { label: "Is not", value: "!=" as const },
  ],
  joinOperators: [
    { label: "And", value: "and" as const },
    { label: "Or", value: "or" as const },
  ],
  sortOrders: [
    { label: "Asc", value: "asc" as const },
    { label: "Desc", value: "desc" as const },
  ],
  columnTypes: [
    "text",
    "number",
    "date",
    "boolean",
    "select",
    "multi-select",
  ] as const,
  globalOperators: [
    "like",
    "notLike",
    "=",
    "!=",
    "null",
    "not null",
    "lt",
    "lte",
    "gt",
    "gte",
    "isBetween",
    "isRelativeToToday",
    "and",
    "or",
  ] as const,
};

// Define the Comparator type
const ComparatorSchema = z.enum([
  "=",
  "!=",
  ">",
  "<",
  ">=",
  "<=",
  "like",
  "not like",
  "in",
  "not in",
  "contains",
  "not contains",
]);

// Define the KeyValue schema
export const KeyValueSchema = z.record(
  z.union([
    z.number(),
    z.string(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.number()),
    z.date(),
    z.null(),
    z.undefined(),
    z.object({
      value: z.union([z.number(), z.string(), z.null(), z.boolean()]),
      comparison: ComparatorSchema,
    }),
  ]),
);

// Create a generic Conditions schema
export const createConditionsSchema = <T extends z.ZodType>(schema: T) => {
  return z.object({
    conditions: z.union([KeyValueSchema, z.string()]).optional(),
    childConditions: z.union([KeyValueSchema, z.string()]).optional(),
    customFieldConditions: z.string().optional(),
    orderBy: z
      .object({
        key: z.custom<keyof z.infer<T>>(),
        order: z.enum(["asc", "desc"]).optional(),
      })
      .optional(),
    fields: z.array(z.custom<keyof z.infer<T>>()).optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
  });
};

type Comparator =
  | "="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "=="
  | "contains"
  | "like"
  | "in"
  | "not"
  | "not in";

export interface KeyValue {
  [key: string]:
    | number
    | string
    | boolean
    | string[]
    | number[]
    | Date
    | null
    | undefined
    | { value: number | string | null | boolean; comparison: Comparator };
  // comparator?: Comparator;
}

export interface Comparison {
  parameter: KeyValue;
  comparator?: Comparator;
}

export type Conditions<T> = {
  conditions?: KeyValue | string;
  childConditions?: KeyValue | string;
  customFieldConditions?: string;
  orderBy?: { key: keyof T; order?: "asc" | "desc" };
  fields?: Array<keyof T>;
  page?: number;
  pageSize?: number;
};

const generateConditions = (condition: KeyValue | string) => {
  const generatedConditions: string[] = [];

  if (typeof condition === "string") {
    return condition;
  }

  const entries = Object.entries(condition);

  if (!entries.length) {
    return "";
  }

  entries.forEach(([key, value]) => {
    if (value === undefined) return;
    const type = typeof value;
    if (type === "object") {
      if (Array.isArray(value)) {
        generatedConditions.push(`${key} in (${value.toString()})`);
        // @ts-ignore
      } else if (value?.value !== undefined) {
        generatedConditions.push(
          // @ts-ignore
          `${key} ${value.comparison} ${value.value}`,
        );
      } else if (value instanceof Date) {
        generatedConditions.push(`${key} > [${value.toISOString()}]`);
      } else if (value === null) {
        generatedConditions.push(`${key} = ${value}`);
      }
    } else if (type === "string") {
      generatedConditions.push(`${key} = '${value}'`);
    } else {
      generatedConditions.push(`${key} = ${value}`);
    }
  });

  return generatedConditions.length > 1
    ? generatedConditions
      .map((c, i) => (i === 0 ? c : `and ${c}`))
      .join(" ")
    : generatedConditions[0];
};

const generateParams = <T>(init?: Conditions<T>): string => {
  if (!init) return "";
  const { conditions, childConditions, orderBy, fields, page, pageSize } = init;
  const params = new URLSearchParams();

  if (conditions) {
    params.set("conditions", generateConditions(conditions));
  }

  if (childConditions) {
    params.set("childConditions", generateConditions(childConditions));
  }

  if (orderBy) {
    params.set(
      "orderBy",
      orderBy && `${orderBy.key.toString()} ${orderBy.order ?? "asc"}`,
    );
  }

  if (fields) {
    params.set("fields", fields.toString());
  }

  if (pageSize) {
    params.set("pageSize", pageSize.toString());
  }

  if (page) {
    params.set("page", page.toString());
  }

  return "?" + params.toString();
};

const baseHeaders = new AxiosHeaders();
baseHeaders.set("clientId", env.VITE_CONNECT_WISE_CLIENT_ID);
baseHeaders.set(
  "Authorization",
  "Basic " +
    btoa(env.VITE_CONNECT_WISE_USERNAME + ":" + env.VITE_CONNECT_WISE_PASSWORD),
);
baseHeaders.set("Content-Type", "application/json");
baseHeaders.set("Access-Control-Allow-Origin", "*");
// baseHeaders.set('Access-Control-Allow-Headers', 'sentry-trace, baggage');
// baseHeaders.set('Host', 'manage.velomethod.com');

export { baseHeaders, generateParams };

const MyDataType = z.object({
  id: z.number(),
  name: z.string(),
  // ... other fields
});

const MyConditionsSchema = createConditionsSchema(MyDataType);
