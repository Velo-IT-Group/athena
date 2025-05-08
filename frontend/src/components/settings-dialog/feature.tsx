import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { setCookie } from '@tanstack/react-start/server';

type Props = {};

const features = [
	{
		id: 'hideQueueStatus',
		name: 'Hide Queue Status',
		description: 'Display queue status in right hand sidebar.',
		defaultValue: false,
	},
];

const SettingsDialogFeatureForm = (props: Props) => {
	return (
		<form>
			<section>
				<form className='flex items-center justify-between'>
					{features.map((feature) => (
						<Label
							key={feature.id}
							htmlFor={feature.id}
						>
							<Switch
								id={feature.id}
								name={feature.id}
								onCheckedChange={(e) => setCookie(feature.id, String(e))}
							/>
							<div>
								<h4 className='font-medium'>{feature.name}</h4>
								<p className='text-sm text-muted-foreground'>{feature.description}</p>
							</div>
						</Label>
					))}
				</form>
			</section>
		</form>
	);
};

export default SettingsDialogFeatureForm;
