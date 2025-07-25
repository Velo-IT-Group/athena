import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';

export default function ZoomableImage({
	src,
	alt,
	className,
}: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
	if (!src) return null;
	return (
		<Dialog>
			<DialogTrigger asChild>
				<img
					src={src}
					alt={alt || ''}
					className={cn('hover:cursor-pointer', className)}
				/>
			</DialogTrigger>
			<DialogContent className='sm:max-w-7xl w-fit border-0 bg-transparent p-0'>
				<div className='relative max-h-[calc(100vh-220px)] w-fit rounded-md bg-transparent shadow-md'>
					<img
						src={src}
						// fill
						alt={alt || ''}
						className='h-full w-full object-contain'
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
