import { getConfigurations, getTicketConfigurations } from '@/lib/manage/read';
import { configurationIcons } from '@/utils/icon-sets';
import { useSuspenseQuery } from '@tanstack/react-query';

type Props = {
	id: number;
};

const TicketConfigurations = ({ id }: Props) => {
	const { data: ticketConfigs } = useSuspenseQuery({
		queryKey: ['tickets', id, 'configurations'],
		queryFn: () => getTicketConfigurations({ data: { id } }),
	});

	const {
		data: { data: configurations },
	} = useSuspenseQuery({
		queryKey: ['configurations', ticketConfigs.map((config) => config.id).join(',')],
		queryFn: () =>
			getConfigurations({
				data: {
					conditions: {
						id: ticketConfigs.map((config) => config.id),
					},
				},
			}),
	});

	return (
		<section className='space-y-1.5'>
			<div className='flex items-center justify-between gap-3'>
				<h4>Configuration</h4>

				{/* <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="smIcon"
                                className="group-hover:opacity-100 opacity-0 transition-opacity"
                            >
                                <Plus />
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-none sm:max-w-none w-[calc(100vw-24px)] h-[calc(100vh-24px)] flex flex-col py-[3rem]">
                            <Suspense fallback={<TableSkeleton />}>
                                <ConfigurationsList
                                    id={ticket.id}
                                    type="table"
                                    defaultValue={configurations}
                                    params={{
                                        conditions: [
                                            {
                                                parameter: {
                                                    'company/id':
                                                        ticket.company?.id,
                                                },
                                            },
                                            { parameter: { activeFlag: true } },
                                        ],
                                        orderBy: { key: 'name' },
                                        fields: [
                                            'id',
                                            'name',
                                            'site',
                                            'company',
                                            'status',
                                            'contact',
                                            'deviceIdentifier',
                                        ],
                                    }}
                                    facetedFilters={[
                                        { accessoryKey: 'site', items: sites },
                                        {
                                            accessoryKey: 'contact',
                                            items: contacts.map(
                                                ({
                                                    id,
                                                    firstName,
                                                    lastName,
                                                }) => {
                                                    return {
                                                        id,
                                                        name: `${firstName} ${lastName ?? ''}`,
                                                    }
                                                }
                                            ),
                                        },
                                    ]}
                                />
                            </Suspense>
                        </DialogContent>
                    </Dialog> */}
			</div>

			{configurations.map((configuration) => {
				const icon = configurationIcons.find((c) => c.type === configuration.type.name);

				return (
					<p key={configuration.id}>
						{icon && <icon.icon className='w-4 h-4 mr-2' />}
						{configuration.name}
					</p>
				);
			})}

			{/* <Suspense fallback={<Skeleton className='w-full h-9' />}>
                    <ConfigurationsList
                        id={ticket.id}
                        type='combobox'
                        defaultValue={configurations}
                    />
                </Suspense> */}
		</section>
	);
};

export default TicketConfigurations;
