// import Twilio from "twilio";
const AccessToken = require("twilio").jwt.AccessToken;

import { createIsomorphicFn, createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import z from "zod";
import { env } from "@/lib/utils";

createIsomorphicFn().client(() => {
	// import Twilio from "twilio";
	return require("twilio");
});

export const createAccessToken = createServerFn()
	.validator(
		z.object({
			identity: z.string(),
			workerSid: z.string(),
		}),
	)
	.handler(async ({ data: { workerSid, identity } }) => {
		const request = getWebRequest();

		console.log(request);

		// const AccessToken = Twilio.jwt.AccessToken;
		const VoiceGrant = AccessToken.VoiceGrant;
		const TaskRouterGrant = AccessToken.TaskRouterGrant;
		const SyncGrant = AccessToken.SyncGrant;
		const ChatGrant = AccessToken.ChatGrant;
		const accountSid = env.VITE_TWILIO_ACCOUNT_SID;
		const signingKeySid = env.VITE_TWILIO_API_KEY_SID;
		const signingKeySecret = env.VITE_TWILIO_API_KEY_SECRET;
		const workspaceSid = env.VITE_TWILIO_WORKSPACE_SID;

		const taskRouterGrant = new TaskRouterGrant({
			workerSid,
			workspaceSid,
			role: "supervisor",
		});

		const voiceGrant = new VoiceGrant({
			incomingAllow: true,
			outgoingApplicationSid: "APaa15f84ec7888db4475dfc490016cd94",
		});

		const syncGrant = new SyncGrant({
			serviceSid: env.VITE_TWILIO_SYNC_SID,
		});

		const chatGrant = new ChatGrant({
			serviceSid: env.VITE_TWILIO_CHAT_SID,
		});

		const accessToken = new AccessToken(
			accountSid,
			signingKeySid,
			signingKeySecret,
			{
				identity,
				ttl: 7200, // 2 hours in seconds
				// ttl: 30, // 30 seconds
			},
		);

		accessToken.addGrant(taskRouterGrant);
		accessToken.addGrant(voiceGrant);
		accessToken.addGrant(syncGrant);
		accessToken.addGrant(chatGrant);

		return accessToken.toJwt();
	});
