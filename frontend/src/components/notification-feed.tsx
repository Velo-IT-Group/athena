import { TabsContent } from '@/components/ui/tabs';
import { Button, buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, FilePen } from 'lucide-react';
import { formatRelative } from 'date-fns';
import { Link } from '@tanstack/react-router';
import useNotifications from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

type Props = {};

const NotificationFeed = (props: Props) => {
	const {
		allNotifications,
		unreadNotifications,
		archiveNotifications,
		markNotificationAsRead,
		markAllNotificationsAsRead,
	} = useNotifications();

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
				className='space-y-3 w-lg min-w-md'
			>
				<div className='flex items-center justify-between'>
					<h2 className='text-lg font-medium'>Notifications</h2>

					<Button
						variant='link'
						size='sm'
						disabled={unreadNotifications?.length === 0}
						onClick={() => {
							markAllNotificationsAsRead.mutate();
						}}
					>
						Mark all as read
					</Button>
				</div>

				<Tabs defaultValue='all'>
					<TabsList className='w-full'>
						<TabsTrigger value='all'>All</TabsTrigger>
						<TabsTrigger value='following'>Following</TabsTrigger>
						<TabsTrigger value='archive'>Archive</TabsTrigger>
					</TabsList>

					<TabsContent
						value='all'
						className='space-y-1.5 h-96 overflow-y-auto'
					>
						{allNotifications?.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								markNotificationAsRead={markNotificationAsRead.mutate}
							/>
						))}
					</TabsContent>

					<TabsContent
						value='following'
						className='space-y-1.5 h-96 overflow-y-auto'
					>
						{unreadNotifications?.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								markNotificationAsRead={markNotificationAsRead.mutate}
							/>
						))}
					</TabsContent>

					<TabsContent
						value='archive'
						className='space-y-1.5 h-96 overflow-y-auto'
					>
						{archiveNotifications?.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								markNotificationAsRead={markNotificationAsRead.mutate}
							/>
						))}
					</TabsContent>
				</Tabs>
			</PopoverContent>
		</Popover>
	);
};

export default NotificationFeed;

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
