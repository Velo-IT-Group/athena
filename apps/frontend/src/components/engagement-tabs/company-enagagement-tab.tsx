import SOPExceptions from '@/components/sop-exceptions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColoredBadge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useTwilioTask } from '@/hooks/use-task';
import {
	getCompanyBestPracticesQuery,
	getCompanyConfigurationsQuery,
	getCompanyProjectsQuery,
	getCompanyQuery,
} from '@/lib/manage/api';
import type { Question } from '@/types/manage';
import { useSuspenseQueries } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { AppWindow, Box, CheckCircle, ChevronDown, Circle, Server } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';

interface Props {
	id: string | number;
	taskSid: string;
}

const CompanyEngagementTab = ({ id = 250, taskSid }: Props) => {
	const { data: task, handleTaskUpdate } = useTwilioTask(taskSid);

	const [questions, setQuestions] = useState<Question[]>([]);

	const closedDate = useMemo(() => subDays(new Date(), 30), []);
	const [
		{ data: company },
		{
			data: { data: projects },
		},
		{
			data: { data: configurations },
		},
		{
			data: { data: tickets },
		},
	] = useSuspenseQueries({
		queries: [
			getCompanyQuery(Number(id)),
			getCompanyProjectsQuery(Number(id)),
			getCompanyConfigurationsQuery(Number(id)),
			getCompanyBestPracticesQuery(Number(id), {
				conditions: {
					closedFlag: true,
					closedDate,
					enteredBy: 'MyIT',
					'board/name': 'Strength',
					'status/name': 'Completed',
					'company/id': Number(id),
				},
			}),
		],
	});

	const applications = configurations?.filter((c) => c.type.name.includes('Application'));
	const servers = configurations?.filter((c) => c.type.name.includes('Server'));

	return (
		<Dialog onOpenChange={(e) => (e ? undefined : setQuestions([]))}>
			<div className='space-y-3'>
				<header className='flex items-center gap-3'>
					<Avatar className='size-20 rounded-lg object-cover outline outline-muted'>
						<AvatarFallback className='text-2xl font-semibold uppercase rounded-lg'>
							{company.name[0]}
							{company.name[1]}
						</AvatarFallback>

						<AvatarImage
							src={`https://logo.clearbit.com/${company.website}`}
							className='object-cover'
						/>
					</Avatar>

					<div className='space-y-3'>
						<div>
							<div className='flex items-center gap-3'>
								<h2 className='text-2xl font-semibold'>{company.name}</h2>

								{company?.types
									.filter((t) => !t.name.includes('Client Stoplight'))
									?.map((type) => (
										<ColoredBadge
											variant={type.name === 'VIP' ? 'yellow' : 'gray'}
											key={type.id + (type?.identity ?? '')}
										>
											<Circle className='size-1.5 mr-1.5 fill-inherit' /> {type.name}
										</ColoredBadge>
									))}
							</div>

							<div className='flex items-center gap-3'>
								<p className='text-sm text-muted-foreground'>{company.territory?.name}</p>

								{company?.types?.some((type) => type.id === 57) && (
									<ColoredBadge
										className='rounded-md'
										variant='green'
									>
										Green
									</ColoredBadge>
								)}
								{company?.types?.some((type) => type.id === 56) && (
									<ColoredBadge
										className='rounded-md'
										variant='yellow'
									>
										Yellow
									</ColoredBadge>
								)}
								{company?.types?.some((type) => type.id === 55) && (
									<ColoredBadge
										className='rounded-md'
										variant='red'
									>
										Red
									</ColoredBadge>
								)}
							</div>
						</div>
					</div>
				</header>

				<Suspense fallback={<div>Loading...</div>}>
					<SOPExceptions
						companyId={Number(id)}
						className='p-3'
					/>
				</Suspense>

				<Card className='flex flex-col'>
					<CardHeader>
						<CardTitle>
							<Box className='inline-block mr-1.5' /> Open Projects
						</CardTitle>
					</CardHeader>

					<CardContent className='space-y-[2ch]'>
						{projects.length ? (
							projects.map((project) => (
								<div
									key={project.id}
									className='flex items-center'
								>
									<div className='space-y-1'>
										<p className='text-sm font-medium leading-none line-clamp-1'>{project.name}</p>
										<p className='text-sm text-muted-foreground'>{project.status?.name}</p>
									</div>

									<Progress
										value={(project?.percentComplete ?? 0) * 100}
										className='ml-auto w-full max-w-24'
									/>
								</div>
							))
						) : (
							<div className='grid place-items-center gap-[1ch] text-lg font-medium text-muted-foreground p-[1ch]'>
								<Box className='size-9' />
								<p>No Open Projects</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className='flex flex-col'>
					<CardHeader>
						<CardTitle>
							<CheckCircle className='inline-block mr-1.5' /> Best Practices Implementation
						</CardTitle>
					</CardHeader>

					<CardContent>
						{tickets && tickets.length ? (
							<ul className='space-y-6'>
								{tickets?.map((ticket) => (
									<li
										key={ticket.id}
										className='relative flex gap-4 group'
									>
										<div className='absolute top-0 -bottom-6 left-0 flex w-6 justify-center'>
											<div className='w-[1px] group-last:hidden bg-muted-foreground' />
										</div>

										<div className='relative flex size-6 flex-none items-center justify-center bg-background'>
											<div className='size-1.5 rounded-full bg-muted-foreground' />
										</div>

										<p className='flex-auto py-0.5 text-xs text-muted-foreground leading-5'>
											<span className='text-foreground font-medium'>{ticket.summary}</span>
										</p>
									</li>
								))}
							</ul>
						) : (
							<div className='grid place-items-center gap-[1ch] font-medium text-muted-foreground p-[1ch] text-center'>
								<CheckCircle className='size-7' />
								<p className='px-6'>
									No Best Practices Implemented
									<br />
									In Past 90 days
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{servers.length > 0 && (
					<Collapsible>
						<Card className='flex flex-col'>
							<CollapsibleTrigger className='cursor-pointer'>
								<CardHeader className='flex-row space-y-0'>
									<CardTitle>
										<Server className='inline-block mr-1.5' /> Servers
									</CardTitle>

									<ChevronDown className='size-5 ml-auto' />
								</CardHeader>
							</CollapsibleTrigger>

							<CollapsibleContent>
								<CardContent>
									<ul className='space-y-6'>
										{configurations
											?.filter((c) => c.type.name.includes('Server'))
											?.map((configuration) => (
												<li
													key={configuration.id}
													className='relative flex gap-4 group'
												>
													<div className='absolute top-0 -bottom-6 left-0 flex w-6 justify-center'>
														<div className='w-[1px] group-last:hidden bg-muted-foreground' />
													</div>

													<div className='relative flex size-6 flex-none items-center justify-center bg-background'>
														<div className='size-1.5 rounded-full bg-muted-foreground' />
													</div>

													<DialogTrigger
														onClick={() => setQuestions(configuration.questions)}
														asChild
													>
														<p className='flex-auto py-0.5 text-sm text-muted-foreground leading-5 hover:underline hover:cursor-pointer'>
															<span className='text-foreground font-medium'>
																{configuration.name}
															</span>
														</p>
													</DialogTrigger>
												</li>
											))}
									</ul>
								</CardContent>
							</CollapsibleContent>
						</Card>
					</Collapsible>
				)}

				{applications.length > 0 && (
					<Collapsible>
						<Card className='flex flex-col'>
							<CollapsibleTrigger className='cursor-pointer'>
								<CardHeader className='flex-row space-y-0'>
									<CardTitle className='flex items-center gap-1.5'>
										<AppWindow className='inline-block mr-1.5' /> Applications
									</CardTitle>
									<ChevronDown className='size-5 ml-auto' />
								</CardHeader>
							</CollapsibleTrigger>

							<CollapsibleContent>
								<CardContent>
									<ul className='space-y-6'>
										{applications?.map((configuration) => (
											<li
												key={configuration.id}
												className='relative flex gap-4 group'
											>
												<div className='absolute top-0 -bottom-6 left-0 flex w-6 justify-center'>
													<div className='w-[1px] group-last:hidden bg-muted-foreground' />
												</div>

												<div className='relative flex size-6 flex-none items-center justify-center bg-background'>
													<div className='size-1.5 rounded-full bg-muted-foreground' />
												</div>

												<DialogTrigger
													onClick={() => setQuestions(configuration.questions)}
													asChild
												>
													<p className='flex-auto py-0.5 text-sm text-muted-foreground leading-5 hover:underline hover:cursor-pointer'>
														<span className='text-foreground font-medium'>
															{configuration.name}
														</span>
													</p>
												</DialogTrigger>
											</li>
										))}
									</ul>
								</CardContent>
							</CollapsibleContent>
						</Card>
					</Collapsible>
				)}
			</div>
			<DialogContent>
				{questions
					.filter((q) => q.answer)
					.map((question) => (
						<div key={question.questionId}>
							<p className='font-semibold text-lg'>{question.question}</p>
							{question.fieldType === 'Hyperlink' ? (
								<a
									href={question.answer}
									target='_blank'
									className='text-primary'
								>
									{question.answer}
								</a>
							) : (
								<p className='text-muted-foreground'>{question.answer}</p>
							)}
						</div>
					))}
			</DialogContent>
		</Dialog>
	);
};

export default CompanyEngagementTab;
