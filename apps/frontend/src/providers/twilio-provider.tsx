import DiscoBall from '@/components/disco-ball';
import { useContext, useState, createContext, useCallback } from 'react';
import { Workspace } from 'twilio-taskrouter';
interface TwilioProviderProps {
	workspace: Workspace | undefined;
	token: string;
	setShowDiscoBall: (show: boolean) => void;
	hasAcknowledged: boolean;
	setHasAcknowledged: (show: boolean) => void;
	toggleDiscoBall: () => void;
}

const initialValues: TwilioProviderProps = {
	workspace: undefined,
	token: '',
	setShowDiscoBall: () => {},
	hasAcknowledged: false,
	setHasAcknowledged: () => {},
	toggleDiscoBall: () => {},
};

interface WithChildProps {
	accountSid?: string;
	authToken: string;
	workspaceSid?: string;

	children: React.ReactNode;
}

const context = createContext(initialValues);
const { Provider } = context;

export const TwilioProvider = ({ authToken, workspaceSid, children }: WithChildProps) => {
	const [showDiscoBall, setShowDiscoBall] = useState(false);
	const [hasAcknowledged, setHasAcknowledged] = useState(false);
	const workspace = new Workspace(authToken, {}, workspaceSid);

	const toggleDiscoBall = useCallback(() => {
		setShowDiscoBall(!showDiscoBall);
	}, [showDiscoBall]);

	const values = {
		workspace,
		token: authToken,
		setShowDiscoBall,
		hasAcknowledged,
		setHasAcknowledged,
		toggleDiscoBall,
	};

	return (
		<Provider value={values}>
			{children}
			{showDiscoBall && <DiscoBall />}
		</Provider>
	);
};

export const useTwilio = () => {
	const state = useContext(context);

	return state;
};
