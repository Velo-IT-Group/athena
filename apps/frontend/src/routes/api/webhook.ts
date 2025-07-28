import { createServerFileRoute } from "@tanstack/react-start/server";
import { json } from "@tanstack/react-start";

export const ServerRoute = createServerFileRoute("/api/webhook").methods({
    POST: async ({ request, params }) => {
        const body = await request.json();
        // const client = await createClient();
        // const messages = await client.conversations.v1.conversations.list({
        //     limit: 1000,
        // });

        // await Promise.all(
        //     messages.map((message) =>
        //         client.conversations.v1.conversations(message.sid).remove()
        //     ),
        // );
        console.log(body);

        return json(body);
    },
});
