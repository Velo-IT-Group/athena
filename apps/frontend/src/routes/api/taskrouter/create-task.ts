import { createServerFileRoute } from "@tanstack/react-start/server"
import { json } from "@tanstack/react-start";

export const ServerRoute = createServerFileRoute("/api/taskrouter/create-task").methods({
    POST: async ({ request, params }) => {
        // const data = await request.json();
        request.body;
        // request.formData()
        console.log(request.body, params);

        // console.log(data);
        return json({ status: 200 });
    },
});
