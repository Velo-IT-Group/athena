export type ProductState = {
    newProduct?: NestedProduct
    newProducts?: NestedProduct[]
    updatedProduct?: NestedProduct
    updatedProducts?: NestedProduct[]
    deletedProduct?: string
    pending: boolean
}

export const productStub: ProductInsert = {
    id: null,
    calculated_cost: null,
    calculated_price: null,
    catalog_item: null,
    category: null,
    cost: null,
    description: null,
    extended_cost: null,
    extended_price: null,
    identifier: null,
    manufacturer_part_number: null,
    parent: null,
    parent_catalog_item: null,
    price: null,
    product_class: null,
    quantity: undefined,
    recurring_bill_cycle: null,
    recurring_cost: null,
    recurring_cycle_type: null,
    recurring_flag: null,
    section: null,
    sequence_number: null,
    taxable_flag: null,
    type: null,
    unit_of_measure: null,
    vendor: null,
    additional_overrides: null,
    version: '',
}

export type PhaseState = {
    newPhases?: NestedPhase[]
    newPhase?: NestedPhase
    updatedPhase?: NestedPhase
    updatedPhases?: NestedPhase[]
    deletedPhase?: string
    pending: boolean
}

export type SectionState = {
    newSection?: SectionInsert
    updatedSection?: SectionUpdate
    updatedSections?: Section[]
    deletedSection?: string
    pending: boolean
}

export type TicketState = {
    newTicket?: NestedTicket
    updatedTicket?: NestedTicket
    updatedTickets?: NestedTicket[]
    deletedTicket?: string
    pending: boolean
}

export type TaskState = {
    newTask?: TaskInsert
    updatedTask?: Task
    updatedTasks?: Task[]
    deletedTask?: string
    pending: boolean
}
