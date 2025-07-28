import { ChevronLeft, Loader2, Play, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grip, Mic, MicOff, Pause, Phone, PhoneForwarded, Video } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Keypad } from '@/components/keypad';
import { useWorker, type Engagement } from '@/providers/worker-provider';
import { useConference } from '@/hooks/use-conference';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TransferEngagementTab from '@/components/engagement-tabs/transfer-engagement-tab';

interface Props {
	engagement: Engagement;
	accessToken: string;
}

const VoiceEngagement = ({ engagement, accessToken }: Props) => {
	const { handleWrapup } = useWorker();
	const { call } = engagement;

	const [isLocalParticipantMuted, setIsLocalParticipantMuted] = useState<boolean>(false);
	// const query = getTaskQuery(engagement.task?.sid ?? '');

	// const { data: task } = useQuery({
	// 	...query,
	// 	refetchInterval: (query) => {
	// 		if (!query.state.data) return 2000;

	// 		const parsedAttributes = JSON.parse(query.state.data.attributes);

	// 		const conference = parsedAttributes.conference;

	// 		return conference === undefined ? 2000 : false;
	// 	},
	// });

	const parsedAttributes =
		typeof engagement.task?.attributes === 'string'
			? JSON.parse(engagement.task?.attributes)
			: engagement.task?.attributes;

	const conference = parsedAttributes.conference;

	// const call = calls.find((c) => c.parameters.CallSid === conference.participants.worker);

	// useEffect(() => {
	// 	engagement?.call?.on('mute', (muted) => {
	// 		setIsLocalParticipantMuted(muted);
	// 	});
	// }, [engagement.call]);

	const tabs = useMemo(() => ['buttons', 'transfer', 'keypad'], []);
	const [tab, setTab] = useState(tabs[0]);

	const { participants, updateParticipant, createParticipant, handleParticipantRemoval } = useConference({
		sid: conference?.sid ?? '',
	});

	const remoteParticipants = useMemo(
		() => participants?.filter((p) => p.callSid !== conference.participants.worker),
		[participants, engagement.task]
	);

	return (
		<Tabs
			orientation='vertical'
			className='h-full items-center justify-start py-6'
			onValueChange={setTab}
			value={tab}
		>
			<TabsContent
				value='buttons'
				className='flex flex-col items-center justify-start gap-6'
			>
				{remoteParticipants && remoteParticipants.length === 1 ? (
					<>
						{remoteParticipants.map((participant) => (
							<TabsList
								key={participant.callSid}
								className='bg-transparent border-none h-fit grid grid-cols-3 gap-6'
							>
								<div className='flex flex-col items-center gap-1.5'>
									<Button
										variant='secondary'
										size='icon'
										className='rounded-full size-12'
										onClick={() => engagement.call?.mute(!isLocalParticipantMuted)}
									>
										{isLocalParticipantMuted ? (
											<MicOff className='size-5' />
										) : (
											<Mic className='size-5' />
										)}
									</Button>
									<p className='text-xs'>Mute</p>
								</div>

								<TabsTrigger
									value='keypad'
									asChild
								>
									<div className='flex flex-col items-center gap-1.5'>
										<Button
											variant='secondary'
											size='icon'
											className='rounded-full size-12'
										>
											<Grip className='size-5' />
										</Button>
										<p className='text-xs'>Keypad</p>
									</div>
								</TabsTrigger>

								<div className='flex flex-col items-center gap-1.5'>
									<Button
										variant='secondary'
										size='icon'
										className='rounded-full size-12'
										disabled={!engagement.task?.attributes.conference}
										onClick={() =>
											updateParticipant.mutate({
												participantSid: participant.callSid,
												options: {
													hold: !participant.hold,
												},
											})
										}
									>
										{updateParticipant.isPending &&
										updateParticipant.variables?.participantSid === participant.callSid &&
										updateParticipant.variables?.options.hold ? (
											<Loader2 className='size-5 animate-spin' />
										) : (
											<>
												{participant.hold ? (
													<Play className='size-5' />
												) : (
													<Pause className='size-5' />
												)}
											</>
										)}
									</Button>
									<p className='text-xs'>{participant.hold ? 'Resume' : 'Hold'}</p>
								</div>

								<TabsTrigger
									value='transfer'
									asChild
								>
									<div className='flex flex-col items-center gap-1.5'>
										<Button
											variant='secondary'
											size='icon'
											className='rounded-full size-12'
										>
											<PhoneForwarded className='size-5' />
										</Button>
										<p className='text-xs'>Transfer</p>
									</div>
								</TabsTrigger>

								<div className='flex flex-col items-center gap-1.5'>
									<Button
										variant='secondary'
										size='icon'
										className='rounded-full size-12'
									>
										<Video className='size-5' />
									</Button>
									<p className='text-xs'>Video</p>
								</div>
							</TabsList>
						))}
					</>
				) : (
					<>
						{!conference?.sid || !remoteParticipants ? (
							<div className='bg-transparent border-none h-fit grid grid-cols-3 gap-6'>
								<div className='flex flex-col items-center gap-1.5'>
									<Button
										variant='secondary'
										size='icon'
										className='rounded-full size-12'
										disabled
									>
										{isLocalParticipantMuted ? (
											<MicOff className='size-5' />
										) : (
											<Mic className='size-5' />
										)}
									</Button>
									<p className='text-xs'>Mute</p>
								</div>

								<div className='flex flex-col items-center gap-1.5'>
									<Button
										variant='secondary'
										size='icon'
										className='rounded-full size-12'
										disabled
									>
										<Grip className='size-5' />
									</Button>
									<p className='text-xs'>Keypad</p>
								</div>

								<div className='flex flex-col items-center gap-1.5'>
									<Button
										variant='secondary'
										size='icon'
										className='rounded-full size-12'
										disabled
									>
										<Pause className='size-5' />
									</Button>
									<p className='text-xs'>Hold</p>
								</div>

								<div className='flex flex-col items-center gap-1.5'>
									<Button
										variant='secondary'
										size='icon'
										className='rounded-full size-12'
										disabled
									>
										<PhoneForwarded className='size-5' />
									</Button>
									<p className='text-xs'>Transfer</p>
								</div>

								<div className='flex flex-col items-center gap-1.5'>
									<Button
										variant='secondary'
										size='icon'
										className='rounded-full size-12'
										disabled
									>
										<Video className='size-5' />
									</Button>
									<p className='text-xs'>Video</p>
								</div>
							</div>
						) : (
							<div className='grid grid-cols-2 gap-6'>
								{remoteParticipants.map((participant) => {
									const isCustomer = conference.participants.customer === participant.callSid;

									return (
										<div className='flex flex-col items-center gap-3 px-6'>
											<Avatar className='size-12'>
												<AvatarFallback>
													<User />
												</AvatarFallback>
											</Avatar>

											<p>{isCustomer ? parsedAttributes.name : participant.label}</p>
											{/* <pre>{participant.label ?? conf</pre> */}

											<div className='bg-transparent border-none h-fit grid grid-cols-2 gap-6'>
												<div className='flex flex-col items-center gap-1.5'>
													<Button
														variant='secondary'
														size='icon'
														className='rounded-full size-12'
														onClick={() =>
															updateParticipant.mutate({
																participantSid: participant.callSid,
																options: {
																	muted: !participant.muted,
																},
															})
														}
													>
														{participant.muted ? (
															<MicOff className='size-5' />
														) : (
															<Mic className='size-5' />
														)}
													</Button>
													<p className='text-xs'>{participant.muted ? 'Unmute' : 'Mute'}</p>
												</div>

												<div className='flex flex-col items-center gap-1.5'>
													<Button
														variant='secondary'
														size='icon'
														className='rounded-full size-12'
														// disabled={!!!engagement.task?.attributes.conference}
														onClick={() =>
															updateParticipant.mutate({
																participantSid: participant.callSid,
																options: {
																	hold: !participant.hold,
																},
															})
														}
													>
														{updateParticipant.isPending &&
														updateParticipant.variables?.participantSid ===
															participant.callSid &&
														updateParticipant.variables?.options.hold ? (
															<Loader2 className='size-5 animate-spin' />
														) : (
															<>
																{participant.hold ? (
																	<Play className='size-5' />
																) : (
																	<Pause className='size-5' />
																)}
															</>
														)}
													</Button>
													<p className='text-xs'>{participant.hold ? 'Resume' : 'Hold'}</p>
												</div>

												<div className='col-span-2'>
													<Button
														className='w-full'
														onClick={() =>
															handleParticipantRemoval.mutate({
																participantSid: participant.callSid,
															})
														}
													>
														Remove
													</Button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</>
				)}

				<Button
					variant='destructive'
					size='icon'
					className='rounded-full size-12 col-span-3'
					onClick={() => handleWrapup?.mutate(engagement)}
				>
					<Phone className='size-5 rotate-135' />
				</Button>
			</TabsContent>

			{/* <TransferEngagementTab
				handleParticipantCreation={createParticipant}
				task={engagement.task}
				handleBackClick={() => setTab(tabs[0])}
			/> */}

			<TabsContent value='keypad'>
				<Button
					variant='link'
					className='w-full'
					onClick={() => setTab(tabs[0])}
				>
					<ChevronLeft />
					<span>Back to call</span>
				</Button>

				<Keypad onValueChange={(e) => engagement?.call?.sendDigits(e)} />
			</TabsContent>
		</Tabs>
	);
};

export default VoiceEngagement;
