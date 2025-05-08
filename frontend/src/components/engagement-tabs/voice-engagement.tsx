import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grip, Mic, MicOff, Pause, Phone, PhoneForwarded, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Keypad } from '@/components/keypad';
import { useWorker, type Engagement } from '@/providers/worker-provider';

type Props = {
	engagement: Engagement;
	accessToken: string;
};

const VoiceEngagement = ({ engagement, accessToken }: Props) => {
	const { handleWrapup } = useWorker();
	const [isMuted, setIsMuted] = useState<boolean>(false);

	if (!engagement?.reservation) {
		throw new Error('Task not found');
	}

	if (!engagement.call) {
		throw new Error('Call not found');
	}

	useEffect(() => {
		engagement?.call?.on('mute', (muted) => {
			setIsMuted(muted);
		});
	}, [engagement.call]);

	const tabs = useMemo(() => ['buttons', 'transfer', 'keypad'], []);
	const [tab, setTab] = useState(tabs[0]);

	return (
		<Tabs
			orientation='vertical'
			className='h-full items-center'
			onValueChange={setTab}
			value={tab}
		>
			<TabsContent
				value='buttons'
				className='flex flex-col items-center gap-6'
			>
				<TabsList className='bg-transparent border-none h-full grid grid-cols-3 gap-6'>
					<div className='flex flex-col items-center gap-1.5'>
						<Button
							variant='secondary'
							size='icon'
							className='rounded-full size-12'
							onClick={() => engagement.call?.mute(!!!isMuted)}
						>
							{isMuted ? <MicOff className='size-5' /> : <Mic className='size-5' />}
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
							disabled={!!!engagement.task?.attributes.conference}
							// onClick={() => engagement.call?.hold()}
						>
							<Pause className='size-5' />
						</Button>
						<p className='text-xs'>Hold</p>
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

				<Button
					variant='destructive'
					size='icon'
					className='rounded-full size-12 col-span-3'
					onClick={() => handleWrapup?.mutate(engagement)}
				>
					<Phone className='size-5 rotate-135' />
				</Button>
			</TabsContent>

			<TabsContent value='transfer'>
				<Button
					variant='link'
					className='w-full'
					onClick={() => setTab(tabs[0])}
				>
					<ChevronLeft />
					<span>Back to call</span>
				</Button>

				<div className='flex flex-col items-center gap-6'>
					<h2 className='text-2xl font-semibold'>Transfer to</h2>

					<Input
						placeholder='Enter name or number...'
						className='w-full'
					/>

					<Button>Transfer</Button>
				</div>
			</TabsContent>

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
