import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { MessageSquare, Phone, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useWorker } from '@/providers/worker-provider';
import Timer from '@/components/timer';
import { getDateOffset } from '@/utils/date';

type Props = {
	className?: string;
};

const TaskList = ({ className }: Props) => {
	const { engagements } = useWorker();

	return (
		<>
			{engagements.length > 0 && (
				<SidebarGroup className={className}>
					<SidebarGroupLabel>Engagements</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu>
							{engagements.map((engagement) => (
								<SidebarMenuItem key={engagement.reservation?.sid}>
									<SidebarMenuButton
										className='h-auto'
										isActive
										asChild
									>
										<Link
											to='/engagements/$sid'
											params={{ sid: engagement.task?.sid ?? '' }}
										>
											{engagement.task?.taskChannelUniqueName === 'voice' ? (
												<Phone />
											) : (
												<MessageSquare />
											)}
											<div className='w-full space-y-1.5'>
												<div className='flex items-center justify-between'>
													<h5 className='line-clamp-1 text-base'>
														{engagement.task?.attributes.name}
													</h5>
													<Timer
														stopwatchSettings={{
															offsetTimestamp: getDateOffset(
																engagement?.reservation?.dateCreated ?? new Date()
															),
														}}
													/>
												</div>
												{/* <p className='text-xs text-muted-foreground capitalize'>
											<Phone className='fill-current stroke-none inline-block mr-1.5' />
											<span>{engagement.task?.taskChannelUniqueName}</span>
										</p> */}
											</div>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			)}
		</>
	);
};

export default TaskList;
