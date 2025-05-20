import { CurrentUserAvatar } from '@/components/current-user-avatar';
import { SettingsDialog } from '@/components/settings-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { createClient } from '@/lib/supabase/server';
import type { Session } from '@supabase/supabase-js';
import { useNavigate } from '@tanstack/react-router';
import { Bell, LogOut, Settings } from 'lucide-react';
import type { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import NotificationCenter from '@/components/notification-feed';
import { Suspense } from 'react';

type Props = {
	profile: Profile;
	session: Session;
};

const GlobalNav = ({ profile, session }: Props) => {
	const navigate = useNavigate();

	return (
		<header className='sticky top-0 z-50 flex h-[var(--navbar-height)] w-full shrink-0 items-center gap-3 border-b bg-sidebar px-3 justify-between'>
			<div className='flex items-center gap-1.5'>
				<SidebarTrigger />

				<img
					src='/VeloLogo-Black.png'
					className='h-[16px] object-contain dark:hidden'
				/>

				<img
					src='/VeloLogo-White.png'
					className='h-[16px] object-contain hidden dark:block'
				/>
			</div>

			<div className='flex items-center gap-3'>
				<Suspense
					fallback={
						<Button
							variant='ghost'
							size='icon'
							disabled
						>
							<Bell />
							<span className='sr-only'>Notifications</span>
						</Button>
					}
				>
					<NotificationCenter />
				</Suspense>

				<Dialog>
					<AlertDialog>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='rounded-full'
								>
									<CurrentUserAvatar />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								className='min-w-[--radix-dropdown-menu-trigger-width] rounded-lg'
								side='bottom'
								align='end'
								sideOffset={12}
							>
								<DropdownMenuLabel className='p-0 font-normal'>
									<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
										<CurrentUserAvatar />

										<div className='grid flex-1 text-left text-sm leading-tight'>
											<span className='truncate font-semibold'>
												{profile?.first_name} {profile?.last_name}
											</span>
											<p className='text-xs text-muted-foreground'>{profile?.username}</p>
										</div>
									</div>
								</DropdownMenuLabel>

								<DropdownMenuSeparator />

								<DropdownMenuGroup>
									<DialogTrigger asChild>
										<DropdownMenuItem>
											<Settings className='mr-1.5' />
											<span>Settings</span>
										</DropdownMenuItem>
									</DialogTrigger>
								</DropdownMenuGroup>

								<DropdownMenuSeparator />

								<DropdownMenuGroup>
									<DropdownMenuItem
										onSelect={async () => {
											const supabase = createClient();
											await supabase.auth.signOut();
											navigate({ to: '/login' });
										}}
									>
										<LogOut className='mr-1.5' />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</AlertDialog>

					<SettingsDialog session={session as Session} />
				</Dialog>
			</div>
		</header>
	);
};

export default GlobalNav;
