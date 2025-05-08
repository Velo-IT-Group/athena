import ActivityListItem from '@/components/activity-list-item';
import { CurrentUserAvatar } from '@/components/current-user-avatar';
import GlobalSearch from '@/components/global-search';
import { SettingsDialog } from '@/components/settings-dialog';
import { ListSelector } from '@/components/status-selector';
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
import { getActivitiesQuery } from '@/lib/twilio/api';
import { useWorker } from '@/providers/worker-provider';
import type { Session } from '@supabase/supabase-js';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LogOut, Settings } from 'lucide-react';
import type { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';

type Props = {
	profile: Profile;
	session: Session;
	worker: WorkerInstance;
	accessToken: string;
};

const GlobalNav = ({ profile, session, worker, accessToken }: Props) => {
	const { data: activities } = useSuspenseQuery(getActivitiesQuery());

	const { updateWorkerActivity, activity } = useWorker();

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

			<GlobalSearch />

			<div className='flex items-center gap-3'>
				{/* <QueueStatus token={accessToken} /> */}

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='outline'
							type='button'
						>
							<ActivityListItem activityName={activity ? activity.name : worker.activityName} />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className='p-0'
						side='bottom'
						align='end'
					>
						<ListSelector
							items={activities ?? []}
							currentValue={
								activity
									? activities?.find((a) => a.sid === activity.sid)
									: activities?.find((a) => a.sid === worker.activitySid)
							}
							value={(activity) => activity.sid}
							onSelect={(activity) => updateWorkerActivity({ sid: activity.sid, options: {} })}
							itemView={(activity) => <ActivityListItem activityName={activity.friendlyName} />}
						/>
					</DropdownMenuContent>
				</DropdownMenu>

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
									// onSelect={() => {
									// 	const supabase = createClient();
									// 	supabase.auth.signOut().then(() => {
									// 		redirect({ to: '/login' });
									// 	});
									// }}
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
