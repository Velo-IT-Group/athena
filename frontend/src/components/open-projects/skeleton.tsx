import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Box } from 'lucide-react';

const OpenProjectsSkeleton = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-base font-medium leading-none'>Open Projects</CardTitle>
			</CardHeader>

			<Card className='flex flex-col'>
				<CardHeader>
					<CardTitle>
						<Box className='inline-block mr-1.5' /> Open Projects
					</CardTitle>
				</CardHeader>

				<CardContent className='space-y-[2ch]'>
					<div className='flex items-center'>
						<Skeleton />

						<Progress
							value={0}
							className='ml-auto w-full max-w-24'
						/>
					</div>

					<div className='flex items-center'>
						<Skeleton />

						<Progress
							value={0}
							className='ml-auto w-full max-w-24'
						/>
					</div>

					<div className='flex items-center'>
						<Skeleton />

						<Progress
							value={0}
							className='ml-auto w-full max-w-24'
						/>
					</div>
				</CardContent>
			</Card>
		</Card>
	);
};

export default OpenProjectsSkeleton;
