import { CommandMenu } from '@/components/command-menu';
import CompanyEngagementTab from '@/components/engagement-tabs/company-enagagement-tab';
import ContactEngagementTab from '@/components/engagement-tabs/contact-engagement-tab';
import EngagementTab from '@/components/engagement-tabs/engagment-tab';
import { InfiniteList } from '@/components/infinite-list';
import { RealtimeChat } from '@/components/realtime-chat';
import Timer from '@/components/timer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceEngagement from '@/components/engagement-tabs/voice-engagement';
import { useWorker } from '@/providers/worker-provider';
import { getDateOffset } from '@/utils/date';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { formatDate } from 'date-fns';
import {
	ArrowLeft,
	ArrowRightToLine,
	ListStart,
	Loader2,
	MessageSquareShare,
	MoreHorizontal,
	Phone,
} from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { z } from 'zod';
import ChatEngagement from '@/components/engagement-tabs/chat-engagement';
import type { User } from '@supabase/supabase-js';
import { ScrollArea } from '@/components/ui/scroll-area';
import Tiptap from '@/components/tip-tap';

const schema = z.object({
	edit: z.boolean().optional(),
});

export const Route = createFileRoute('/_authed/engagements/$sid')({
	component: RouteComponent,
	validateSearch: zodValidator(schema),
});

const tabs = ['Company', 'Contact', 'Engagement', 'History'];

