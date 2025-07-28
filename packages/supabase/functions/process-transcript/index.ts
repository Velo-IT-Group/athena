// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import Twilio from "twilio";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const client = await new Twilio.Twilio(
    Deno.env.get("TWILIO_ACCOUNT_SID"),
    Deno.env.get("TWILIO_AUTH_TOKEN"),
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL or Anon Key is not set in environment variables.",
    );
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      db: {
        schema: "reporting",
      },
    },
  );

  const data = await req.json();
  const transcriptContext = client.intelligence.v2.transcripts(
    data.transcript_sid,
  );

  const [transcript, operatorResults, sentences] = await Promise.all([
    transcriptContext.fetch(),
    transcriptContext.operatorResults.list(),
    transcriptContext.sentences.list({
      limit: 1000,
    }),
  ]);

  console.log(await transcriptContext.media().fetch());

  const { error } = await supabase.from("engagements").update({
    transcription_sid: transcript.sid,
    summary: operatorResults.find((o) => o.name === "Conversation Summary")
      ?.textGenerationResults?.result,
    transcript: sentences.map((s) => s.toJSON()),
  }).eq(
    "attributes -> conference -> participants -> worker",
    `"${transcript.channel.media_properties.reference_sids.call_sid}"`,
  ).single().throwOnError();

  return new Response(JSON.stringify(error), {
    headers: {
      "Content-Type": "application/json",
    },
  });
});
