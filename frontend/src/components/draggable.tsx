import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function Draggable({ children, id }: { children: React.ReactNode; id: string }) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id,
	});
	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
		  }
		: undefined;

	return (
		<button
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
		>
			{children}
		</button>
	);
}
