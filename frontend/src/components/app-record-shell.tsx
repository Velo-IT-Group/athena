import RecordDetail, { RecordDetailProps } from '@/components/record-detail';
import TabsList from '@/components/tabs-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
	Editable,
	EditableInput,
	EditablePreview,
	EditableRootProps,
} from '@/components/ui/editable';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { NavSection } from '@/types/nav';
import { Outlet } from '@tanstack/react-router';
import {
	FilePlus,
	ImagePlus,
	MailPlus,
	Phone,
	Star,
	Workflow,
} from 'lucide-react';

type Props = {
	editable?: EditableRootProps;
	details: RecordDetailProps[];
	tabs: NavSection[];
	children: React.ReactNode;
};

const AppRecordShell = ({ editable, details, tabs, children }: Props) => {
	return (
		<div className='flex flex-col w-full h-[calc(100vh-var(--navbar-height))]'>
			<div className='py-[10px] px-[12px] flex justify-between items-center gap-10 border-b'>
				<div className='flex items-center justify-start min-w-[300px] gap-0'>
					<div className='flex items-center justify-start gap-1.5'>
						<Avatar className='size-7'>
							<AvatarFallback>V</AvatarFallback>
							<AvatarImage
								className='size-7'
								src='https://img.logo.dev/velomethod.com?token=pk_We89CNc6T1-QRD4CkOUhww'
							/>
						</Avatar>

						<Editable
							autosize
							{...editable}
						>
							<EditablePreview
								className={buttonVariants({
									variant: 'ghost',
									className: 'px-[4px] py-[6px]',
								})}
							/>

							<EditableInput className='px-[4px] py-[6px] text-[16px] font-medium h-9 border-none' />
							{/* <div className='flex items-center gap-1.5'>
									<Input
										// className='px-[4px] py-[6px] text-[16px] font-semibold h-9'
										className='sm:w-fit'
										defaultValue={contact?.firstName}
									/>
									<Input
										// className='px-[4px] py-[6px] text-[16px] font-semibold h-9'
										className='sm:w-fit'
										defaultValue={contact?.lastName}
									/>
								</div>
							</EditableInput> */}
						</Editable>
					</div>

					<Button
						size='icon'
						variant='ghost'
					>
						<Star size={14} />
					</Button>
				</div>

				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='sm'
					>
						<MailPlus />
						<span>Compose email</span>
					</Button>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<MailPlus />
								<span className='sr-only'>Add to list</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Add to list</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
								// onClick={() =>
								// 	navigate({
								// 		// to: '/',
								// 		search: {
								// 			modal: 'note',
								// 			id: contact?.id?.toString(),
								// 		},
								// 	})
								// }
							>
								<FilePlus />
								<span className='sr-only'>New note</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>New note</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<Workflow />
								<span className='sr-only'>Run to workflow</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Run to workflow</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<ImagePlus />
								<span className='sr-only'>Add to list</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Add to list</TooltipContent>
					</Tooltip>

					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant='outline'
								size='sm'
							>
								<Phone />
								<span>Call</span>
							</Button>
						</DialogTrigger>
					</Dialog>
				</div>
			</div>

			<div className='flex flex-[1_1_auto]'>
				<div className='flex flex-[1_1_auto] min-w-[350px] w-[61.803%]'>
					<div className='flex-[1_1_auto] flex flex-col min-h-0 overflow-hidden relative pt-2'>
						<TabsList tabs={tabs} />
						<div className='flex flex-[1_1_0%] overflow-hidden'>
							<div className='flex flex-col flex-[1_1_auto] overflow-hidden isolate'>
								<ScrollArea className='flex flex-col h-full w-full overflow-hidden relative'>
									{children}
								</ScrollArea>
							</div>
						</div>
						<div className='absolute top-0 right-0 w-[1px] h-full bg-muted' />
					</div>
				</div>

				<div className='flex flex-[1_1_auto] min-w-[250px] w-[38.197%]'>
					<div className='w-full gap-0 flex flex-col items-start justify-start'>
						<TabsList
							tabs={[
								{
									items: [
										{ title: 'Details' },
										{ title: 'Comments' },
									],
								},
							]}
							className='pt-2 w-full'
						/>
						{/* <RecordDetails /> */}
						<div className='flex flex-col w-full overflow-x-hidden overflow-y-auto'>
							<ScrollArea className='flex flex-col w-full h-full overflow-hidden'>
								<div className='flex flex-col items-stretch justify-start gap-0'>
									<div className='mx-3 border-b'>
										{details.map((detail, index) => (
											<RecordDetail
												icon={detail.icon}
												title={detail.title}
												value={detail.value}
												key={`${detail.title}-${index}`}
											>
												{detail.children}
											</RecordDetail>
										))}
									</div>
								</div>
							</ScrollArea>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AppRecordShell;
