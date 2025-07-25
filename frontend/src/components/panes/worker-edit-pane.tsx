import { MinusCircle, PlusCircle, type LucideIcon } from 'lucide-react';

import { SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { ScrollArea } from '@/components/ui/scroll-area';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getWorkerQuery } from '@/lib/twilio/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const WorkerEditPane = ({ id }: { id: string }) => {
	const { data: worker } = useSuspenseQuery(getWorkerQuery(id));

	const attributes = JSON.parse(worker.attributes);

	return (
		<>
			<SheetHeader className='flex flex-row items-center justify-start gap-3 space-y-0 h-16'>
				<SheetTitle className='shrink-0'>
					{attributes.full_name}
				</SheetTitle>
			</SheetHeader>

			<ScrollArea className='h-[calc(100vh-64px)] px-6'>
				<div className='space-y-6 px-3'>
					{/* <p className='text-muted-foreground text-sm'>Activity Logs</p> */}

					<div className='space-y-3'>
						{Object.entries(attributes).map(([key, value]) => (
							<div key={key}>
								<Label>{key}</Label>
								<div className='flex items-center gap-3'>
									<Input defaultValue={value} />

									<Button
										variant='outline'
										size='icon'
									>
										<PlusCircle />
									</Button>

									<Button
										variant='outline'
										size='icon'
									>
										<MinusCircle />
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			</ScrollArea>
		</>
	);
};
