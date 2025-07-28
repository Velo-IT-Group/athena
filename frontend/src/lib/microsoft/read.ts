"use server";
import { Client } from "@microsoft/microsoft-graph-client";
import {
    TokenCredentialAuthenticationProvider,
    TokenCredentialAuthenticationProviderOptions,
} from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import { createServerFn } from "@tanstack/react-start";
import { env } from "@/lib/utils";

export const createClient = () => {
    // Create an instance of the TokenCredential class that is imported
    const tokenCredential = new ClientSecretCredential(
        env.VITE_AZURE_TENANT_ID,
        env.VITE_AZURE_CLIENT_ID,
        env.VITE_AZURE_CLIENT_SECRET,
    );

    // Set your scopes and options for TokenCredential.getToken (Check the ` interface GetTokenOptions` in (TokenCredential Implementation)[https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/core/core-auth/src/tokenCredential.ts])

    const options: TokenCredentialAuthenticationProviderOptions = {
        scopes:
            "offline_access openid profile email User.Read Calendars.ReadBasic Calendars.Read Calendars.ReadWrite"
                .split(" "),
        // getTokenOptions,
    };

    // Create an instance of the TokenCredentialAuthenticationProvider by passing the tokenCredential instance and options to the constructor
    const authProvider = new TokenCredentialAuthenticationProvider(
        tokenCredential,
        options,
    );
    return Client.initWithMiddleware({
        debugLogging: true,
        authProvider: authProvider,
    });
};

export const getMe = createServerFn().handler(async () => {
    const client = createClient();

    const user = await client.api("/me").get();
    return user;
});