function RouteComponent() {
	const { sid } = Route.useParams();
	const { accessToken, user } = Route.useRouteContext();

	const { engagements, handleComplete, handleWrapup } = useWorker();
	const engagement = engagements.find((engagement) => engagement.task?.sid === sid);

	if (!engagement) {
		throw new Error('Engagement not found');
	}

	if (!engagement.task) {
		throw new Error('Task not found');
	}

	if (!engagement.reservation) {
		throw new Error('Reservation not found');
	}

	const { task, reservation } = engagement;

	const parsedAttributes = useMemo(() => task?.attributes, [task?.attributes]);

	const offsetTimestamp = useMemo(
		() => getDateOffset(task?.dateUpdated ? new Date(task?.dateUpdated) : new Date()),
		[task?.dateUpdated]
	);

	const taskChannel = useMemo(() => task?.taskChannelUniqueName, [task?.taskChannelUniqueName]);

	return (
		<main className='grid grid-cols-[4fr_5fr]'>
			<div className='border-r flex flex-col h-[calc(100svh-var(--navbar-height))]'>
				<header className='flex items-center justify-between p-3 border-b'>
					<Button
						variant='ghost'
						size='icon'
					>
						<MessageSquareShare />
					</Button>

					<div className='text-center'>
						<h1 className='text-lg font-semibold'>{parsedAttributes?.name}</h1>
						<p className='text-sm text-muted-foreground flex items-center gap-1.5'>
							<span>{task?.queueName}</span>{' '}
							<Timer stopwatchSettings={{ autoStart: true, offsetTimestamp }} />
						</p>
					</div>

					<Button
						variant={reservation.status === 'wrapping' ? 'destructive' : 'default'}
						disabled={handleWrapup?.isPending || handleComplete?.isPending}
						onClick={() => {
							if (reservation.status === 'accepted') {
								handleWrapup?.mutate(engagement);
							} else if (reservation.status === 'wrapping') {
								handleComplete?.mutate(engagement);
							}
						}}
					>
						{(handleWrapup?.isPending || handleComplete?.isPending) && <Loader2 className='animate-spin' />}
						<span>End</span>
					</Button>
				</header>

				{reservation.status === 'wrapping' ? (
					<div className='p-6 space-y-6'>
						<h2 className='text-xl font-semibold'>Wrapup Notes</h2>

						<div className='w-full border rounded-lg'>
							<Tiptap
								placeholder='Add notes...'
								className='min-h-48'
								onBlur={({ editor }) => {
									editor.getJSON();
								}}
							/>
						</div>

						<Button
							className='w-full'
							onClick={() => handleComplete?.mutate(reservation)}
						>
							Complete
						</Button>
					</div>
				) : (
					<>
						{taskChannel === 'voice' && (
							<VoiceEngagement
								engagement={engagement}
								accessToken={accessToken}
							/>
						)}

						{['chat', 'sms'].includes(taskChannel) && (
							<ChatEngagement
								engagement={engagement}
								user={user as User}
								accessToken={accessToken}
							/>
						)}
					</>
				)}
				{/* <section className='flex flex-col items-center space-y-6'>
				</section> */}
			</div>

			<ScrollArea className='h-[calc(100svh-var(--navbar-height))]'>
				<div className='container mx-auto p-6 flex flex-col items-center w-full '>
					<Tabs
						defaultValue={
							parsedAttributes.contact ? 'Contact' : parsedAttributes.company ? 'Company' : 'Engagement'
						}
						className='w-full gap-3'
					>
						<TabsList className='mx-auto'>
							{tabs.map((tab) => (
								<TabsTrigger
									key={tab}
									value={tab}
								>
									{tab}
								</TabsTrigger>
							))}
						</TabsList>

						<TabsContent
							value='Company'
							asChild
						>
							<Suspense fallback={<div>Loading...</div>}>
								<CompanyEngagementTab id={parsedAttributes?.companyId ?? 43460} />
							</Suspense>
						</TabsContent>

						<TabsContent
							value='Contact'
							asChild
						>
							<Suspense
								fallback={
									<div className='flex flex-col gap-3'>
										<div className='flex items-center gap-3'>
											<Skeleton className='size-12 shrink-0 rounded-full' />
											<Skeleton className='h-6 w-full' />
										</div>
										{Array.from({ length: 5 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-full'
											/>
										))}
										{Array.from({ length: 4 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-4/5'
											/>
										))}
										{Array.from({ length: 3 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-3/5'
											/>
										))}
										{Array.from({ length: 2 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-2/5'
											/>
										))}
										{Array.from({ length: 1 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-1/5'
											/>
										))}
									</div>
								}
							>
								<ContactEngagementTab id={parsedAttributes?.contactId ?? 32569} />
							</Suspense>
						</TabsContent>

						<TabsContent
							value='Engagement'
							asChild
						>
							<EngagementTab />
						</TabsContent>

						<TabsContent
							value='History'
							className='space-y-3'
						>
							<h2 className='text-2xl font-semibold'>History</h2>
							<InfiniteList
								tableName='engagements'
								renderItem={(item) => (
									<li
										key={item.id}
										className='relative flex gap-3 group mt-3 first:mt-0'
									>
										<div className='absolute top-0 -bottom-6 left-0 flex w-6 justify-center'>
											<div className='w-[1px] group-last:hidden bg-muted-foreground' />
										</div>

										<div className='relative flex size-6 flex-none items-center justify-center bg-background'>
											<div className='size-1.5 rounded-full bg-muted-foreground'>
												{/* {item.contact?.id} */}
											</div>
										</div>

										<Card className='w-full'>
											<CardContent className='flex items-start gap-6'>
												<time
													dateTime={item.date}
													className='flex-none px-0.5 text-xs text-muted-foreground'
												>
													{item.date && formatDate(new Date(item.date), 'hh:mm:ss b')}
												</time>

												<div>
													<h3 className='font-semibold'>Agent Outbound</h3>
													<p>Channel Type: sms</p>
													<p>Agent: Ana Agent</p>
												</div>
											</CardContent>
										</Card>
										<p className='flex-auto py-0.5 text-xs text-muted-foreground leading-5'></p>
										{/* <span className='text-foreground font-medium'>{user}</span>

										{isVoicemail ? (
											<span> left a voicemail</span>
										) : (
											<span>
												{' '}
												talked to <span className='text-foreground font-medium'>
													{agent}
												</span>{' '}
												for {minutes}m {seconds}s
											</span>
										)}
									</p>
									<time
										dateTime={conversation.date}
										className='flex-none px-0.5 text-xs text-muted-foreground'
									>
										{conversation.date && relativeDate(new Date(conversation.date))} */}
										{/* </time> */}
									</li>
								)}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</ScrollArea>

			<CommandMenu
				sections={[
					{
						heading: 'Duo',
						items: [
							{
								icon: (
									<img
										src='/duo-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Send duo prompt...',
								value: 'send-duo-prompt',
								action: () => {},
							},
						],
					},
					{
						heading: 'Timezest',
						items: [
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Schedule onsite appointment (1 hour)...',
								value: 'schedule-onsite-appointment',
								action: () => {},
							},
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Schedule phone call (1 hour)...',
								value: 'schedule-phone-call',
								action: () => {},
							},
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Schedule phone call (30 minutes)...',
								value: 'schedule-phone-call-30-minutes',
								action: () => {},
							},
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Strength meeting (1 hour)...',
								value: 'strength-meeting',
								action: () => {},
							},
						],
					},
				]}
			/>
		</main>
	);
}
