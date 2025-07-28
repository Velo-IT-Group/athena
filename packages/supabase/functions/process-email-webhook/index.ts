// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const twilioHeaders = new Headers();
twilioHeaders.append("Content-Type", "application/x-www-form-urlencoded");
twilioHeaders.append(
  "Authorization",
  "Basic " +
    btoa(
      `${Deno.env.get("TWILIO_ACCOUNT_SID")}:${
        Deno.env.get("TWILIO_AUTH_TOKEN")
      }`,
    ),
);
Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.has("validationToken")) {
    return new Response(url.searchParams.get("validationToken"), {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
  const { value } = await req.json();
  const tokenData = await getToken();
  console.log(tokenData);
  const messages = await Promise.all(
    value.map((event) => getMessage(event, tokenData)),
  );
  console.log(messages);
  if (!messages.length) {
    return new Response("No messages found ", {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const worker = await getOnCallEngineer();
  const attributes = JSON.parse(worker.attributes);
  const phone = attributes.mobile_phone ?? attributes.work_phone;
  console.log(phone);
  const mappedMessages = getMatchingStringForPattern(messages);
  console.log(mappedMessages);
  const urlencoded = new URLSearchParams();
  urlencoded.append("To", phone);
  urlencoded.append(
    "Body",
    mappedMessages.length
      ? mappedMessages.join("\r\n ")
      : messages.join("\r\n "),
  );
  urlencoded.append("From", "+17132312836");
  const requestOptions = {
    method: "POST",
    headers: twilioHeaders,
    body: urlencoded,
  };
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${
      Deno.env.get("TWILIO_ACCOUNT_SID")
    }/Messages.json`,
    requestOptions,
  );
  console.log(await response.json());
  if (!response.ok) {
    return new Response(
      "Failed to send message to Twilio " +
        JSON.stringify(await response.json()),
      {
        statusText: response.statusText,
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
  return new Response("Success", {
    headers: {
      "Content-Type": "application/json",
    },
  });
});
function getMatchingStringForPattern(
  items,
  pattern =
    /(\b.+? is in a .+? state at client:.+?\s{1,2}location:.+?, the last heartbeat was received at .+?\d{1,2}:\d{2}:\d{2} (?:AM|PM))/g,
) {
  return items.map((text) => {
    const match = text.match(pattern);
    if (!match) {
      console.log("No match found for text: ", text);
      return "";
    }
    return match[0];
  });
}
async function getToken() {
  const tokenValues = new URLSearchParams();
  tokenValues.append("client_id", Deno.env.get("AUTH_AZURE_CLIENT_ID"));
  tokenValues.append("scope", "https://graph.microsoft.com/.default");
  tokenValues.append("client_secret", Deno.env.get("AUTH_AZURE_SECRET"));
  tokenValues.append("grant_type", "client_credentials");
  const tokenRequestOptions = {
    method: "POST",
    body: tokenValues,
  };
  const tokenResponse = await fetch(
    `${Deno.env.get("AUTH_AZURE_TENANT_URL")}/oauth2/v2.0/token`,
    tokenRequestOptions,
  );
  const tokenData = await tokenResponse.json();
  return tokenData;
}
async function getMessage(value, token) {
  const messageResourceResponse = await fetch(
    `https://graph.microsoft.com/v1.0/${value.resource}`,
    {
      method: "GET",
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    },
  );
  const messageResource = await messageResourceResponse.json();
  return messageResource.bodyPreview;
}
async function getOnCallEngineer() {
  const workersResponse = await fetch(
    "https://taskrouter.twilio.com/v1/Workspaces/WSbab28e824e653470a49ed743e54d10c0/Workers?TargetWorkersExpression=on_call = true",
    {
      headers: twilioHeaders,
    },
  );
  const { workers } = await workersResponse.json();
  if (!workers.length) {
    throw new Error("No workers found");
  }
  return workers[0];
}
