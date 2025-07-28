import React, { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTaskRouterWorker } from '@/hooks/use-twilio-worker';
import { useTaskRouterVoiceIntegration } from '@/hooks/use-taskrouter-voice-integration';
import {
	Loader2,
	PhoneCall,
	PhoneOff,
	AlertCircle,
	CheckCircle,
	XCircle,
} from 'lucide-react';
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from '@/components/ui/sidebar';
import ReservationItem from '@/components/reservation-item';
import {
	createReservationActions,
	createCallActions,
} from '@/components/reservation-item/actions';
import { Call } from '@twilio/voice-sdk';

interface TaskRouterReservationListProps {
	workerToken?: string;
	voiceAccessToken?: string;
	className?: string;
}

const TaskRouterReservationList = ({
	workerToken,
	voiceAccessToken,
	className,
}: TaskRouterReservationListProps) => {
	const {
		worker,
		isConnected,
		isLoading: workerLoading,
		error: workerError,
	} = useTaskRouterWorker({
		workerToken,
		enabled: !!workerToken,
	});

	const {
		reservationsWithCalls,
		orphanedCalls,
		isLoading: integrationLoading,
		error: integrationError,
		voiceReady,
		acceptReservation, // Smart accept handler
		rejectReservation, // Smart reject handler
		acceptCall,
		rejectCall,
		hangupCall,
		muteCall,
		conferenceReservation,
		transferReservation,
		completeReservation,
		autoConference,
	} = useTaskRouterVoiceIntegration({
		worker,
		voiceAccessToken,
		enabled: isConnected,
		autoConference: true,
	});

	const [mutedCalls, setMutedCalls] = useState<Set<string>>(new Set());
	const [expandedReservations, setExpandedReservations] = useState<Set<string>>(new Set());

	// Remove the old handlers and use the smart ones from the hook
	const handleMuteToggle = (callSid: string) => {
		const isMuted = mutedCalls.has(callSid);
		console.log(isMuted)
		muteCall(callSid,false);

		setMutedCalls((prev) => {
			const updated = new Set(prev);
			if (isMuted) {
				updated.delete(callSid);
			} else {
				updated.add(callSid);
			}
			return updated;
		});
	};

	const toggleReservationExpanded = (reservationSid: string) => {
		setExpandedReservations((prev) => {
			const updated = new Set(prev);
			if (updated.has(reservationSid)) {
				updated.delete(reservationSid);
			} else {
				updated.add(reservationSid);
			}
			return updated;
		});
	};

	const handleTransferReservation = async (reservationSid: string) => {
		const targetWorkerSid = prompt('Enter target worker SID:');
		if (targetWorkerSid) {
			await transferReservation(reservationSid, targetWorkerSid);
		}
	};

	const handleCompleteReservation = async (reservationSid: string) => {
		await completeReservation(reservationSid);
	};

	if (workerLoading || integrationLoading) {
		return (
			<SidebarGroup className={className}>
				<SidebarGroupContent>
					<SidebarMenu>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Loader2 className='size-4 animate-spin' />
									{workerLoading
										? 'Connecting to TaskRouter...'
										: 'Loading Reservations...'}
								</CardTitle>
							</CardHeader>
						</Card>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	}

	if (workerError || integrationError) {
		return (
			<SidebarGroup className={className}>
				<SidebarGroupContent>
					<SidebarMenu>
						<Card>
							<CardHeader>
								<CardTitle className='text-destructive flex items-center gap-2'>
									<AlertCircle className='size-4' />
									TaskRouter Error
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-sm text-muted-foreground'>
									{workerError?.message ||
										integrationError?.message ||
										'Failed to connect to TaskRouter'}
								</p>
							</CardContent>
						</Card>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	}

	return (
		<>
			{reservationsWithCalls.length > 0 && <SidebarGroup className={className}>
				<SidebarGroupLabel>Active Engagements</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						<Card>
							<CardContent className='space-y-2'>
								{!reservationsWithCalls ||
								reservationsWithCalls.length === 0 ? (
									<div className='text-center py-6'>
										<p className='text-sm text-muted-foreground'>
											No active reservations
										</p>
									</div>
								) : (
									<div className='space-y-3'>
										{reservationsWithCalls.map(
											({
												reservation,
												call,
												hasActiveCall,
												isVoiceReservation,
											}) => {
												const isExpanded =
													expandedReservations.has(
														reservation.sid
													);
												const isMuted = call
													? mutedCalls.has(
															call.parameters
																.CallSid
														)
													: false;

												const reservationActions =
													createReservationActions({
														reservation,
														isVoiceReservation,
														onAccept:
															acceptReservation,
														onReject:
															rejectReservation,
														onConference:
															conferenceReservation,
														onTransfer:
															handleTransferReservation,
														onComplete:
															handleCompleteReservation,
													});

												const callActions = call
													? createCallActions({
															call,
															isMuted,
															onAcceptCall:
																acceptCall,
															onRejectCall:
																rejectCall,
															onHangupCall:
																hangupCall,
															onMuteToggle:
																handleMuteToggle,
														})
													: [];

												// Enhanced additional info
												const additionalInfo =
													isExpanded ? (
														<div className='space-y-1'>
															<div>
																Worker:{' '}
																{
																	reservation.workerSid
																}
															</div>
															<div>
																Created:{' '}
																{reservation.dateCreated.toLocaleString()}
															</div>
															{reservation.dateUpdated && (
																<div>
																	Updated:{' '}
																	{reservation.dateUpdated.toLocaleString()}
																</div>
															)}
															<div>
																Status:{' '}
																{
																	reservation.status
																}
															</div>
															<div>
																Type:{' '}
																{isVoiceReservation
																	? 'Voice'
																	: 'Non-Voice'}
															</div>
															{call && (
																<>
																	<div>
																		Call
																		SID:{' '}
																		{
																			call
																				.parameters
																				.CallSid
																		}
																	</div>
																	<div>
																		Call
																		Direction:{' '}
																		{
																			call
																				.parameters
																				.direction
																		}
																	</div>
																	<div>
																		Call
																		Status:{' '}
																		{call.status()}
																	</div>
																	{call.isMuted &&
																		call.isMuted() && (
																			<div className='text-xs text-red-600'>
																				Call
																				is
																				muted
																			</div>
																		)}
																</>
															)}
															{autoConference &&
																isVoiceReservation && (
																	<div className='text-xs text-green-600'>
																		Auto-conferencing
																		enabled
																		for
																		voice
																	</div>
																)}
															{reservation.status ===
																'wrapping' && (
																<div className='text-xs text-amber-600 font-medium'>
																	Reservation
																	ready for
																	completion
																</div>
															)}
														</div>
													) : null;

												return (
													<ReservationItem
														key={reservation.sid}
														reservation={
															reservation
														}
														call={call}
														hasActiveCall={
															hasActiveCall
														}
														isVoiceReservation={
															isVoiceReservation
														}
														isExpanded={isExpanded}
														onToggleExpanded={() =>
															toggleReservationExpanded(
																reservation.sid
															)
														}
														reservationActions={
															reservationActions
														}
														callActions={
															callActions
														}
														additionalInfo={
															additionalInfo
														}
														// Pass all call control functions
														onAcceptCall={
															acceptCall
														}
														onRejectCall={
															rejectCall
														}
														onHangupCall={
															hangupCall
														}
														onMuteCall={muteCall}
														onUnmuteCall={(
															callSid
														) =>
															muteCall(
																callSid,
																false
															)
														}
														isMuted={isMuted}
													/>
												);
											}
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>}

			{orphanedCalls.length > 0 &&  <SidebarGroup className={className}>
				<SidebarGroupLabel>Pending Engagements</SidebarGroupLabel>

				<SidebarGroupContent>
					<SidebarMenu>
						<Card>
							<CardContent className='space-y-2'>
								{/* Only show truly orphaned calls that have no reservation */}
								{orphanedCalls.length > 0 && (
									<div>
										<h4 className='text-sm font-medium mb-2 text-amber-600'>
											Unmatched Active Calls
										</h4>
										<div className='text-xs text-muted-foreground mb-2'>
											These calls don't have corresponding
											TaskRouter reservations
										</div>
										{orphanedCalls.map((call) => {
											console.log(
												call.status() ===
													Call.State.Pending
											);
											return (
												<div
													key={
														call.parameters.CallSid
													}
													className='flex items-center justify-between p-2 border rounded bg-amber-50'
												>
													<div className='text-xs'>
														<div>
															Call from:{' '}
															{
																call.parameters
																	.From
															}
														</div>
														<div>
															Status:{' '}
															{call.status()}
														</div>
														<div>
															Direction:{' '}
															{call.parameters
																.direction ||
																'inbound'}
														</div>
													</div>
													<div className='flex gap-1'>
														{call.status() ===
															Call.State
																.Pending && (
															<>
																<Button
																	size='sm'
																	onClick={() =>
																		acceptCall(
																			call
																				.parameters
																				.CallSid
																		)
																	}
																>
																	Answer
																</Button>
																<Button
																	size='sm'
																	variant='destructive'
																	onClick={() =>
																		rejectCall(
																			call
																				.parameters
																				.CallSid
																		)
																	}
																>
																	Decline
																</Button>
															</>
														)}
														{call.status() ===
															'open' && (
															<Button
																size='sm'
																variant='destructive'
																onClick={() =>
																	hangupCall(
																		call
																			.parameters
																			.CallSid
																	)
																}
															>
																Hang Up
															</Button>
														)}
													</div>
												</div>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>}

			{/* <CardHeader>
								<CardTitle className='flex items-center justify-between'>
									TaskRouter Reservations
									{autoConference && (
										<Badge variant='outline' className='text-xs'>
											Auto-Conference ON
										</Badge>
									)}
								</CardTitle>

								<CardDescription className='flex items-center gap-2'>
									{isConnected ? (
										<Badge
											variant='default'
											className='text-xs'
										>
											<CheckCircle className='size-3 mr-1' />
											Connected
										</Badge>
									) : (
										<Badge
											variant='destructive'
											className='text-xs'
										>
											<XCircle className='size-3 mr-1' />
											Disconnected
										</Badge>
									)}
									{voiceReady ? (
										<Badge
											variant='default'
											className='text-xs'
										>
											<PhoneCall className='size-3 mr-1' />
											Voice Ready
										</Badge>
									) : (
										<Badge
											variant='outline'
											className='text-xs'
										>
											<PhoneOff className='size-3 mr-1' />
											Voice Offline
										</Badge>
									)}

									<Badge
										variant='outline'
										className='ml-2'
									>
										{reservationsWithCalls?.length || 0}
									</Badge>
								</CardDescription>
							</CardHeader> */}
		</>
	);
};

export default TaskRouterReservationList;
