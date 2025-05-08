import { LucideIcon } from 'lucide-react';
import Tiptap from '@/components/tip-tap';

export type ActivityItemProps = {
	icon?: LucideIcon;
	text: string;
	date: Date;
	source?: string;
};

const ActivityItem = (props: ActivityItemProps) => {
	return (
		<li className='relative flex gap-4 group'>
			<div className='absolute top-0 -bottom-6 left-0 flex w-6 justify-center'>
				{/* {props.icon ? (
                    <props.icon />
                ) : (
                )} */}
				<div className='w-[1px] group-last:hidden bg-muted-foreground' />
			</div>

			<div className='relative flex size-6 flex-none items-center justify-center bg-background'>
				<div className='size-1.5 rounded-full bg-muted-foreground' />
			</div>

			<p className='flex-auto py-0.5 text-xs text-muted-foreground leading-5'>
				{/* <span className="text-foreground font-medium">
                    {ticket.text}
                </span> */}
				<Tiptap
					content={props.text}
					className='font-medium text-ellipsis overflow-hidden min-w-0 markdown-editor'
				/>
			</p>

			{/* <Card>
                <CardContent className="p-1.5">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-5 h-5 bg-background rounded-full grid place-items-center">
                            <props.icon />
                        </div>

                        <div className="text-xs">
                            <div className="leading-5 break-words line-clamp-6">
                                <Markdown className="font-medium text-ellipsis overflow-hidden min-w-0 markdown-editor">
                                    {props.text}
                                </Markdown>
                            </div>

                            <time aria-label={props.date.toISOString()}>
                                {relativeDate(props.date)}
                            </time>
                        </div>
                    </div>
                </CardContent>
            </Card> */}
		</li>
	);
};

export default ActivityItem;
