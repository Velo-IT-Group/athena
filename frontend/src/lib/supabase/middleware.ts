import { createMiddleware } from "@tanstack/react-start";
import type { AxiosHeaders } from "axios";

// authMiddleware.ts
const authMiddleware = createMiddleware().server(
	async ({ next, data, context }) => {
		// console.log("Request received:", data, context);
		const result = await next({
			context: {
				// userHeaders: context?.userHeaders as unknown as AxiosHeaders,
			},
		});
		// console.log("Response processed:", result);
		return result;
	},
);

export default authMiddleware;
