import { getConfigurationsQuery, ticketConfigurationsQuery } from '@/lib/manage/api';
import { getConfigurations, getTicketConfigurations } from '@/lib/manage/read';
import { configurationIcons } from '@/utils/icon-sets';
import { useSuspenseQuery } from '@tanstack/react-query';

interface Props {
	id: number;
}

const TicketConfigurations = ({ id }: Props) => {
	const { data: ticketConfigs } = useSuspenseQuery(ticketConfigurationsQuery(id));

	const {
		data: { data: configurations },
	} = useSuspenseQuery(
		getConfigurationsQuery({
			conditions: {
				id: ticketConfigs.map((config) => config.id),
			},
		})
	);

	return (
		<section className='space-y-1.5'>
			<h4>Configuration</h4>

			{configurations.map((configuration) => {
				const icon = configurationIcons.find((c) => c.type === configuration.type.name);

				return (
					<p key={configuration.id}>
						{icon && <icon.icon className='w-4 h-4 mr-2' />}
						{configuration.name}
					</p>
				);
			})}
		</section>
	);
};

export default TicketConfigurations;
