import Twilio from "twilio";
import { env } from "../utils";
import { createServerFn } from "@tanstack/react-start";

export const createAccessToken = createServerFn()
	.validator((d: { workerSid: string; identity: string }) =>
		d as { workerSid: string; identity: string }
	)
	.handler(async ({ data: { workerSid, identity } }) => {
		const AccessToken = Twilio.jwt.AccessToken;
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
			// outgoingApplicationSid: env.VITE_TWIL,
			incomingAllow: true, // Optional: add to allow incoming calls
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
				ttl: 36000,
			},
		);

		accessToken.addGrant(taskRouterGrant);
		accessToken.addGrant(voiceGrant);
		accessToken.addGrant(syncGrant);
		accessToken.addGrant(chatGrant);

		return accessToken.toJwt();
	});
