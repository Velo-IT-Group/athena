import axios, { AxiosHeaders, type AxiosRequestConfig } from "axios";
import { env } from "@/lib/utils";
import type { PatchOperation } from "@/types";
import { createServerFn } from "@tanstack/react-start";
import { baseHeaders } from "@/utils/manage/params";
import type { Project } from "@/types/manage";
import authMiddleware from "@/lib/supabase/middleware";

const headers = new AxiosHeaders(baseHeaders);

headers.set("clientId", env.VITE_CONNECT_WISE_CLIENT_ID!);
headers.set("Content-Type", "application/json");

headers.set(
	"Authorization",
	"Basic " +
		btoa(
			"velo+" +
				"maaPiVTeEybbK3SX" +
				":" +
				"eCT1NboeMrXq9P3z",
		),
);

export const updateTicket = createServerFn().middleware([authMiddleware])
	.validator((
		{ id, operation }: { id: number; operation: PatchOperation<Ticket>[] },
	) => ({ id, operation })).handler(
		async ({ data: { id, operation }, context }) => {
			const config: AxiosRequestConfig = {
				headers: context.userHeaders,
			};

			console.log(config);
			// const { data } = await axios.patch(
			// 	`${env.VITE_CONNECT_WISE_URL}/service/tickets/${id}`,
			// 	operation,
			// 	config,
			// );

			// return data;
		},
	);

// export const updateCompanyNote = async (
// 	companyId: number,
// 	id: number,
// 	operation: PatchOperation[],
// ): Promise<CompanyNote> => {
// 	// const cookieStore = await cookies();
// 	const supabase = await createClient();
// 	const {
// 		data: { user },
// 	} = await supabase.auth.getUser();

// 	const headers = new AxiosHeaders();
// 	headers.set("clientId", env.VITE_CONNECT_WISE_CLIENT_ID!);
// 	headers.set("Content-Type", "application/json");

// 	// const authCookie = cookieStore.get('connect_wise:auth');

// 	const auth = JSON.parse(authCookie?.value ?? "{}");
// 	const token = decryptToken(auth, user?.id ?? "");

// 	if (authCookie) {
// 		headers.set(
// 			"Authorization",
// 			"Basic " +
// 				btoa(
// 					"velo+" + token.connect_wise.public_key + ":" +
// 						token.connect_wise.secret_key,
// 				),
// 		);
// 	}

// 	const config: AxiosRequestConfig = {
// 		headers,
// 	};

// 	const data = await axios.patch(
// 		`${env.VITE_CONNECT_WISE_URL}/company/companies/${companyId}/notes/${id}`,
// 		operation,
// 		config,
// 	);

// 	// console.log(data.headers)

// 	// const fetchInit: RequestInit = {
// 	//     headers,
// 	//     method: 'patch',
// 	//     body: operation,
// 	// }

// 	// console.log(fetchInit)

// 	// const response = await fetch(
// 	//     `${env.VITE_CONNECT_WISE_URL}/company/companies/${companyId}/notes/${id}`,
// 	//     fetchInit
// 	// )

// 	// console.log(env.VITE_CONNECT_WISE_URL)

// 	// const data = await response.text()

// 	// console.log(data)

// 	// if (!response.ok)
// 	//     throw new Error(response.statusText, { cause: response.statusText })

// 	revalidatePath("/");

// 	return data.data;
// };

export const updateManageProject = createServerFn().validator((
	{ id, operation }: { id: number; operation: PatchOperation<Project>[] },
) => ({ id, operation })).handler(async (
	{ data: { id, operation } },
) => {
	console.log(operation);
	const config: AxiosRequestConfig = {
		headers,
		data: JSON.stringify(operation),
	};

	console.log(config);

	const response = await axios.patch(
		`${env.VITE_CONNECT_WISE_URL}/project/projects/${id}`,
		operation,
		config,
	);

	if (response.status !== 200) {
		throw new Error(
			"Error updating manage project " +
				response.data,
		);
	}

	return response.data;
});

// export const updateManageProject = async (
// 	id: number,
// 	estimatedHours: number,
// ) => {
// 	const cookieStore = await cookies();
// 	const supabase = await createClient();
// 	const {
// 		data: { user },
// 	} = await supabase.auth.getUser();

// 	const headers = new AxiosHeaders();
// 	headers.set("clientId", env.VITE_CONNECT_WISE_CLIENT_ID!);
// 	headers.set("Content-Type", "application/json");

// 	const authCookie = cookieStore.get("connect_wise:auth");

// 	const auth = JSON.parse(authCookie?.value ?? "{}");
// 	const token = decryptToken(auth, user?.id ?? "");

// 	if (authCookie) {
// 		headers.set(
// 			"Authorization",
// 			"Basic " +
// 				btoa(
// 					"velo+" + token.connect_wise.public_key + ":" +
// 						token.connect_wise.secret_key,
// 				),
// 		);
// 	}

// 	const config: AxiosRequestConfig = {
// 		headers,
// 		data: [
// 			{
// 				op: "replace",
// 				path: "/billProjectAfterClosedFlag",
// 				value: true,
// 			},
// 			{
// 				op: "replace",
// 				path: "/budgetFlag",
// 				value: true,
// 			},
// 			{
// 				op: "replace",
// 				path: "/estimatedHours",
// 				value: estimatedHours,
// 			},
// 			{
// 				op: "replace",
// 				path: "/billingMethod",
// 				value: "FixedFee",
// 			},
// 		],
// 	};

// 	try {
// 		const { data }: AxiosResponse<ProductsItem, Error> = await axios.patch(
// 			`${env.VITE_CONNECT_WISE_URL}/project/projects/${id}`,
// 			"replace",
// 			config,
// 		);

// 		// Optionally, return data if needed
// 		// const data = await response.json();
// 		return data;
// 	} catch (error) {
// 		// Handle the error
// 		console.error("Error updating manage project:", error);
// 		throw error; // Rethrow the error if needed
// 	}
// };
