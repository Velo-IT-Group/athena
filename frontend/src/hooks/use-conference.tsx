import { useState } from 'react';
import type { ConferenceInstance } from 'twilio/lib/rest/api/v2010/account/conference';

type Props = {
	sid: string;
	conference: ConferenceInstance;
};

export const useConference = ({ sid, conference }: Props) => {
	const [isMuted, setIsMuted] = useState(false);

	const toggleMute = () => {
		setIsMuted((prev) => !prev);
	};

	return { isMuted, toggleMute };
};
