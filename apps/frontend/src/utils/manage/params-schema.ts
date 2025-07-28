import { z } from "zod";

type SlashPrefix<T extends string> = T extends "" ? "" : `/${T}`;

type WithNestedKeys<T> = (
	T extends object
		? {
				[K in Exclude<
					keyof T,
					symbol
				>]: `${K}${SlashPrefix<WithNestedKeys<T[K]>>}`;
			}[Exclude<keyof T, symbol>]
		: ""
) extends infer D
	? Extract<D, string>
	: never;

// Define the KeyValue schema
export const valueSchema = z.union([
	z.number(),
	z.string(),
	z.boolean(),
	z.array(z.string()),
	z.array(z.number()),
	z.date(),
	z.null(),
	z.undefined(),
]);

const nonArrayComparisonSchema = z.enum([
	"=",
	"!=",
	"<",
	"<=",
	">",
	">=",
	"contains",
	"like",
	"not",
	"null",
	"in",
	"not in",
]);

const arrayComparisonSchema = z.enum(["in", "not in"]);

// Example schemas
const conditionSchema = z.object({
	key: z.string(), // Autocompletion of keys from schema
	value: valueSchema,
	comparison: nonArrayComparisonSchema,
});

const groupLogicSchema = z.enum(["AND", "OR"]);

const conditionGroupSchema = z.object({
	logic: groupLogicSchema,
	conditions: z.array(conditionSchema),
});

const directionSchema = z.enum(["asc", "desc"]);

const orderBySchema = z.object({
	field: z.string(),
	direction: directionSchema,
});

export const parameterSchema = z.object({
	conditions: z
		.array(z.union([conditionGroupSchema, conditionSchema]))
		.optional(),
	childConditions: z
		.array(z.union([conditionGroupSchema, conditionSchema]))
		.optional(),
	customFieldConditions: z
		.array(z.union([conditionGroupSchema, conditionSchema]))
		.optional(),
	orderBy: orderBySchema.optional(),
	fields: z.array(z.string()).optional(),
	page: z.number().optional(),
	pageSize: z.number().optional(),
});

// Helper function to format condition values
const formatConditionValue = (value: any) => {
	if (value === null) {
		// Null: Handle special case for null
		return "NULL"; // or "IS NULL" depending on the API
	} else if (value instanceof Date) {
		// Date: Convert to ISO string and wrap in brackets
		return `[${value.toISOString()}]`;
	} else if (Array.isArray(value)) {
		// Array: Wrap in parentheses
		return `(${value.join(",")})`;
	} else if (typeof value === "string") {
		// String: Wrap in single quotes
		return `'${value}'`;
	} else {
		// Number: Leave as is
		return String(value);
	}
};

// Function to build search params from validated input
export function buildSearchParams<T>(
	input: z.infer<typeof parameterSchema>,
): URLSearchParams {
	const params = new URLSearchParams();

	const combineConditions = (
		groupName: string,
		groups?: (typeof input.conditions)[][number],
	) => {
		if (!groups) return;

		const conditionsArr: string[] = [];
		groups.forEach((group) => {
			if ("logic" in group) {
				// It's a condition group (logic and conditions array)
				const groupConditions = group.conditions
					.map((cond) => {
						const formattedValue = formatConditionValue(cond.value);
						return `${cond.key} ${cond.comparison} ${formattedValue}`;
					})
					.join(` ${group.logic} `); // Use the logic to join the conditions inside the group
				conditionsArr.push(`(${groupConditions})`); // Wrap the entire group in parentheses
			} else {
				// It's an individual condition
				const formattedValue = formatConditionValue(group.value);

				conditionsArr.push(
					`${group.key} ${group.comparison} ${formattedValue}`,
				);
			}
		});

		// Combine conditions into one string for the group
		if (conditionsArr.length > 0) {
			params.append(groupName, conditionsArr.join(" AND ")); // Use "AND" to separate conditions between groups
		}
	};

	// Combine condition groups into one parameter for each category
	combineConditions("conditions", input.conditions);
	combineConditions("childConditions", input.childConditions);
	combineConditions("customFieldConditions", input.customFieldConditions);

	// Add orderBy parameters if they exist
	if (input.orderBy) {
		const { field, direction } = input.orderBy;
		const orderByString = direction ? `${field}:${direction}` : field;
		params.append("orderBy", orderByString);
	}

	// Add fields if they exist
	input.fields?.forEach((value, i) => {
		params.append(`fields[${i}]`, value as string);
	});

	// Add pagination parameters if they exist
	if (input.page) {
		params.append("page", String(input.page));
	}

	if (input.pageSize) {
		params.append("pageSize", String(input.pageSize));
	}

	return params;
}

