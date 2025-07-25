// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";
Deno.serve(async (req)=>{
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_ANON_KEY"), {
    db: {
      schema: "reporting"
    }
  });
  const data = await req.json();
  const response = await fetch(`https://intelligence.twilio.com/v2/Transcripts/${data.transcript_sid}`, {
    headers: {
      "Authorization": `Basic ${btoa(`${Deno.env.get("TWILIO_ACCOUNT_SID")}:${Deno.env.get("TWILIO_AUTH_TOKEN")}`)}`
    }
  });
  const transcript = await response.json();
  console.log(transcript);
  const { error } = await supabase.from("engagements").update({
    transcription_sid: transcript.sid
  }).eq("attributes -> conference -> participants -> worker", `"${transcript.channel.media_properties.reference_sids.call_sid}"`).single();
  if (error) {
    throw new Error(error.message);
  }
  return new Response(JSON.stringify(error), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
