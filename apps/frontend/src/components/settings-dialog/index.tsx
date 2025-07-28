import { Headset, LayoutPanelLeft, Monitor, User } from 'lucide-react';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import type { Session } from '@supabase/supabase-js';
import { useState } from 'react';
import SettingsDialogProfileForm from '@/components/settings-dialog/profile';
import SettingsDialogDisplayForm from '@/components/settings-dialog/display';
import SettingsDialogDevices from '@/components/settings-dialog/devices';

const data = {
	nav: [
		{ name: 'Profile', icon: User },
		{ name: 'Features', icon: LayoutPanelLeft },
		{ name: 'Display', icon: Monitor },
		{ name: 'Devices', icon: Headset },
	],
};

export function SettingsDialog({ session }: { session: Session }) {
	// (typeof data.nav)[number]
	const [selectedTab, setSelectedTab] = useState<
		(typeof data.nav)[number]['name']
	>(data.nav[0].name);

	return (
		<DialogContent className='overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]'>
			<DialogTitle className='sr-only'>Settings</DialogTitle>
			<DialogDescription className='sr-only'>
				Customize your settings here.
			</DialogDescription>

			<SidebarProvider className='items-start'>
				<Sidebar
					collapsible='none'
					className='hidden md:flex'
				>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupContent>
								<SidebarMenu>
									{data.nav.map((item) => (
										<SidebarMenuItem key={item.name}>
											<SidebarMenuButton
												isActive={
													selectedTab === item.name
												}
												onClick={() =>
													setSelectedTab(item.name)
												}
											>
												<item.icon />
												<span>{item.name}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>

				<main className='flex h-[480px] flex-1 flex-col overflow-hidden'>
					<header className='flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
						<div className='flex items-center gap-2 px-4'>
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className='hidden md:block'>
										<BreadcrumbLink href='#'>
											Settings
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem>
										<BreadcrumbPage>
											{selectedTab}
										</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>

					<div className='flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0'>
						{selectedTab === 'Profile' && (
							<SettingsDialogProfileForm />
						)}

						{selectedTab === 'Features' && (
							<form className='flex items-center justify-between'>
								<div>
									<h4 className='font-medium'>
										Hide Queue Status
									</h4>
									<p className='text-sm text-muted-foreground'>
										Display queue status in right hand
										sidebar.
									</p>
								</div>

								<Switch
								// checked={storedValue === 'true'}
								// onCheckedChange={modifyQueueStatusVisibility}
								/>

								{/* <CurrentUserAvatar /> */}
							</form>
						)}

						{selectedTab === 'Display' && (
							<SettingsDialogDisplayForm />
						)}

						{selectedTab === 'Devices' && <SettingsDialogDevices />}
					</div>
				</main>
			</SidebarProvider>
		</DialogContent>
	);
}
