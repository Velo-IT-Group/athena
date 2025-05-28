import LabeledInput from '@/components/labeled-input';
import { ListSelector } from '@/components/list-selector';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme, type Theme } from '@/providers/theme-provider';
import { ChevronDown } from 'lucide-react';

type Props = {};

const SettingsDialogDisplayForm = (props: Props) => {
	const { theme, setTheme } = useTheme();

	const themes = ['light', 'dark', 'system'];

	return (
		<form>
			<section>
				<LabeledInput label='Theme'>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								size='sm'
								className='capitalize w-1/3 justify-between gap-1.5'
							>
								<span>{theme}</span>
								<ChevronDown />
							</Button>
						</PopoverTrigger>

						<PopoverContent
							className='p-0 capitalize'
							align='start'
						>
							<ListSelector
								items={themes.map((theme) => ({ label: theme, value: theme }))}
								currentValue={{ label: theme, value: theme }}
								onSelect={(value) => setTheme(value.value.toLowerCase() as Theme)}
								itemView={(item) => <span className='capitalize'>{item.label}</span>}
							/>
						</PopoverContent>
					</Popover>
				</LabeledInput>
			</section>
		</form>
	);
};

export default SettingsDialogDisplayForm;
