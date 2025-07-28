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
  const { value } = await req.json();
  console.log(value?.[0].resourceData);
  const token = await getToken();
  const values = await Promise.all(value.map((v)=>getEndpointValue(v.resourceData['@odata.id'], token)));
  const workers = await Promise.all(values.map((v)=>updateWorkersByActivityName(v.id, v.availability)));
  console.log(workers);
  return new Response(JSON.stringify(values), {
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
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
    body: tokenValues
  };
  const tokenResponse = await fetch(`${Deno.env.get('AUTH_AZURE_TENANT_URL')}/oauth2/v2.0/token`, tokenRequestOptions);
  const tokenData = await tokenResponse.json();
  return tokenData;
}
async function getEndpointValue(endpoint, token) {
  console.log(token);
  const res = await fetch(`https://graph.microsoft.com/v1.0/${endpoint}`, {
    method: 'GET',
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`
    }
  });
  const data = await res.json();
  console.log(data);
  return data;
}
async function getWorkersByAttributes(id) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic U0tmNDllZDk5ZDM3ZjZlNjU5N2I2NGQ3NzE4NTAxNTc0MDpkSnhqakZWR3d1QmppNzN6cTZwUFgzWkR0OW96QXIwMQ==");
  const requestOptions = {
    method: "GET",
    headers: myHeaders
  };
  const res = await fetch(`https://taskrouter.twilio.com/v1/Workspaces/WS31570dbcf07adc115b062cceeed8f1ef/Workers?TargetWorkersExpression=custom_claims.oid = '${id}'`, requestOptions);
  const data = res.json();
  return data;
}
async function getActivities(name) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic U0tmNDllZDk5ZDM3ZjZlNjU5N2I2NGQ3NzE4NTAxNTc0MDpkSnhqakZWR3d1QmppNzN6cTZwUFgzWkR0OW96QXIwMQ==");
  const requestOptions = {
    method: "GET",
    headers: myHeaders
  };
  const res = await fetch(`https://taskrouter.twilio.com/v1/Workspaces/WS31570dbcf07adc115b062cceeed8f1ef/Activities?FriendlyName=${name}`, requestOptions);
  const data = res.json();
  return data;
}
async function updateWorkersByActivityName(id, availability) {
  const { workers } = await getWorkersByAttributes(id);
  const worker = workers?.[0];
  if (!worker) throw new Error('Worker not found ' + id);
  const { activities } = await getActivities(availability);
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic U0tmNDllZDk5ZDM3ZjZlNjU5N2I2NGQ3NzE4NTAxNTc0MDpkSnhqakZWR3d1QmppNzN6cTZwUFgzWkR0OW96QXIwMQ==");
  const urlencoded = new URLSearchParams();
  urlencoded.append("ActivitySid", activities?.[0]?.sid ?? "WAee15b42c5e128f583753a597dc5a467e");
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded
  };
  const res = await fetch(`https://taskrouter.twilio.com/v1/Workspaces/WS31570dbcf07adc115b062cceeed8f1ef/Workers/${worker.sid}`, requestOptions);
  const data = await res.json();
  console.log(data);
  return data;
}
