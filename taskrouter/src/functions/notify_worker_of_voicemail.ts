import { Twilio } from "twilio";

type Params = {
	client: Twilio;
	From: string;
	To: string;
	Url: string;
};

exports.notifyWorker = async (parameters: Params) => {
	const { client, From, To, Url } = parameters;
	try {
		const from = From || "+12142148356";
		const to = To || "+14695812252";

		const { phoneNumber } = await client.lookups.v2.phoneNumbers(to)
			.fetch();

		let url =
			`https://handler.twilio.com/twiml/EH0ec07397c5e0fb477e4c535af5a1e245?recording_url=${Url}`;

		const call = await client.calls.create({ to: phoneNumber, from, url });

		return `Success! Call SID: ${call.sid}`;
	} catch (error) {
		console.error(error);
		return error;
	}
};