// Helper function to create a condition (you can pass in the key and condition directly)
export function createCondition<T>(
	key: WithNestedKeys<T>,
	value: z.infer<typeof valueSchema>,
	comparison: typeof nonArrayComparisonSchema._type,
): z.infer<typeof conditionSchema> {
	//   const validKeys = Object.keys(schema.shape) as (keyof T)[];
	//   if (!validKeys.includes(key)) {
	//     throw new Error(`Invalid key: ${String(key)}`);
	//   }

	return {
		key,
		value, // Set appropriate value
		comparison, // Default comparison operator
	};
}

// Helper function to create condition groups
export function createConditionGroup<T extends z.ZodObject<any>>(
	logic: typeof groupLogicSchema._type,
	conditions: ReturnType<typeof createCondition<T>>[],
): z.infer<typeof conditionGroupSchema> {
	return {
		logic,
		conditions,
	};
}

// // Example usage with autocomplete for keys and comparisons
// function createParameterObject<T extends z.ZodObject<any>>(
//   schema: T,
// ): z.infer<typeof parameterSchema> {
//   const conditions: z.infer<typeof conditionSchema>[] = [
//     // createCondition(schema, "name"),
//     // createCondition(schema, "age"),
//   ];

//   const conditionGroup = createConditionGroup(schema, "AND", conditions);

//   const parameter: z.infer<typeof parameterSchema> = {
//     conditions: [conditionGroup],
//     orderBy: { field: "name", direction: "asc" },
//     page: 1,
//     pageSize: 20,
//   };

//   return parameter;
// }

const stringSchema = z.object({
	value: z.string(),
	comparison: nonArrayComparisonSchema,
});

const numberSchema = z.object({
	value: z.number(),
	comparison: nonArrayComparisonSchema,
});

const stringArraySchema = z.object({
	value: z.array(z.string()),
	comparison: arrayComparisonSchema,
});

const numberArraySchema = z.object({
	value: z.array(z.number()),
	comparison: nonArrayComparisonSchema,
});

const booleanSchema = z.object({
	value: z.boolean(),
	comparison: z.enum(["=", "!="]),
});

const nullSchema = z.object({
	value: z.null(),
	comparison: z.enum(["=", "!="]),
});

const customTestComparisonSchema = z.union([
	stringSchema,
	numberSchema,
	stringArraySchema,
	numberArraySchema,
	booleanSchema,
	nullSchema,
]);

// type ZodComparison = z.infer<typeof customTestComparisonSchema>;

// type CustomComparison<T> = ZodComparison & {
//   key: WithNestedKeys<T>;
// };

// const t: CustomComparison<Contact> = {
//   value: "",
//   comparison: "!=",
//   key: "company/name",
// };

// // Create a generic Conditions schema
// export const parameterSchema = <T extends z.ZodType>(schema: T) => {
//   return z.object({
//     conditions: valueSchema.or(customTestComparisonSchema).optional(),
//     childConditions: valueSchema.or(customTestComparisonSchema).optional(),
//     customFieldConditions: z.string().optional(),
//     orderBy: z
//       .object({
//         key: z.custom<keyof z.infer<WithNestedKeys<T>>>(),
//         order: z.enum(["asc", "desc"]).default("asc"),
//       })
//       .optional(),
//     fields: z.array(z.custom<keyof z.infer<WithNestedKeys<T>>>()).optional(),
//     page: z.number().default(1),
//     pageSize: z.number().default(25),
//   });
// };

// type Parameters<T> = {
//   conditions?: CustomComparison<T>;
//   childConditions?: CustomComparison<T>;
//   customFieldConditions?: string;
//   orderBy?: {
//     key: WithNestedKeys<T>;
//     order: "asc" | "desc";
//   };
//   fields: WithNestedKeys<T>[];
//   page?: number;
//   pageSize?: number;
// };

// const test: Parameters<Contact> = {
//   conditions: {
//     value: "",
//     comparison: "=",
//     key: "company/id",
//   },
//   orderBy: {
//     key: "company/id",
//     order: "asc",
//   },
//   fields: ["company/id"],
//   page: 1,
//   pageSize: 25,
// };
