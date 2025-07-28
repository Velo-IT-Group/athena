import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Call } from '@twilio/voice-sdk';
import { Reservation } from 'twilio-taskrouter';
import {
	Phone,
	PhoneCall,
	PhoneOff,
	User,
	Clock,
	AlertCircle,
	CheckCircle,
	XCircle,
	Mic,
	MicOff,
	ChevronDown,
	ChevronRight,
	Volume2,
	VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface ReservationAction {
	label: string;
	icon?: React.ReactNode;
	variant?: 'default' | 'accepting' | 'destructive' | 'outline' | 'secondary';
	onClick: () => void;
	disabled?: boolean;
	condition?: boolean;
}

interface ReservationItemProps {
	reservation: Reservation;
	call?: Call;
	hasActiveCall: boolean;
	isVoiceReservation?: boolean;
	isExpanded?: boolean;
	onToggleExpanded?: () => void;
	reservationActions?: ReservationAction[];
	callActions?: ReservationAction[];
	additionalInfo?: React.ReactNode;
	className?: string;
	// Call control functions
	onAcceptCall?: (callSid: string) => void;
	onRejectCall?: (callSid: string) => void;
	onHangupCall?: (callSid: string) => void;
	onMuteCall?: (callSid: string, muted: boolean) => void;
	onUnmuteCall?: (callSid: string) => void;
	isMuted?: boolean;
}

// Status utilities
const getStatusVariant = (status: string) => {
	switch (status.toLowerCase()) {
		case 'pending':
			return 'default';
		case 'accepted':
			return 'accepting';
		case 'rejected':
			return 'destructive';
		case 'timeout':
			return 'secondary';
		case 'canceled':
			return 'outline';
		case 'completed':
			return 'accepting';
		case 'wrapping':
			return 'secondary';
		default:
			return 'default';
	}
};

const getStatusIcon = (status: string) => {
	switch (status.toLowerCase()) {
		case 'pending':
			return <Clock className='size-3' />;
		case 'accepted':
			return <CheckCircle className='size-3' />;
		case 'rejected':
			return <XCircle className='size-3' />;
		case 'timeout':
			return <AlertCircle className='size-3' />;
		case 'completed':
			return <CheckCircle className='size-3' />;
		case 'wrapping':
			return <Clock className='size-3' />;
		default:
			return <Clock className='size-3' />;
	}
};

// Sub-components
const ReservationHeader = ({
	reservation,
	hasActiveCall,
	isExpanded,
	onToggleExpanded,
}: {
	reservation: Reservation;
	hasActiveCall: boolean;
	isExpanded?: boolean;
	onToggleExpanded?: () => void;
}) => (
	<div className='flex items-center justify-between'>
		<div className='flex items-center gap-2'>
			<Badge
				variant={getStatusVariant(reservation.status)}
				className='capitalize'
			>
				{getStatusIcon(reservation.status)}
				{reservation.status}
			</Badge>
			<Badge
				variant='outline'
				className='text-xs'
			>
				{reservation.task?.taskChannelUniqueName}
			</Badge>
			{reservation.task?.priority && (
				<Badge
					variant='secondary'
					className='text-xs'
				>
					Priority: {reservation.task.priority}
				</Badge>
			)}
			{hasActiveCall && (
				<Badge
					variant='default'
					className='text-xs'
				>
					<PhoneCall className='size-3 mr-1' />
					Active Call
				</Badge>
			)}
		</div>
		{onToggleExpanded && (
			<Button
				variant='ghost'
				size='sm'
				onClick={onToggleExpanded}
				className='h-auto p-1'
			>
				{isExpanded ? (
					<ChevronDown className='size-3' />
				) : (
					<ChevronRight className='size-3' />
				)}
			</Button>
		)}
	</div>
);

const ReservationDetails = ({
	reservation,
	call,
	isVoiceReservation,
	additionalInfo,
}: {
	reservation: Reservation;
	call?: Call;
	isVoiceReservation: boolean;
	additionalInfo?: React.ReactNode;
}) => (
	<div className='text-xs text-muted-foreground space-y-1'>
		<div>Task: {reservation.task?.sid}</div>

		{/* For voice reservations with calls, show call info prominently */}
		{isVoiceReservation && call ? (
			<>
				<div className='flex items-center gap-1'>
					<Phone className='size-3' />
					{call.parameters.From || reservation.task?.attributes?.from}
					{call.parameters.direction && (
						<Badge
							variant='outline'
							className='text-xs ml-1'
						>
							{call.parameters.direction}
						</Badge>
					)}
				</div>
				<div className='flex items-center gap-1'>
					<Badge
						variant={
							call.status() === 'ringing'
								? 'default'
								: call.status() === 'open'
									? 'accepting'
									: 'secondary'
						}
						className='text-xs'
					>
						Call: {call.status()}
					</Badge>
				</div>
			</>
		) : (
			/* For non-voice or reservations without calls, show standard info */
			reservation.task?.attributes?.from && (
				<div className='flex items-center gap-1'>
					<Phone className='size-3' />
					{reservation.task.attributes.from}
				</div>
			)
		)}

		{reservation.task?.attributes?.customer_name && (
			<div className='flex items-center gap-1'>
				<User className='size-3' />
				{reservation.task.attributes.customer_name}
			</div>
		)}

		{reservation.task?.age && (
			<div className='flex items-center gap-1'>
				<Clock className='size-3' />
				Age: {Math.floor(reservation.task.age)}s
			</div>
		)}

		{/* Show wrapping state info */}
		{reservation.status === 'wrapping' && (
			<div className='flex items-center gap-1 text-amber-600'>
				<Clock className='size-3' />
				<span className='font-medium'>Wrap-up required</span>
			</div>
		)}

		{additionalInfo && <div className='mt-2'>{additionalInfo}</div>}
	</div>
);

const ActionButtons = ({
	actions,
	className,
}: {
	actions: ReservationAction[];
	className?: string;
}) => {
	const visibleActions = actions.filter(
		(action) => action.condition !== false
	);

	console.log(visibleActions);
	if (visibleActions.length === 0) return null;

	return (
		<div className={cn('flex gap-1', className)}>
			{visibleActions.map((action, index) => (
				<Button
					key={index}
					size='sm'
					variant={action.variant || 'default'}
					onClick={action.onClick}
					disabled={action.disabled}
					className='text-xs flex-1 px-2 py-1 h-auto'
				>
					{action.icon}
					{action.label}
				</Button>
			))}
		</div>
	);
};

// Enhanced Call Controls Component
const CallControls = ({
	call,
	isMuted,
	onAcceptCall,
	onRejectCall,
	onHangupCall,
	onMuteCall,
	onUnmuteCall,
}: {
	call: Call;
	isMuted: boolean;
	onAcceptCall?: (callSid: string) => void;
	onRejectCall?: (callSid: string) => void;
	onHangupCall?: (callSid: string) => void;
	onMuteCall?: (callSid: string, muted: boolean) => void;
	onUnmuteCall?: (callSid: string) => void;
}) => {
	const callSid = call.parameters.CallSid;
	const callStatus = call.status();

	return (
		<div className='space-y-2'>
			<div className='text-xs font-medium text-muted-foreground border-b pb-1'>
				Call Controls
			</div>

			{/* Incoming call controls */}
			{callStatus === 'ringing' && (
				<div className='flex gap-1'>
					<Button
						size='sm'
						variant='accepting'
						onClick={() => onAcceptCall?.(callSid)}
						className='flex-1'
					>
						<PhoneCall className='size-3 mr-1' />
						Answer
					</Button>
					<Button
						size='sm'
						variant='destructive'
						onClick={() => onRejectCall?.(callSid)}
						className='flex-1'
					>
						<PhoneOff className='size-3 mr-1' />
						Decline
					</Button>
				</div>
			)}

			{/* Active call controls */}
			{callStatus === 'open' && (
				<div className='space-y-1'>
					<div className='flex gap-1'>
						<Button
							size='sm'
							variant={isMuted ? 'default' : 'outline'}
							onClick={() => {
								if (isMuted) {
									onUnmuteCall?.(callSid);
								} else {
									onMuteCall?.(callSid, true);
								}
							}}
							className='flex-1'
						>
							{isMuted ? (
								<>
									<MicOff className='size-3 mr-1' />
									Unmute
								</>
							) : (
								<>
									<Mic className='size-3 mr-1' />
									Mute
								</>
							)}
						</Button>
						<Button
							size='sm'
							variant='destructive'
							onClick={() => onHangupCall?.(callSid)}
							className='flex-1'
						>
							<PhoneOff className='size-3 mr-1' />
							Hang Up
						</Button>
					</div>

					{/* Call status indicator */}
					<div className='flex items-center justify-center gap-1 text-xs text-muted-foreground'>
						{isMuted ? (
							<>
								<VolumeX className='size-3' />
								Microphone muted
							</>
						) : (
							<>
								<Volume2 className='size-3' />
								Call in progress
							</>
						)}
					</div>
				</div>
			)}

			{/* Call ended */}
			{callStatus === 'closed' && (
				<div className='text-xs text-center text-muted-foreground py-2'>
					Call ended
				</div>
			)}
		</div>
	);
};

// Main component
const ReservationItem = ({
	reservation,
	call,
	hasActiveCall,
	isVoiceReservation = false,
	isExpanded = false,
	onToggleExpanded,
	reservationActions = [],
	callActions = [],
	additionalInfo,
	className,
	onAcceptCall,
	onRejectCall,
	onHangupCall,
	onMuteCall,
	onUnmuteCall,
	isMuted = false,
}: ReservationItemProps) => {
	return (
		<div
			className={cn(
				'flex flex-col p-4 border rounded-lg hover:bg-muted/50 transition-colors',
				hasActiveCall && 'ring-2 ring-blue-500',
				className
			)}
		>
			{/* Header */}
			<div className='flex-1 space-y-2'>
				<ReservationHeader
					reservation={reservation}
					hasActiveCall={hasActiveCall}
					isExpanded={isExpanded}
					onToggleExpanded={onToggleExpanded}
				/>

				{/* Details - always show basic info, expandable for more */}
				{(!onToggleExpanded || isExpanded) && (
					<ReservationDetails
						reservation={reservation}
						call={call}
						isVoiceReservation={isVoiceReservation}
						additionalInfo={additionalInfo}
					/>
				)}
			</div>

			{/* Footer */}
			<div className='flex flex-col gap-2 mt-3'>
				<div className='text-xs text-muted-foreground'>
					{reservation.dateCreated.toLocaleTimeString()}
				</div>

				{/* Reservation Actions */}
				<ActionButtons actions={reservationActions} />

				<Button
					className='w-full'
					onClick={() =>
						reservation.status === 'wrapping'
							? reservation.complete()
							: reservation.wrap()
					}
				>
					{reservation.status === 'wrapping' ? 'Wrapup' : 'Complete'}
				</Button>

				{/* Enhanced Call Controls - only show if there's a call and call control functions */}
				{call &&
					(onAcceptCall ||
						onRejectCall ||
						onHangupCall ||
						onMuteCall) && (
						<div className='pt-2 border-t'>
							<CallControls
								call={call}
								isMuted={isMuted}
								onAcceptCall={onAcceptCall}
								onRejectCall={onRejectCall}
								onHangupCall={onHangupCall}
								onMuteCall={onMuteCall}
								onUnmuteCall={onUnmuteCall}
							/>
						</div>
					)}
			</div>
		</div>
	);
};

export default ReservationItem;
