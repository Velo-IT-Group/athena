type SlashPrefix<T extends string> = T extends "" ? "" : `${T}`;

export type WithNestedKeys<T> = (
    T extends object ? {
            [
                K in Exclude<
                    keyof T,
                    symbol
                >
            ]: `/${K}${SlashPrefix<WithNestedKeys<T[K]>>}`;
        }[Exclude<keyof T, symbol>]
        : ""
) extends infer D ? Extract<D, string>
    : never;

export type WithNestedKeys2<T> = (
    T extends object ? {
            [K in Extract<keyof T, string>]: `${K}${SlashPrefix<
                WithNestedKeys2<T[K]>
            >}`;
        }[Extract<keyof T, string>]
        : ""
) extends infer D ? Extract<D, string> : never;

export interface Identifiable {
    id: number;
    name: string;
}

export interface TableDefinition {
    page: string;
    section?: string;
}

export enum Operation {
    Replace = "replace",
    Add = "add",
    Remove = "remove",
    Copy = "copy",
    Move = "move",
    Test = "test",
}

export interface PatchOperation<T> {
    op: Operation;
    path: WithNestedKeys<T>;
    // path: string;
    value: any;
}
