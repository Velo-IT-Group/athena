import VeloLogo from '@/components/logo';
import { ArrowDown, ArrowUp, CornerDownLeft } from 'lucide-react';

export function SearchFooter() {
	return (
		<div className='search-footer flex px-3 h-[40px] w-full border border-border border-t-[0px] items-center bg-background backdrop-filter dark:border-[#2C2C2C] backdrop-blur-lg dark:bg-[#151515]/[99]'>
			<div className='scale-200 dark:opacity-50 -ml-1'>
				{/* <Icons.LogoSmall /> */}
				<VeloLogo />
			</div>

			<div className='ml-auto flex space-x-2'>
				<div className='size-6 select-none items-center border bg-accent flex justify-center'>
					<ArrowUp className='size-3 dark:text-[#666666] text-black' />
				</div>

				<div className='size-6 select-none items-center border bg-accent flex justify-center'>
					<ArrowDown className='size-3 dark:text-[#666666] text-black' />
				</div>

				<div className='size-6 select-none items-center border bg-accent flex justify-center'>
					<CornerDownLeft className='size-3 dark:text-[#666666] text-black' />
				</div>
			</div>
		</div>
	);
}
