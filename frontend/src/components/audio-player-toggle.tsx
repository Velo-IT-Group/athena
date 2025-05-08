import React from 'react';
import { Download, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getStorageFile, getStorageFiles } from '@/lib/supabase/read';

type Props = {
	audioUrl: string;
	downloadUrl?: string;
};

const AudioPlayerToggle = ({ audioUrl, downloadUrl }: Props) => {
	const { data: recording, isLoading } = useQuery({
		queryKey: ['recording', audioUrl],
		queryFn: () => getStorageFile({ data: { bucketName: 'attachments', path: audioUrl } }),
	});

	const [isPlaying, setIsPlaying] = React.useState(false);

	const audio = React.useMemo(() => new Audio(recording?.signedUrl), [recording]);

	const handleAudioToggle = React.useCallback(() => {
		if (!!!isPlaying) {
			audio.play();
		} else {
			audio.pause();
		}
		setIsPlaying((prev) => !!!prev);
	}, [isPlaying, audio]);

	return (
		<>
			<Button
				variant='ghost'
				size='icon'
				onClick={handleAudioToggle}
				disabled={isLoading}
			>
				{!!!isPlaying ? <Play /> : <Pause />}
			</Button>

			{downloadUrl && (
				<Button
					variant='ghost'
					size='icon'
					asChild
				>
					<a
						href={downloadUrl}
						target='_blank'
					>
						<Download />
					</a>
				</Button>
			)}
		</>
	);
};

export default AudioPlayerToggle;
