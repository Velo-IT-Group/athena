import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import WidgetOptions from '@/components/widgets/widget-options';
import useWidget from '@/hooks/use-widget';

interface Props {}

interface Goal {
	id: string;
	title: string;
	description: string;
	progress: number;
	status: string;
	dueDate: string;
	category: string;
}

const MyGoals = (props: Props) => {
	const { halfSize, toggleHalfSize } = useWidget({ widgetName: 'my-goals' });

	const goals: Goal[] = [
		{
			id: '1',
			title: 'Track 100% of billable hours',
			description: 'Daily • Support',
			progress: 75,
			status: 'In Progress',
			dueDate: '2022-01-01',
			category: 'Marketing',
		},
		{
			id: '2',
			title: 'Be available for calls 80% of the day',
			description: 'Daily • Support',
			progress: 34,
			status: 'In Progress',
			dueDate: '2022-01-01',
			category: 'Marketing',
		},
		// {
		// 	id: '3',
		// 	title: 'Increase brand awareness by 10%',
		// 	description: 'Q4 FY22 • Marketing',
		// 	progress: 50,
		// 	status: 'No status',
		// 	dueDate: '2022-01-01',
		// 	category: 'Marketing',
		// },
		// {
		// 	id: '4',
		// 	title: 'Increase brand awareness by 10%',
		// 	description: 'Q4 FY22 • Marketing',
		// 	progress: 50,
		// 	status: 'No status',
		// 	dueDate: '2022-01-01',
		// 	category: 'Marketing',
		// },
		// {
		// 	id: '5',
		// 	title: 'Increase brand awareness by 10%',
		// 	description: 'Q4 FY22 • Marketing',
		// 	progress: 50,
		// 	status: 'No status',
		// 	dueDate: '2022-01-01',
		// 	category: 'Marketing',
		// },
	];

	return (
		<Card
			className='hover:border-black/25 transition flex flex-col'
			style={{ gridColumn: halfSize ? 'span 1' : 'span 2' }}
		>
			<CardHeader className='flex flex-row items-start gap-3'>
				<CardTitle className='text-xl'>My Goals</CardTitle>

				<WidgetOptions
					halfSize={halfSize}
					toggleHalfSize={toggleHalfSize}
				/>
			</CardHeader>

			<CardContent className='h-full space-y-1.5'>
				{goals.map((goal) => (
					<div
						key={goal.id}
						className='w-full p-3 border flex items-center justify-between rounded-lg'
					>
						<div>
							<h4 className='font-medium'>{goal.title}</h4>
							<p className='text-muted-foreground text-xs'>{goal.description}</p>
						</div>

						<div>
							<div className='flex items-center gap-1.5'>
								<Progress
									value={goal.progress}
									className='min-w-24'
								/>
								<span className='text-muted-foreground text-xs'>
									{new Intl.NumberFormat('en-US', {
										style: 'percent',
									}).format(goal.progress / 100)}
								</span>
							</div>

							<p className='text-muted-foreground text-sm'>{goal.status}</p>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
};

export default MyGoals;
