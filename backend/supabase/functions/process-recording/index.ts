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
  const data = await req.formData();
  const callSid = data.get("CallSid");
  const recordingUrl = data.get("RecordingUrl");
  const response = await fetch(recordingUrl);
  const recordingBuffer = await response.arrayBuffer();
  const { data: recording, error: recordingError } = await supabase.storage.from("attachments").upload(`recordings/${callSid}.wav`, new Uint8Array(recordingBuffer), {
    contentType: "audio/x-wav",
    upsert: true
  });
  console.log(recording);
  // const { error } = await supabase.from("engagements").update(
  //   {
  //     recording_url: recordingUrl,
  //   },
  // )
  //   .eq(
  //     "attributes -> conference -> participants -> worker",
  //     `"${callSid}"`,
  //   ).single();
  return new Response(JSON.stringify({
    recordingError,
    recording
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}); /* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-recording' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/ 
