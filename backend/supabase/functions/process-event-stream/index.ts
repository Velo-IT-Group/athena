// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "npm:@supabase/supabase-js";
Deno.serve(async (req)=>{
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_ANON_KEY"), {
    db: {
      schema: "reporting"
    }
  });
  const response = await req.json();
  response.forEach(({ type, data })=>{
    const payload = data.payload;
    console.log(payload, type);
    if (type.includes("reservation.")) {
      supabase.from("engagement_reservations").upsert({
        enagement_id: payload.task_sid,
        id: payload.reservation_sid,
        reservation_status: payload.reservation_status,
        worker_sid: payload.worker_sid
      }).then(({ error })=>{
        if (!error) return;
        const attributes = JSON.parse(payload.task_attributes);
        supabase.from("engagements").upsert({
          id: payload.task_sid,
          is_inbound: attributes.direction === "inbound",
          is_canceled: (payload?.task_canceled_reason?.length ?? 0) > 0,
          workspace_sid: payload.workspace_sid,
          is_voicemail: attributes.conversations?.abandoned_phase === "Voicemail",
          attributes,
          channel: payload.task_channel_unique_name,
          company: attributes?.companyId ? {
            id: attributes?.companyId
          } : undefined,
          contact: attributes?.userId ? {
            id: attributes?.userId
          } : undefined,
          follow_up_engagement_id: attributes?.callBackData?.taskSid
        }).then(({ error })=>{
          if (error) {
            throw new Error(error.message);
          // throw new Error("Reservation " + payload.reservation_sid + " " + error.message);
          }
        });
      });
    }
    if (type.includes("task.")) {
      const attributes = JSON.parse(payload.task_attributes);
      supabase.from("engagements").upsert({
        id: payload.task_sid,
        is_inbound: attributes.direction === "inbound",
        is_canceled: (payload?.task_canceled_reason?.length ?? 0) > 0,
        workspace_sid: payload.workspace_sid,
        is_voicemail: attributes.conversations?.abandoned_phase === "Voicemail",
        attributes,
        channel: payload.task_channel_unique_name,
        company: attributes?.companyId ? {
          id: attributes?.companyId
        } : undefined,
        contact: attributes?.userId ? {
          id: attributes?.userId
        } : undefined,
        follow_up_engagement_id: attributes?.callBackData?.taskSid
      }).then(({ error })=>{
        if (error) {
          throw new Error(error.message);
        }
      });
    }
  });
  return new Response(JSON.stringify({
    status: 200
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
