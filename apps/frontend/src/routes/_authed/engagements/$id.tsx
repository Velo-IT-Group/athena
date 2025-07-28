import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	ResizablePanel,
	ResizablePanelGroup,
	ResizableHandle,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudioWaveform, Clock, Clock9, Users } from 'lucide-react';
import { voiceAttributesSchema } from '@/types/twilio';
import { getEngagement } from '@/lib/supabase/read';
import { getRecording } from '@/lib/twilio/read';
import {
	Editable,
	EditableInput,
	EditablePreview,
} from '@/components/ui/editable';
import { Textarea } from '@/components/ui/textarea';

export const transcriptChannelSchema = z.object({
	media_properties: z.object({
		source: z.string(),
		reference_sids: z.object({ call_sid: z.string() }),
		source_sid: z.string(),
		media_url: z.null(),
	}),
	participants: z.array(
		z.object({
			user_id: z.null(),
			channel_participant: z.number(),
			media_participant_id: z.string(),
			image_url: z.null(),
			full_name: z.null(),
			role: z.string(),
			email: z.null(),
		})
	),
	type: z.string(),
});

const wordSchema = z.object({
	start_time: z.number(),
	word: z.string(),
	end_time: z.number(),
});

const sentenceSchema = z.object({
	mediaChannel: z.number(),
	sentenceIndex: z.number(),
	startTime: z.string(),
	endTime: z.string(),
	transcript: z.string(),
	sid: z.string(),
	confidence: z.string(),
	words: z.array(wordSchema),
});

const schema = z.object({
	edit: z.boolean().optional(),
});

export const Route = createFileRoute('/_authed/engagements/$id')({
	component: RouteComponent,
	validateSearch: zodValidator(schema),
	loader: async ({ params }) => {
		const { id } = params;

		const engagement = await getEngagement({ data: id });

		if (!engagement.transcription_sid)
			return {
				engagement,

				recording: undefined,
			};

		if (!engagement.recording_sid)
			return {
				engagement,
				recording: undefined,
			};

		const recording = await getRecording({
			data: engagement.recording_sid,
		});

		return {
			engagement,
			recording,
		};
	},
});

function RouteComponent() {
	const { engagement, recording } = Route.useLoaderData();

	const { data: sentences } = z
		.array(sentenceSchema)
		// @ts-ignore
		.safeParse(engagement.transcript);

	const { data: channel } = transcriptChannelSchema.safeParse(
		engagement.transcript?.channel
	);
	const { data: attributes } = voiceAttributesSchema.safeParse(
		engagement?.attributes
	);

	return (
		<div>
			<header className='inset-shadow-[0_-1px_0px_0px_var(--border)] space-y-2 p-4'>
				<h1>Engagement with {attributes?.name}</h1>

				<div className='flex items-center gap-2'>
					<div className='flex items-center gap-1 text-sm text-muted-foreground'>
						<Clock9 />
						<span>
							{new Intl.DateTimeFormat('en-US', {
								// dateStyle: 'short',
								month: 'short',
								day: 'numeric',
							}).format(
								new Date(engagement?.created_at ?? new Date())
							)}
						</span>
					</div>

					<div className='flex items-center gap-1 text-sm text-muted-foreground'>
						<Clock9 />
						<span>
							{new Intl.NumberFormat('en-US', {
								style: 'unit',
								unit:
									Number(recording?.duration) > 60
										? 'minute'
										: 'second',
								unitDisplay: 'narrow',
							}).format(
								Number(recording?.duration) > 60
									? Number(recording?.duration) % 60
									: Number(recording?.duration)
							)}
						</span>
					</div>
				</div>
			</header>

			<ResizablePanelGroup
				direction='horizontal'
				className='overflow-hidden'
			>
				<ResizablePanel
					minSize={30}
					maxSize={60}
					id='engagement-control-panel'
					autoSave='engagement-control-panel'
					className='flex flex-col gap-3 h-full overflow-y-scroll items-center p-3'
				>
					<audio
						className='w-full'
						controls
					>
						<source
							src={recording?.mediaUrl}
							type='audio/ogg'
						/>
						<source
							src={recording?.mediaUrl}
							type='audio/mpeg'
						/>
						<source
							src={recording?.mediaUrl}
							type='audio/wav'
						/>
						<source
							src={recording?.mediaUrl}
							type='audio/mp3'
						/>
						Your browser does not support the audio tag.
					</audio>

					<Tabs
						defaultValue='transcript'
						className='flex flex-col items-start w-full overflow-hidden'
					>
						<TabsList>
							<TabsTrigger value='transcript'>
								<AudioWaveform />
								<span>Transcript</span>
							</TabsTrigger>

							<TabsTrigger value='speakers'>
								<Users />
								<span>Speakers</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value='transcript'>
							<div className='h-full space-y-3'>
								{sentences
									?.sort(
										(a, b) =>
											a.sentenceIndex - b.sentenceIndex
									)
									.map((sentence) => (
										<div
											key={sentence.sid}
											className='space-y-1.5'
										>
											<h3 className='font-semibold'>
												{channel?.participants
													.find(
														(p) =>
															p.channel_participant ===
															sentence.mediaChannel
													)
													?.media_participant_id.includes(
														'client:'
													)
													? 'Agent'
													: attributes?.name}
											</h3>

											<p className='text-pretty leading-5'>
												{sentence.transcript}
											</p>
										</div>
									))}
							</div>
						</TabsContent>

						<TabsContent value='speakers'>
							<ScrollArea className='h-full space-y-3'>
								<div className='h-full space-y-3'>
									{channel?.participants.map(
										(participant) => (
											<div
												key={
													participant.media_participant_id
												}
												className='space-y-1.5'
											>
												<h3 className='font-semibold'>
													{channel.participants
														.find(
															(p) =>
																p.channel_participant ===
																participant.channel_participant
														)
														?.media_participant_id.includes(
															'client:'
														)
														? 'Agent'
														: attributes?.name}
												</h3>

												<p className='text-pretty leading-5'>
													{participant?.full_name}
												</p>
											</div>
										)
									)}
								</div>
							</ScrollArea>
						</TabsContent>
					</Tabs>
				</ResizablePanel>

				<ResizableHandle />

				<ResizablePanel>
					<ScrollArea className='h-[calc(100svh-var(--navbar-height))]'>
						<div className='container mx-auto p-6 flex flex-col w-full'>
							<section className='space-y-1.5'>
								<h2 className='text-xl font-bold'>Summary</h2>
								<Editable
									defaultValue={
										engagement.summary || undefined
									}
								>
									<EditablePreview className='text-pretty px-1' />
									<EditableInput asChild>
										<Textarea className='px-1'>
											{engagement.summary}
										</Textarea>
									</EditableInput>
								</Editable>
							</section>
						</div>
					</ScrollArea>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
