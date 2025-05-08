import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import type { NavSection } from '@/types/nav';
import NavigationItem from './navigation-item';

type Props = { section: NavSection };

const NavigationSection = ({ section }: Props) => (
	<SidebarGroup>
		{section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}

		<SidebarGroupContent>
			<SidebarMenu>
				{section.items.map((item, index) => (
					<NavigationItem
						key={`${item.title}-${item.href ?? index ?? ''}`}
						item={item}
					/>
				))}
			</SidebarMenu>
		</SidebarGroupContent>
	</SidebarGroup>
);

export default NavigationSection;
