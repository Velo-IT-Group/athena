import type { ProjectPhase, ProjectWorkPlan } from '@/types/manage';
import { productStub } from '@/types/optimistic-types';

export const createNestedPhaseFromTemplate = (
	workplan: ProjectWorkPlan,
	version: string,
	destinationIndex: number
): NestedPhase[] => {
	return (
		workplan?.phases.map((phase: ProjectPhase, index) => {
			const { description } = phase;
			const phaseId = phase.id.toString();
			return {
				id: phaseId,
				description: description,
				hours: 0,
				order: destinationIndex + index,
				visible: true,
				version,
				reference_id: null,
				tickets: phase.tickets.map((ticket, index) => {
					const { budgetHours, wbsCode, summary } = ticket;
					const ticketId = ticket.id.toString();
					return {
						budget_hours: budgetHours,
						created_at: new Date().toISOString(),
						id: ticketId,
						order: wbsCode ? parseInt(wbsCode) - 1 : index,
						phase: phaseId,
						summary,
						visible: true,
						reference_id: null,
						tasks: ticket.tasks?.map((task) => {
							const { notes, summary, priority } = task;
							const taskId = task.id.toString();
							return {
								created_at: new Date().toISOString(),
								id: taskId,
								notes,
								priority,
								summary,
								ticket: ticketId,
								visible: false,
								order: index,
							};
						}),
					};
				}) as NestedTicket[],
			};
		}) ?? []
	);
};

type CamelCaseObject = Record<string, any>;

type SnakeCaseObject<T> = {
	[K in keyof T as Uncapitalize<string & K>]: T[K] extends object
		? SnakeCaseObject<T[K]>
		: T[K];
};

export function flattenObject<T extends CamelCaseObject>(
	obj: T
): SnakeCaseObject<T> {
	type FlattenResult<T> = T extends { name: infer U }
		? U
		: SnakeCaseObject<T>;

	const flatObject: Partial<FlattenResult<T>> = {};

	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === 'object' && value && value.id) {
			// @ts-ignore
			flatObject[key as keyof T] = value.id as FlattenResult<T>;
		} else if (typeof value === 'object' && value && value.name) {
			// @ts-ignore
			flatObject[key as keyof T] = value.name as FlattenResult<T>;
		} else {
			// @ts-ignore
			flatObject[key as keyof T] = value;
		}
	}

	return flatObject as unknown as SnakeCaseObject<T>;
}

// export function convertToSnakeCase<T extends CamelCaseObject>(
//     input: T,
//     flatten: true
// ): SnakeCaseObject<T>
// export function convertToSnakeCase(input: string): string
export function convertToSnakeCase(input: any, flatten = true): any {
	if (typeof input === 'string') {
		return input.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
	}

	const snakeObject: Partial<SnakeCaseObject<typeof input>> = {};

	for (const [key, value] of Object.entries(input)) {
		const snakeKey = key
			.replace(/([A-Z])/g, '_$1')
			.toLowerCase() as keyof SnakeCaseObject<typeof input>;
		snakeObject[snakeKey] = value;
	}

	if (flatten) {
		return flattenObject(snakeObject);
	}

	return snakeObject as SnakeCaseObject<typeof input>;
}

export const convertToCamelCase = (
	item: string | object,
	flatten = true
) => {
	if (typeof item === 'string') {
		return item
			.toLowerCase()
			.replace(/([-_][a-z])/g, (group) =>
				group.toUpperCase().replace('-', '').replace('_', '')
			);
	}

	const snakeObject: Record<string, any> = {};

	for (const [key, value] of Object.entries(item)) {
		const snakeKey = key
			.toLowerCase()
			.replace(/([-_][a-z])/g, (group) =>
				group.toUpperCase().replace('-', '').replace('_', '')
			);
		snakeObject[snakeKey] = value;
	}

	// if (flatten) {
	// 	const flattenedObject = flattenObject(snakeObject);
	// 	return flattenedObject;
	// }

	console.log(snakeObject);

	return snakeObject;
};

export const convertToProduct = (product: ProductInsert) => {
	const tempObj = {};
	Object.keys(productStub).map((key) => {
		// @ts-expect-error
		tempObj[key] = product[key];
	});

	return tempObj;
};

export const wait = (ms: number) =>
	new Promise((resolve) => {
		setTimeout(() => resolve(ms), ms);
	});

interface ReturnType {
	laborTotal: number;
	productTotal: number;
	recurringTotal: number;
	totalPrice: number;
	productCost: number;
	recurringCost: number;
	totalCost: number;
	laborHours: number;
	ticketHours?: number;
}

export const calculateTotals = (
	products: Product[],
	phases: NestedPhase[],
	labor_rate: number
): ReturnType => {
	const ticketHours =
		phases && phases.length
			? phases
					.map((p) => p.tickets?.map((t) => t.budget_hours).flat())
					.flat()
			: [];

	const ticketSum = ticketHours?.reduce((accumulator, currentValue) => {
		return (accumulator ?? 0) + (currentValue ?? 0);
	}, 0);

	const laborHours = ticketSum ?? 0;

	const laborTotal = laborHours * labor_rate;

	const productTotal: number = products
		.filter(
			(p) =>
				!p.recurring_flag ||
				p.recurring_bill_cycle !== 2 ||
				p.parent !== null
		)
		.reduce((accumulator, currentValue) => {
			const price: number | null =
				currentValue.product_class === 'Bundle'
					? currentValue.calculated_price
					: currentValue.price;

			return currentValue.parent
				? accumulator + 0
				: accumulator + (price ?? 0) * (currentValue?.quantity ?? 0);
		}, 0);

	const recurringTotal = products
		?.filter((product) => product.recurring_flag)
		.reduce(
			(accumulator, currentValue) =>
				accumulator +
				(currentValue?.price ?? 0) * (currentValue?.quantity ?? 0),
			0
		);

	const productCost: number = products
		.filter((p) => !p.recurring_flag || p.recurring_bill_cycle !== 2)
		.reduce((accumulator, currentValue) => {
			const cost: number | null =
				currentValue.product_class === 'Bundle'
					? currentValue.calculated_cost
					: currentValue.cost;

			return currentValue.parent
				? accumulator + 0
				: accumulator + (cost ?? 0) * (currentValue?.quantity ?? 0);
		}, 0);

	const recurringCost = products
		?.filter((product) => product.recurring_flag)
		.reduce(
			(accumulator, currentValue) =>
				accumulator +
				(currentValue?.cost ?? 0) * (currentValue?.quantity ?? 0),
			0
		);

	const totalPrice = productTotal + recurringTotal + laborTotal;
	const totalCost = productCost + recurringCost;

	return {
		laborTotal,
		productTotal,
		totalCost,
		recurringTotal,
		productCost,
		recurringCost,
		totalPrice,
		ticketHours: ticketSum,
		laborHours,
	};
};

interface Orderable {
	fn: (...args: any[]) => any;
}

export const retryWithDelay = async (
	fn: (...args: any | any[]) => Promise<any>,
	retries = 3,
	interval = 50,
	finalErr = 'Retry failed'
): Promise<any> => {
	try {
		// try
		await fn();
	} catch (err) {
		// if no retries left
		// throw error
		if (retries <= 0) {
			return Promise.reject(finalErr);
		}

		//delay the next call
		await wait(interval);

		//recursively call the same func
		return retryWithDelay(fn, retries - 1, interval, finalErr);
	}
};
