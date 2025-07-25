import {
	PhoneCall,
	PhoneOff,
	Mic,
	MicOff,
	CheckCircle,
	XCircle,
	Users,
	UserPlus,
	Square,
	Check,
} from 'lucide-react';

interface ReservationAction {
	label: string;
	icon?: React.ReactNode;
	variant?: 'default' | 'accepting' | 'destructive' | 'outline' | 'secondary';
	onClick: () => void;
	disabled?: boolean;
	condition?: boolean;
}

export const createReservationActions = ({
	reservation,
	isVoiceReservation,
	onAccept,
	onReject,
	onConference,
	onTransfer,
	onComplete,
}: {
	reservation: any;
	isVoiceReservation: boolean;
	onAccept: (reservationSid: string) => void;
	onReject: (reservationSid: string) => void;
	onConference?: (reservationSid: string) => void;
	onTransfer?: (reservationSid: string) => void;
	onComplete?: (reservationSid: string) => void;
}): ReservationAction[] => {
	return [
		// Pending state actions
		{
			label: isVoiceReservation ? 'Answer Call' : 'Accept',
			icon: isVoiceReservation ? (
				<PhoneCall className='size-3 mr-1' />
			) : (
				<CheckCircle className='size-3 mr-1' />
			),
			variant: 'accepting',
			onClick: () => onAccept(reservation.sid),
			condition: reservation.status === 'pending',
		},
		{
			label: isVoiceReservation ? 'Decline Call' : 'Reject',
			icon: isVoiceReservation ? (
				<PhoneOff className='size-3 mr-1' />
			) : (
				<XCircle className='size-3 mr-1' />
			),
			variant: 'destructive',
			onClick: () => onReject(reservation.sid),
			condition: reservation.status === 'pending',
		},
		// Accepted state actions
		{
			label: 'Conference',
			icon: <Users className='size-3 mr-1' />,
			variant: 'outline',
			onClick: () => onConference?.(reservation.sid),
			condition:
				reservation.status === 'accepted' &&
				!!onConference &&
				isVoiceReservation,
		},
		{
			label: 'Transfer',
			icon: <UserPlus className='size-3 mr-1' />,
			variant: 'outline',
			onClick: () => onTransfer?.(reservation.sid),
			condition: reservation.status === 'accepted' && !!onTransfer,
		},
		// Wrapping state actions
		{
			label: 'Complete',
			icon: <Check className='size-3 mr-1' />,
			variant: 'accepting',
			onClick: () => onComplete?.(reservation.sid),
			condition: reservation.status === 'wrapping' && !!onComplete,
		},
		// Generic complete action for accepted reservations (fallback)
		{
			label: 'Complete',
			icon: <Square className='size-3 mr-1' />,
			variant: 'default',
			onClick: () => onComplete?.(reservation.sid),
			condition:
				reservation.status === 'accepted' &&
				!!onComplete &&
				reservation.status !== 'wrapping',
		},
	];
};

export const createCallActions = ({
	call,
	isMuted,
	onAcceptCall,
	onRejectCall,
	onHangupCall,
	onMuteToggle,
}: {
	call: any;
	isMuted: boolean;
	onAcceptCall: (callSid: string) => void;
	onRejectCall: (callSid: string) => void;
	onHangupCall: (callSid: string) => void;
	onMuteToggle: (callSid: string) => void;
}): ReservationAction[] => {
	return [
		// In-progress state actions only (since accept/reject is handled by reservation actions)
		{
			label: isMuted ? 'Unmute' : 'Mute',
			icon: isMuted ? <MicOff className='size-3 mr-1' /> : <Mic className='size-3 mr-1' />,
			variant: isMuted ? 'default' : 'outline',
			onClick: () => onMuteToggle(call.parameters.CallSid),
			condition: call.status() === 'open',
		},
		{
			label: 'Hang Up',
			icon: <PhoneOff className='size-3 mr-1' />,
			variant: 'destructive',
			onClick: () => onHangupCall(call.parameters.CallSid),
			condition: call.status() === 'open',
		},
	];
};
