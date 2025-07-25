// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js';
// Function to Add days to current date
function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}
Deno.serve(async (req)=>{
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
    db: {
      schema: 'system'
    }
  });
  const { data: subscriptions, error } = await supabase.from('microsoft_graph_subscriptions').select();
  if (error) return new Response(JSON.stringify(error), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const currentDate = new Date();
  const expirationDateTime = addDays(currentDate, 6).toISOString();
  const { token_type, access_token } = await getToken();
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `${token_type} ${access_token}`);
  const body = JSON.stringify({
    expirationDateTime
  });
  const requestOptions = {
    method: 'PATCH',
    headers,
    body
  };
  await Promise.all(subscriptions?.map(async (sub)=>{
    const res = await fetch(`https://graph.microsoft.com/v1.0/subscriptions/${sub.subscription_id}`, requestOptions);
    if (!res.ok) {
      const errorText = await res.text();
      return new Response(errorText, {
        status: res.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    const responseData = await res.json();
    const { error: updateError } = await supabase.from('microsoft_graph_subscriptions').update({
      expiration_date: responseData.expirationDateTime
    }).eq('subscription_id', sub.subscription_id);
    if (updateError) return new Response(JSON.stringify(updateError), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }));
  return new Response('Success', {
    headers: {
      'Content-Type': 'application/json'
    }
  });
});
async function getToken() {
  const tokenValues = new URLSearchParams();
  tokenValues.append('client_id', Deno.env.get('AUTH_AZURE_CLIENT_ID'));
  tokenValues.append('scope', 'https://graph.microsoft.com/.default');
  tokenValues.append('client_secret', Deno.env.get('AUTH_AZURE_SECRET'));
  tokenValues.append('grant_type', 'client_credentials');
  const tokenRequestOptions = {
    method: 'POST',
    body: tokenValues,
    redirect: 'follow'
  };
  const tokenResponse = await fetch(`${Deno.env.get('AUTH_AZURE_TENANT_URL')}/oauth2/v2.0/token`, tokenRequestOptions);
  const tokenData = await tokenResponse.json();
  return tokenData;
}
