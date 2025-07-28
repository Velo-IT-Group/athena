import { createServerFileRoute } from "@tanstack/react-start/server";
import { env } from "@/lib/utils";
import { json } from "@tanstack/react-start";
import { jwtVerify } from "jose";

export const ServerRoute = createServerFileRoute("/api/auth/decrypt").methods({
	POST: async ({ request, params }) => {
		const formData = await request.formData();
		const token = (formData.get("token") as string)?.trim();

		return json(
			await jwtVerify(token, new TextEncoder().encode(env.VITE_SECRET_KEY)),
		);
	},
});
