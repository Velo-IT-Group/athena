import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function Droppable({ children, id }: { children: React.ReactNode; id: string }) {
	const { isOver, setNodeRef } = useDroppable({
		id,
	});
	const style = {
		color: isOver ? 'green' : undefined,
		backgroundColor: isOver ? 'var(--bg-muted)' : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
		>
			{children}
		</div>
	);
}
