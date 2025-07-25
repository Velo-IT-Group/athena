import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/auth')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className='grid min-h-svh lg:grid-cols-2'>
			<div className='bg-muted relative hidden lg:block overflow-hidden'>
				<img
					src='/motion.png'
					alt='Image'
					className='absolute inset-0 h-full w-full object-cover brightness-[0.375] dark:brightness-[0.2] dark:grayscale'
				/>
				<img
					src='/VeloLogo-White.png'
					alt='Image'
					className='absolute z-10 top-9 left-9 h-6'
				/>
			</div>

			<div className='flex flex-col gap-3 p-6 md:p-9'>
				<div className='flex flex-1 items-center justify-center'>
					<div className='w-full max-w-md'>
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
}
