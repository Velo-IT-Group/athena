import { Button, buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, FilePen } from 'lucide-react';
import { formatRelative } from 'date-fns';
import { Link } from '@tanstack/react-router';
import useNotifications from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

type Props = {};

const NotificationCenter = (props: Props) => {
	const { allNotifications, unreadNotifications, markAllNotificationsAsRead } = useNotifications();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant='ghost'
					size='icon'
					className='rounded-full relative'
				>
					<Bell />
					<span className='sr-only'>Notifications</span>
					<div
						className={cn(
							'absolute top-1 right-1 size-2 rounded-full bg-red-500 opacity-0',
							unreadNotifications && unreadNotifications?.length > 0 && 'opacity-100 animate-pulse'
						)}
					/>
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align='end'
				className='flex flex-col content-stretch justify-stretch p-0'
				style={{ width: 'min(100vw, 450px)', maxHeight: 'min(-100px + 100vh, 800px)' }}
			>
				<div className='py-3 px-4 border-b flex items-center justify-between shrink-0'>
					<h2 className='text-lg font-medium'>Notifications</h2>

					<Button
						variant='outline'
						size='sm'
						disabled={unreadNotifications?.length === 0}
						onClick={() => {
							markAllNotificationsAsRead.mutate();
						}}
					>
						Mark all as read
					</Button>
				</div>

				<div className='flex-1 overflow-y-auto'>
					{unreadNotifications.length > 0 && <NotificationSection />}
					{unreadNotifications.length > 0 ? (
						unreadNotifications.map((notification) => <NotificationItemTest notification={notification} />)
					) : (
						<div className='p-6 text-muted-foreground text-center flex flex-col items-center gap-3'>
							<Bell className='size-6' />
							<p>No new notifications</p>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default NotificationCenter;

const NotificationSection = ({}) => {
	return (
		<div className='h-9 flex items-center justify-between p-3 bg-muted font-medium text-muted-foreground'>
			Unread
		</div>
	);
};

const NotificationItem = ({
	notification,
	markNotificationAsRead,
}: {
	notification: AppNotification;
	markNotificationAsRead: (id: string) => void;
}) => {
	return (
		<Link
			to={notification?.resource_path}
			// @ts-ignore
			params={notification?.resource_params}
			className={buttonVariants({
				variant: notification?.is_read ? 'ghost' : 'secondary',
				className: 'w-full justify-start !p-1.5 h-auto',
			})}
			onClick={() => {
				markNotificationAsRead(notification?.id);
			}}
		>
			<figure className='size-9 rounded-md bg-muted grid place-items-center'>
				<FilePen />
			</figure>

			<div className='flex flex-col items-start'>
				<h3 className='text-sm font-medium'>{notification?.from} approved your proposal</h3>
				<p className='text-xs text-muted-foreground capitalize'>
					{notification?.created_at ? formatRelative(notification?.created_at, new Date()) : ''} •{' '}
					{notification?.type}
				</p>
			</div>
			{/* <Button
                variant='secondary'
                // className='flex items-center gap-1.5 data-[read=false]:bg-muted/50 p-1.5 rounded-md'
                className='w-full justify-start py-1.5 h-auto'
                data-read={notification?.is_read}
            >
                
            </Button> */}
		</Link>
	);
};

function NotificationItemTest({ notification }: { notification: AppNotification }) {
	return (
		<div className='flex gap-3 p-3 border-b'>
			<div className='size-8 rounded-full bg-muted grid place-items-center'>
				<Bell />
			</div>

			<div className='flex-1'>
				<p className='font-medium'>Proposal approved</p>
				<p className='text-sm text-muted-foreground'>
					${notification.resource_name} has been approved by {notification.from}
				</p>
			</div>
			<div className='text-sm text-muted-foreground'></div>
		</div>
	);
}

const notificationHelperText = new Map();
notificationHelperText.set('proposal_approved', {
	title: 'Proposal approved',
	description: 'Expect a transaction for $48.64 in 3 days from Bird Rock Coffee Roasters.',
});
