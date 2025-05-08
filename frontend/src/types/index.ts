export type Identifiable = {
    id: number
    name: string
}

export type TableDefinition = {
    page: string
    section?: string
}

export enum Operation {
    Replace = 'replace',
    Add = 'add',
    Remove = 'remove',
    Copy = 'copy',
    Move = 'move',
    Test = 'test',
}

export type ManageProductUpdate = {
    id: number
    values: PatchOperation[]
}

export type PatchOperation = {
    op: Operation
    path: string
    value: any
}
