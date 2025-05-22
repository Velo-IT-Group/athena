import { createNoteSchema } from "@/types/manage";
import { baseHeaders } from "@/utils/manage/params";
import axios, { type AxiosRequestConfig } from "axios";
import { z } from "zod";
import { env } from "../utils";
import { createServerFn } from "@tanstack/react-start";

export const createCompanyNote = createServerFn().validator((
	{ companyId, note }: {
		companyId: number;
		note: z.infer<typeof createNoteSchema>;
	},
) => ({ companyId, note })).handler(
	async ({ data: { companyId, note } }) => {
		const config: AxiosRequestConfig = {
			headers: baseHeaders,
		};

		const data = await axios.post(
			`${env.VITE_CONNECT_WISE_URL}/company/companies/${companyId}/notes`,
			note,
			config,
		);

		if (data.status !== 201) {
			throw new Error(
				`Error creating company note: ${data.statusText} \n\n` +
					data.data,
			);
		}
		return data.data;
	},
);
