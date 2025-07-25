'use client';
import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import IncomingTask from '@/components/incoming-task';
import { ActiveCall } from '@/components/active-call';
import TaskWrapup from '@/components/task/wrapup';
import OutboundTask from '@/components/outbound-task';
import { Phone, Voicemail } from 'lucide-react';
import { cn } from '@/lib/utils';
import VoicemailTask from '@/components/voicemail-task';
import { Engagement, useTwilio } from '@/contexts/twilio-provider';
import { Button } from '@/components/ui/button';
import OutboundDialer from '@/components/outbound-dialer';
import { Call } from '@twilio/voice-sdk';
import { voiceAttributesSchema } from '@/types/twilio';

type Props = {
	engagement?: Engagement;
};

const TaskNotification = ({ engagement }: Props) => {
	const { worker, isRegistered } = useTwilio();

	const [open, setOpen] = useState(false);

	const isAccepted = useMemo(
		() => engagement?.reservation?.status === 'accepted',
		[engagement?.reservation?.status]
	);
	const isWrapping = useMemo(
		() => engagement?.reservation?.status === 'wrapping',
		[engagement?.reservation?.status]
	);
	const isPending = useMemo(
		() => engagement?.reservation?.status === 'pending',
		[engagement?.reservation?.status]
	);
	const isVoicemail = useMemo(
		() =>
			engagement?.reservation?.task?.attributes?.taskType === 'voicemail',
		[engagement?.reservation?.task?.attributes?.taskType]
	);

	useEffect(() => {
		if (!engagement) return;

		setOpen(
			engagement?.reservation?.status === 'pending' &&
				engagement.call !== undefined &&
				[Call.State.Pending, Call.State.Ringing].includes(
					engagement?.call?.status()
				)
		);
	}, [engagement]);

	const { data: attributes } = voiceAttributesSchema.safeParse(
		engagement?.reservation?.task?.attributes
	);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
		>
			<PopoverTrigger asChild>
				<Button
					size={engagement ? 'sm' : 'icon'}
					variant='ghost'
					className={cn(
						engagement
							? 'animate-pulse bg-muted'
							: 'fill-current stroke-none'
					)}
					disabled={
						!engagement
							? !worker?.available || !isRegistered
							: false
					}
				>
					{isVoicemail ? <Voicemail /> : <Phone />}

					<span
						className={cn(
							'text-muted-foreground flex items-center gap-1.5 font-medium',
							!engagement && 'sr-only'
						)}
					>
						{attributes?.name}
					</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className='p-0 w-80'
				align='center'
			>
				{engagement?.reservation && attributes ? (
					<>
						{isAccepted && (
							<>
								{isVoicemail ? (
									<VoicemailTask
										task={engagement?.reservation?.task}
									/>
								) : (
									<ActiveCall
										engagement={engagement}
										attributes={attributes}
									/>
								)}
							</>
						)}

						{isWrapping && (
							<TaskWrapup reservation={engagement?.reservation} />
						)}

						{isPending && (
							<>
								{attributes.direction === 'outbound' ? (
									<OutboundTask
										reservation={engagement?.reservation}
										attributes={attributes}
									/>
								) : (
									<IncomingTask attributes={attributes} />
								)}
							</>
						)}
					</>
				) : (
					<OutboundDialer />
				)}
			</PopoverContent>
		</Popover>
	);
};

export default TaskNotification;
