import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/utils";
import type { WebToken } from "@/types/crypto";
import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { setCookie } from "@tanstack/react-start/server";
import { SignJWT } from "jose";

export const APIRoute = createAPIFileRoute("/api/auth/encrypt")({
    POST: async ({ request, params }) => {
        const formData = await request.formData();
        const public_key = (formData.get("public_key") as string)?.trim();
        const secret_key = (formData.get("secret_key") as string)?.trim();
        const user_id = (formData.get("user_id") as string)?.trim();

        const supabase = createClient();

        const data: WebToken = {
            user_id,
            connect_wise: { public_key, secret_key },
        };

        const jwt = await new SignJWT(data)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .sign(new TextEncoder().encode(env.VITE_SECRET_KEY));

        setCookie("connect_wise:auth", jwt);

        // const value = sign(
        //     data,
        //     process.env.SECRET_KEY! + (user_id ?? data.user_id),
        //     {},
        // );

        // const { error } = await supabase.from("profile_keys").upsert({
        //     user_id,
        //     key: value,
        // });

        return json(jwt);
    },
});
