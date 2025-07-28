import { AsyncSelect } from '@/components/ui/async-select';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Contact } from '@/types/manage';
import { createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

export const Route = createFileRoute('/_authed/companies/$id/contacts')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<div className='flex flex-[1_1_0%] overflow-hidden border-r'>
			<div className='flex flex-col flex-[1_1_auto] overflow-hidden isolate'>
				<RecordShellHeader
					title='Contacts'
					createButton={
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									size='sm'
									className='hover:bg-muted'
								>
									<Plus />
									<span>Create Contact</span>
								</Button>
							</PopoverTrigger>

							<PopoverContent
								className='w-80'
								align='end'
								side='bottom'
							>
								<AsyncSelect<Contact>
									fetcher={async () => []}
									getOptionValue={(option) =>
										option.id.toString()
									}
									label='Find a person...'
									renderOption={(option) => (
										<>
											{option.firstName} {option.lastName}
										</>
									)}
								/>
							</PopoverContent>
						</Popover>
					}
				/>
			</div>
		</div>
	);
}

const RecordShellHeader = ({
	title,
	createButton,
}: {
	title: string;
	createButton: React.ReactNode;
}) => {
	return (
		<div className='flex flex-row shrink-0 items-center justify-between h-8 px-5 my-4'>
			<div className='flex flex-row items-center justify-start gap-1'>
				<div className='tracking-tight font-semibold text-base'>
					{title}
				</div>
			</div>

			<div className='flex items-center gap-3'>{createButton}</div>
		</div>
	);
};
