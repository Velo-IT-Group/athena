import { env } from "@/lib/utils";
import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import pkg from "jsonwebtoken";
const { verify } = pkg;

export const APIRoute = createAPIFileRoute("/api/auth/decrypt")({
    POST: async ({ request, params }) => {
        const formData = await request.formData();
        const token = (formData.get("token") as string)?.trim();
        const user_id = (formData.get("user_id") as string)?.trim();

        console.log(token, user_id, env.VITE_SECRET_KEY + user_id);

        return json(verify(token, env.VITE_SECRET_KEY + user_id, {}));
    },
});
