"use server";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { DeviceCodeCredential } from "@azure/identity";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { createServer } from "http";
import { createServerFn } from "@tanstack/react-start";

export const createClient = createServerFn().handler<Headers>(
    async () => {
        const supabase = createSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.provider_token) {
            throw new Error("No provider token found");
        }

        return new Headers({
            Authorization: `Bearer ${session.provider_token}`,
        });
    },
);

export const getMe = createServerFn().handler(async () => {
    const headers = await createClient();
    const client = Client.initWithMiddleware({
        authProvider: new TokenCredentialAuthenticationProvider(
            new DeviceCodeCredential(),
            {
                scopes: ["User.Read"],
            },
        ),
    });

    const user = await client.api("/me").get();
    return user;
});
