import React from 'react';
import { SlashIcon } from 'lucide-react';
import NavigationTabs from './tabs';
// import { createClient } from '@/utils/supabase/server';
// import NavbarTitleEditor from './navbar-title-editor'
import { Link } from '@tanstack/react-router';
import TabsList from '@/components/tabs-list';
import type { NavItem } from '@/types/nav';

type Props = {
	title?: string;
	titleEditable?: boolean;
	titleId?: string;
	children?: React.ReactNode;
	org: string;
	version?: number;
	tabs?: NavItem[];
};

const Navbar = ({ title, titleEditable, titleId, children, org, version, tabs }: Props) => {
	// const supabase = await createClient();

	// const {
	// 	data: { user },
	// } = await supabase.auth.getUser();

	return (
		<>
			<nav className='flex flex-col sm:flex-row items-center gap-4 w-full px-8 h-16 bg-background'>
				{org ? (
					<>
						<Link to='/'>{/* <Logo /> */}</Link>
						<SlashIcon className='h-4 opacity-15' />
					</>
				) : (
					<></>
					// <Logo />
				)}

				{org && (
					<Link
						to='/'
						className='font-semibold hover:underline'
					>
						Velo IT Group
					</Link>
				)}

				{title && (
					<>
						<SlashIcon className='h-4 opacity-15' />
						{titleEditable && titleId ? (
							<>{/* <NavbarTitleEditor id={titleId} title={title} /> */}</>
						) : (
							<>
								<span className='font-semibold'>{title}</span>
							</>
						)}
					</>
				)}

				{version && (
					<>
						<SlashIcon className='h-4 opacity-15' />
						<span className='font-semibold'>{`V${version}`}</span>
					</>
				)}

				{children && (
					<div className='ml-auto flex items-center gap-4'>
						{children}
						{/* {user && (
                            <>
                                <UserNav user={user} />
                            </>
                        )} */}
					</div>
				)}
			</nav>
			{tabs && <TabsList links={tabs} />}
		</>
	);
};

export default Navbar;
