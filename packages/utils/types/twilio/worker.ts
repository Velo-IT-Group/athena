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
});

export type WorkerAttributes = z.infer<typeof workerAttributesSchema>;

export const attributeIdentifier = z.object({
    userId: z.number().optional(),
    companyId: z.number().optional(),
    name: z.string(),
    territoryName: z.string(),
});

export const voiceAttributesSchema = z.discriminatedUnion("direction", [
    z.object({
        ...attributeIdentifier.shape,
        direction: z.literal("inbound"),
        from_country: z.string(),
        called: z.string(),
        to_country: z.string(),
        to_city: z.string(),
        taskType: z.enum(["voicemail"]),
        conversations: z.object({
            hang_up_by: z.string(),
            in_business_hours: z.string(),
        }),
        to_state: z.string(),
        caller_country: z.string(),
        userLastName: z.string(),
        call_sid: z.string(),
        account_sid: z.string(),
        from_zip: z.string(),
        from: z.string(),
        customers: z.object({
            phone: z.string(),
            organization: z.string(),
            name: z.string(),
            external_id: z.string(),
        }),
        called_zip: z.string(),
        caller_state: z.string(),
        to_zip: z.string(),
        called_country: z.string(),
        from_city: z.string(),
        team: z.string(),
        userFirstName: z.string(),
        called_city: z.string(),
        caller_zip: z.string(),
        api_version: z.string(),
        called_state: z.string(),
        from_state: z.string(),
        caller: z.string(),
        caller_city: z.string(),
        to: z.string(),
        conference: z.object({
            sid: z.string(),
            participants: z.object({
                worker: z.string(),
                customer: z.string(),
            }),
        }).optional(),
    }),
    z.object({
        ...attributeIdentifier.shape,
        direction: z.literal("outbound"),
        from: z.string(),
        outbound_to: z.string(),
        conference: z.object({
            sid: z.string(),
            participants: z.object({
                worker: z.string(),
                customer: z.string(),
                transfer: z.string().optional(),
            }),
        }).optional(),
    }),
]);

export type VoiceAttributes = z.infer<typeof voiceAttributesSchema>;
