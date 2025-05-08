import React, { useEffect, useRef } from 'react';
import './style.css';
import { Separator } from '../ui/separator';
import { useTwilio } from '@/providers/twilio-provider';

const DiscoBall = () => {
	const { toggleDiscoBall, setHasAcknowledged } = useTwilio();
	const ref = useRef<HTMLDivElement>(null);
	const beamRef = useRef<HTMLDivElement>(null);
	const radius = 50;
	const squareSize = 6.5;
	const prec = 19.55;
	const fuzzy = 0.001;
	const inc = (Math.PI - fuzzy) / prec;

	useEffect(() => {
		// setAudio(new Audio('/disco.mp3'))
		for (let t = fuzzy; t < Math.PI; t += inc) {
			const z = radius * Math.cos(t);
			const currentRadius =
				Math.abs(radius * Math.cos(0) * Math.sin(t) - radius * Math.cos(Math.PI) * Math.sin(t)) / 2.5;
			const circumference = Math.abs(2 * Math.PI * currentRadius);
			const squaresThatFit = Math.floor(circumference / squareSize);
			const angleInc = (Math.PI * 2 - fuzzy) / squaresThatFit;
			for (let i = angleInc / 2 + fuzzy; i < Math.PI * 2; i += angleInc) {
				const square = document.createElement('div');
				const squareTile = document.createElement('div');
				squareTile.style.width = squareSize + 'px';
				squareTile.style.height = squareSize + 'px';
				squareTile.style.transformOrigin = '0 0 0';
				squareTile.style.webkitTransformOrigin = '0 0 0';
				squareTile.style.webkitTransform = 'rotate(' + i + 'rad) rotateY(' + t + 'rad)';
				squareTile.style.transform = 'rotate(' + i + 'rad) rotateY(' + t + 'rad)';
				if ((t > 1.3 && t < 1.9) || (t < -1.3 && t > -1.9)) {
					squareTile.style.backgroundColor = randomColor('bright');
				} else {
					squareTile.style.backgroundColor = randomColor('any');
				}
				square.appendChild(squareTile);
				square.className = 'square';
				squareTile.style.webkitAnimation = 'reflect 2s linear infinite';
				squareTile.style.webkitAnimationDelay = String(randomNumber(0, 20) / 10) + 's';
				squareTile.style.animation = 'reflect 2s linear infinite';
				squareTile.style.animationDelay = String(randomNumber(0, 20) / 10) + 's';
				squareTile.style.backfaceVisibility = 'hidden';
				const x = radius * Math.cos(i) * Math.sin(t);
				const y = radius * Math.sin(i) * Math.sin(t);
				square.style.webkitTransform =
					'translateX(' + Math.ceil(x) + 'px) translateY(' + y + 'px) translateZ(' + z + 'px)';
				square.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px)';
				ref.current?.appendChild(square);
			}
		}

		// Create beams dynamically
		for (let i = 0; i < 15; i++) {
			const beam = document.createElement('div');
			beam.classList.add('light-beam');
			beam.style.setProperty('--angle', `${(360 / 15) * i}deg`); // Set rotation angle
			beam.style.setProperty('--random-x', String(Math.random())); // Random x position
			beam.style.setProperty('--random-y', String(Math.random())); // Random y position
			beamRef.current?.appendChild(beam);
		}
	}, []);

	function randomColor(type: string) {
		let c;
		if (type == 'bright') {
			c = randomNumber(130, 255);
		} else {
			c = randomNumber(110, 190);
		}
		return 'rgb(' + c + ',' + c + ',' + c + ')';
	}

	function randomNumber(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	return (
		<div
			className='overflow-hidden absolute h-screen w-screen bg-background/50 hover:cursor-pointer'
			onClick={() => {
				setHasAcknowledged(true);
				toggleDiscoBall();
			}}
		>
			<Separator
				orientation='vertical'
				className='h-[50px] from-black dark:from-secondary bg-gradient-to-b absolute top-0 left-1/2 w-1 -ml-1'
			/>

			<div id='discoBallLight' />

			<div
				id='discoBall'
				ref={ref}
			>
				<div id='discoBallMiddle' />
			</div>

			<div
				className='light-beams'
				ref={beamRef}
			>
				{/* <div className="light-beam"></div>
                <div className="light-beam"></div>
                <div className="light-beam"></div>
                <div className="light-beam"></div>
                <div className="light-beam"></div> */}
			</div>
		</div>
	);
};

export default DiscoBall;
