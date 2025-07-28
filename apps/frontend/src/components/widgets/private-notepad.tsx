'use client';
import { Lock } from 'lucide-react';
import Tiptap from '@/components/tip-tap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WidgetOptions from '@/components/widgets/widget-options';
import useWidget from '@/hooks/use-widget';
import { useCallback } from 'react';
import type { EditorEvents } from '@tiptap/react';

export default function PrivateNotepad() {
	const { halfSize, toggleHalfSize } = useWidget({
		widgetName: 'private-notepad',
	});

	// const handleBlur = useCallback(({ editor }: EditorEvents['blur']) => {
	// 	if (typeof localStorage !== 'undefined') {
	// 		localStorage.setItem('private-notepad', JSON.stringify(editor.getJSON()));
	// 	}
	// }, []);

	return (
		<Card
			className='hover:border-black/25 transition flex flex-col'
			style={{ gridColumn: halfSize ? 'span 1' : 'span 2' }}
		>
			<CardHeader className='flex flex-row items-start justify-start gap-3'>
				<CardTitle className='flex items-center gap-1.5 text-xl'>
					<span>Private notepad</span>

					<Lock />
				</CardTitle>

				<div></div>

				{/* <WidgetOptions
					halfSize={halfSize}
					toggleHalfSize={toggleHalfSize}
				/> */}
			</CardHeader>

			<CardContent className='relative p-0 flex flex-col h-full'>
				<Tiptap
					// content={JSON.parse(localStorage.getItem('private-notepad') ?? '{}')}
					placeholder='Type something...'
					// onBlur={handleBlur}
					className='h-[344px] overflow-y-auto !mx-0'
					editorClassName='min-h-96'
				/>
			</CardContent>
		</Card>
	);
}
