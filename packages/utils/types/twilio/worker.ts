import { z } from "zod";

export const workerAttributesSchema = z.object({
    full_name: z.string(),
    mobile_phone: z.string(),
    contact_uri: z.string(),
    work_phone: z.string(),
    job_title: z.string(),
    email: z.string(),
    on_call: z.boolean(),
    identity: z.string(),
    active: z.boolean(),
    member_id: z.number(),
    contact_id: z.number(),
    team_name: z.string(),
    security_role_id: z.number(),
    worker_sid: z.string(),
});

export type WorkerAttributes = z.infer<typeof workerAttributesSchema>;
