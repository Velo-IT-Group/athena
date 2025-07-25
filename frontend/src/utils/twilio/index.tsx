"use server";
import { env } from "@/lib/utils";
import Twilio from "twilio";
import { SyncClient } from "twilio-sync";
import {
    PhoneCall,
    PhoneOff,
    Mic,
    MicOff,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Call } from "@twilio/voice-sdk";

export const createClient = async () =>
	await new Twilio.Twilio(
		env.VITE_TWILIO_API_KEY_SID,
		env.VITE_TWILIO_API_KEY_SECRET,
		{
			accountSid: env.VITE_TWILIO_ACCOUNT_SID,
		},
	);

export const createSyncClient = async () => {
	// const cookieStore = await cookies();
	// const token = cookieStore.get('twilio_token')?.value;
	// console.log('TOKEN', token);
	// if (!token) throw new Error('No token found');

	return await new SyncClient("token");
};



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
    onAccept,
    onReject,
}: {
    reservation: any;
    onAccept: (reservationSid: string) => void;
    onReject: (reservationSid: string) => void;
}): ReservationAction[] => {
    return [
        {
            label: 'Accept',
            icon: <CheckCircle className='size-3 mr-1' />,
            variant: 'accepting',
            onClick: () => onAccept(reservation.sid),
            condition: reservation.reservationStatus === 'pending',
        },
        {
            label: 'Reject',
            icon: <XCircle className='size-3 mr-1' />,
            variant: 'destructive',
            onClick: () => onReject(reservation.sid),
            condition: reservation.reservationStatus === 'pending',
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
    call: Call;
    isMuted: boolean;
    onAcceptCall: (callSid: string) => void;
    onRejectCall: (callSid: string) => void;
    onHangupCall: (callSid: string) => void;
    onMuteToggle: (callSid: string) => void;
}): ReservationAction[] => {
    return [
		// Ringing state actions
		{
			label: 'Answer',
			icon: <PhoneCall className='size-3 mr-1' />,
			variant: 'accepting',
			onClick: () => onAcceptCall(call.parameters.CallSid),
			condition: call.status() === Call.State.Pending,
		},
		{
			label: 'Decline',
			icon: <PhoneOff className='size-3 mr-1' />,
			variant: 'destructive',
			onClick: () => onRejectCall(call.parameters.CallSid),
			condition: call.status() === Call.State.Pending,
		},
		// In-progress state actions
		{
			label: isMuted ? 'Unmute' : 'Mute',
			icon: isMuted ? (
				<MicOff className='size-3 mr-1' />
			) : (
				<Mic className='size-3 mr-1' />
			),
			variant: isMuted ? 'default' : 'outline',
			onClick: () => onMuteToggle(call.parameters.CallSid),
			condition: call.status() === Call.State.Open,
		},
		{
			label: 'Hang Up',
			icon: <PhoneOff className='size-3 mr-1' />,
			variant: 'destructive',
			onClick: () => onHangupCall(call.parameters.CallSid),
			condition: call.status() === Call.State.Open,
		},
	];
};