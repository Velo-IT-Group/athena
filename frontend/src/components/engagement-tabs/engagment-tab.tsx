import Tiptap from '@/components/tip-tap';
import { Button } from '@/components/ui/button';
import React from 'react';

type Props = {};

const EngagementTab = (props: Props) => {
	return (
		<div className='space-y-3'>
			<h2 className='text-2xl font-semibold'>Engagement</h2>
			<div className='flex items-center'></div>

			<h3 className='text-lg font-medium'>Add Note</h3>
			<div className='border rounded-lg flex flex-col'>
				<Tiptap
					className='min-h-48'
					autofocus
				/>
			</div>

			<div className='flex items-center justify-end gap-3'>
				<Button variant='outline'>Cancel</Button>
				<Button>Save</Button>
			</div>
		</div>
	);
};

export default EngagementTab;
