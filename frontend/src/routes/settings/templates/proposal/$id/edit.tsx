import LabeledInput from '@/components/labeled-input';
import SettingPageWrap from '@/components/settings-page-warp';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sortable, SortableContent, SortableItem, SortableItemHandle, SortableOverlay } from '@/components/ui/sortable';
import { Textarea } from '@/components/ui/textarea';
import { getTemplateQuery, getTemplatesQuery } from '@/lib/supabase/api';
import { getTemplate } from '@/lib/supabase/read';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Grip, GripVertical } from 'lucide-react';

export const Route = createFileRoute('/settings/templates/proposal/$id/edit')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	const { data: template } = useSuspenseQuery(getTemplateQuery(id));

	return (
		<SettingPageWrap
			title='Edit proposal template'
			className='space-y-6'
		>
			<Separator className='mt-6' />

			<LabeledInput
				label='Name'
				defaultValue={template.name}
			/>

			<LabeledInput label='Description'>
				<Textarea
					className='resize-none'
					defaultValue={template.description ?? ''}
				/>
			</LabeledInput>

			<Separator className='mt-6' />

			<section>
				<h2 className='text-lg font-medium'>Phases</h2>

				<Sortable
					value={template.phases}
					getItemValue={(item) => item.id}
				>
					<SortableContent className='w-full space-y-3'>
						{template.phases.map((phase) => (
							<SortableItem
								key={phase.id}
								value={phase.id}
								className='flex items-start -ml-9 group w-full'
							>
								<SortableItemHandle asChild>
									<Button
										variant='ghost'
										size='icon'
										className='group-hover:opacity-100 opacity-0'
									>
										<GripVertical className='text-muted-foreground' />
									</Button>
								</SortableItemHandle>

								<Card className='w-full'>
									<CardHeader>
										<CardTitle>{phase.description}</CardTitle>
									</CardHeader>

									<CardContent className='p-0'>
										<Sortable
											value={phase.tickets}
											getItemValue={(item) => item.id}
										>
											<SortableContent>
												<Accordion type='multiple'>
													{phase.tickets.map((ticket) => (
														<SortableItem value={ticket.id}>
															<AccordionItem
																key={ticket.id}
																value={ticket.id}
																className='group/ticket'
															>
																<AccordionTrigger className='pr-3 pl-6'>
																	<div className='flex items-center'>
																		<SortableItemHandle asChild>
																			<Button
																				variant='ghost'
																				size='icon'
																				className='group-hover:opacity-100 opacity-0 -ml-6'
																			>
																				<GripVertical className='text-muted-foreground' />
																			</Button>
																		</SortableItemHandle>

																		<span>{ticket.summary}</span>
																	</div>
																</AccordionTrigger>

																<AccordionContent>
																	<Accordion type='multiple'>
																		{ticket.tasks.map((task) => (
																			<AccordionItem value={task.id}>
																				<AccordionTrigger className='pr-3 pl-6'>
																					<span>{task.notes}</span>
																				</AccordionTrigger>

																				<AccordionContent>
																					<p>{task.notes}</p>
																				</AccordionContent>
																			</AccordionItem>
																		))}
																	</Accordion>
																</AccordionContent>
															</AccordionItem>
														</SortableItem>
													))}
												</Accordion>
											</SortableContent>
										</Sortable>
									</CardContent>
								</Card>
							</SortableItem>
						))}

						<SortableOverlay />
					</SortableContent>
				</Sortable>
			</section>
		</SettingPageWrap>
	);
}
