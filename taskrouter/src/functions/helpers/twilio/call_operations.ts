// Imports global types
import "@twilio-labs/serverless-runtime-types";
import { Context } from "@twilio-labs/serverless-runtime-types/types";
// Fetches specific types

type Props = {
    context: Context;
    From: string;
    To: string;
    Url: string;
};

exports.notifyWorker = async (parameters: Props) => {
    const { context, From, To, Url } = parameters;
    try {
        const client = context.getTwilioClient();

        const from = From || "+12142148356";
        const to = To || "+14695812252";

        const { phoneNumber } = await client.lookups.phoneNumbers(to).fetch();

        let url =
            `https://handler.twilio.com/twiml/EH0ec07397c5e0fb477e4c535af5a1e245?recording_url=${Url}`;

        const call = await client.calls.create({ to: phoneNumber, from, url });

        return `Success! Call SID: ${call.sid}`;
    } catch (error) {
        console.error(error);
        return error;
    }
};
