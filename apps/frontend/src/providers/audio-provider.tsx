import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AudioProviderProps {
	playing: boolean;
	togglePlayback: (play: boolean) => void;
}

const initialValues: AudioProviderProps = {
	playing: false,
	togglePlayback: () => undefined,
};

const context = createContext(initialValues);
const { Provider } = context;

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
	const [audio, setAudio] = useState<HTMLAudioElement>();
	const [playing, setPlaying] = useState(false);

	useEffect(() => {
		setAudio(new Audio('/phone_ringing.mp3'));

		return () => {
			setAudio(undefined);
		};
	}, []);

	const togglePlayback = useCallback((play: boolean) => {
		setPlaying(play);
	}, []);

	useEffect(() => {
		if (!audio) return;
		if (playing) {
			audio.loop = true;
			audio.play();
		} else {
			audio.pause();
		}
	}, [playing, audio]);

	useEffect(() => {
		if (!audio) return;
		audio.addEventListener('ended', () => setPlaying(false));
		return () => {
			audio.removeEventListener('ended', () => setPlaying(false));
		};
	}, [audio]);

	return (
		<Provider
			value={{
				playing,
				togglePlayback,
			}}
		>
			{children}
		</Provider>
	);
};

export const useAudio = () => {
	const state = useContext(context);

	return state;
};
