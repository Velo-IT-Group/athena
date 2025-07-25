// Imports global types
import "@twilio-labs/serverless-runtime-types";
import * as twilio from "twilio";
// Fetches specific types

type Props = {
    client: twilio.Twilio;
    From: string;
    To: string;
    Url: string;
};

exports.notifyWorker = async (parameters: Props) => {
    const { client, From, To, Url } = parameters;
    try {
        const from = From || "+12142148356";
        const to = To || "+14695812252";

        const { phoneNumber } = await client.lookups.v2.phoneNumbers(to)
            .fetch();

        const call = await client.calls.create({ to: phoneNumber, from });

        return `Success! Call SID: ${call.sid}`;
    } catch (error) {
        console.error(error);
        return error;
    }
};
