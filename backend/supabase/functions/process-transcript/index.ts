// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      db: {
        schema: "reporting",
      },
    },
  );

  const data = await req.json() as {
    account_sid: string;
    service_sid: string;
    transcript_sid: string;
    customer_key: string;
    event_type: string;
  };

  const response = await fetch(
    `https://intelligence.twilio.com/v2/Transcripts/${data.transcript_sid}`,
    {
      headers: {
        "Authorization": `Basic ${
          btoa(
            `${Deno.env.get("VITE_TWILIO_ACCOUNT_SID")}:${
              Deno.env.get("VITE_TWILIO_AUTH_TOKEN")
            }`,
          )
        }`,
      },
    },
  );

  const transcript = await response.json() as Root;

  const { error } = await supabase.from("engagements").update(
    {
      transcription_sid: transcript.sid,
    },
  )
    .eq(
      "attributes -> conference -> participants -> worker",
      `"${transcript.channel.media_properties.reference_sids.call_sid}"`,
    ).single();

  if (error) {
    throw new Error(error.message);
  }

  return new Response(
    JSON.stringify(error),
    { headers: { "Content-Type": "application/json" } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-transcript' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

export interface Root {
  status: string;
  redaction: boolean;
  data_logging: boolean;
  media_start_time: string;
  date_updated: string;
  language_code: string;
  account_sid: string;
  customer_key?: string;
  url: string;
  sid: string;
  duration: number;
  date_created: string;
  service_sid: string;
  channel: Channel;
  links: Links;
}

export interface Channel {
  media_properties: MediaProperties;
  participants: Participant[];
  type: string;
}

export interface MediaProperties {
  source: string;
  reference_sids: ReferenceSids;
  source_sid: string;
  media_url?: string;
}

export interface ReferenceSids {
  call_sid: string;
}

export interface Participant {
  user_id?: string;
  channel_participant?: number;
  media_participant_id?: string;
  image_url?: string;
  full_name?: string;
  role: string;
  email?: string;
}

export interface Links {
  media: string;
  sentences: string;
  operator_results: string;
}
