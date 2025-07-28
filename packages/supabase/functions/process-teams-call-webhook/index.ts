// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
console.info('server started');
Deno.serve(async (req)=>{
  const url = new URL(req.url);
  if (url.searchParams.has('validationToken')) {
    return new Response(url.searchParams.get('validationToken'), {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
  const payload = await req.json();
  console.log(payload);
  // const data = {
  //   message: `Hello ${name}!`,
  // };
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    }
  });
});
