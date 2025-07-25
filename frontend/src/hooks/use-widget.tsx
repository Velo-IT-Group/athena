import React, { useCallback, useEffect, useState } from 'react';

interface Props {
	widgetName: string;
}

const useWidget = ({ widgetName }: Props) => {
	const [halfSize, setHalfSize] = useState(true);

	const toggleHalfSize = useCallback(() => {
		setHalfSize((prev) => !prev);
		localStorage.setItem(`widget-size-${widgetName}`, halfSize ? 'full' : 'half');
	}, [halfSize, widgetName]);

	useEffect(() => {
		if (typeof localStorage !== 'undefined') {
			const widgetSize = localStorage.getItem(`widget-size-${widgetName}`);
			if (widgetSize) {
				setHalfSize(widgetSize === 'half');
			}
		}
	}, [widgetName]);

	return { halfSize, toggleHalfSize };
};

export default useWidget;
