import React from 'react';

export const useOnInteraction = () => {
	const [interacted, setInteracted] = React.useState(false);

	React.useEffect(() => {
		// If interacted, we will skip adding events.
		if (interacted) return;
		// Function to update the state.
		const listener = (): void => {
			setInteracted(true);
		};
		// Events attachment.
		window.addEventListener(`click`, listener);
		window.addEventListener(`touchstart`, listener);

		return () => {
			// Events removal.
			window.removeEventListener(`click`, listener);
			window.removeEventListener(`touchstart`, listener);
		};
	}, [interacted]);

	return interacted;
};
