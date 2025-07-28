import Tiptap from '@/components/tip-tap';
import { Button } from '@/components/ui/button';
import {
	Building,
	Building2,
	ChevronDown,
	Circle,
	Copy,
	Ellipsis,
	Kanban,
	PanelsLeftBottom,
	PanelsTopLeft,
	Pin,
	Settings,
	X,
} from 'lucide-react';
import { useMemo } from 'react';
import { AsyncSelect } from '@/components/ui/async-select';
import { getBoards, getStatuses, getSystemMembers } from '@/lib/manage/read';
import { CommandItem } from '@/components/ui/command';

import { SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { getScheduleEntriesQuery, getTicketNotesQuery, getTicketQuery } from '@/lib/manage/api';
import { ColoredBadge } from '@/components/ui/badge';

export const TicketPane = ({ id }: { id: number }) => {
	const [
		// {},
		{ data },
		{ data: notes },
		{ data: scheduleEntries },
		// { data: task },
	] = useSuspenseQueries({
		queries: [
			// { queryKey: ['wait', id], queryFn: () => wait(5000) },
			getTicketQuery(id),
			getTicketNotesQuery(id),
			getScheduleEntriesQuery({
				conditions: {
					'type/id': 4,
					objectId: id,
					// doneFlag: false,
					// date: {
					// 	from: new Date().toISOString(),
					// 	to: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
					// },
				},
				fields: ['id', 'member'],
			}),
		],
	});

	return (
		<>
			<SheetHeader className='border-b'>
				<div className='flex items-centerhas-[>svg]:size-5'>
					<SheetTitle className='text-4xl font-normal'>
						{data?.summary} <span className='text-muted-foreground ml-[0.5ch]'>#{data?.id}</span>
					</SheetTitle>

					<Button
						variant='outline'
						className='ml-auto'
					>
						Edit
					</Button>

					<Button
						variant='ghost'
						size='icon'
					>
						<Copy />
					</Button>

					<Button
						variant='ghost'
						size='icon'
					>
						<Pin />
					</Button>

					<Button
						variant='ghost'
						size='icon'
					>
						<Ellipsis />
					</Button>

					<Button
						variant='ghost'
						size='icon'
					>
						<X />
					</Button>
				</div>

				<SheetDescription asChild>
					<div className='flex items-center gap-1.5'>
						<ColoredBadge
							variant='purple'
							className='text-lg rounded-full'
						>
							<Circle className='stroke-0 fill-inherit' /> {data?.status?.name}
						</ColoredBadge>
					</div>
				</SheetDescription>
			</SheetHeader>

			<div className='grid items-start grid-cols-[1fr_296px] gap-6 px-6'>
				<InitalNote note={notes?.find((note) => note.detailDescriptionFlag)} />

				<aside>
					<PropertySection>
						<AsyncSelect
							label='Resources'
							side='left'
							fetcher={async (value, page) => {
								const members = await getSystemMembers({
									data: {
										conditions: `inactiveFlag = false and timeApprover/id != 117 and (firstName like '${value}' or lastName like '${value}')`,
										orderBy: { key: 'firstName' },
										page,
									},
								});

								return members;
							}}
							renderOption={(item) => (
								<CommandItem value={item.id.toString()}>
									<ManageUserAvatar
										size='sm'
										memberId={item.id}
									/>
									<span>
										{item.firstName} {item.lastName}
									</span>
								</CommandItem>
							)}
							getOptionValue={(item) => item.id.toString()}
							getDisplayValue={(item) => item.firstName + ' ' + item.lastName}
							value={''}
							onChange={async (value) => {
								if (!value) {
									return;
								}
							}}
						>
							<Button
								variant='ghost'
								className='flex items-center gap-3 px-0 justify-between w-full data-[state=open]:bg-muted'
							>
								<h4>Resources</h4>
								<Settings />
							</Button>
						</AsyncSelect>

						{scheduleEntries.length ? (
							scheduleEntries.map((entry) => (
								<Button
									variant='ghost'
									className='w-full justify-start'
								>
									<ManageUserAvatar
										size='sm'
										memberId={entry.member.id}
									/>

									<span>{entry.member.name}</span>
								</Button>
							))
						) : (
							<span className='ml-3 text-muted-foreground text-sm'>
								No resources assigned -{' '}
								<Button
									variant='link'
									// className='w-full justify-start'
								>
									{' '}
									Assign yourself
								</Button>
							</span>
						)}
					</PropertySection>

					<PropertySection>
						<PropertyGroup
							title={
								<div className='flex items-center gap-1.5'>
									<Building />
									<span>Company</span>
								</div>
							}
						>
							<Collapsible className='w-full'>
								<div className='flex items-center gap-1.5 w-full text-sm'>
									<p className='text-muted-foreground font-medium'>Contact</p>

									<ColoredBadge>{data?.contact?.name}</ColoredBadge>

									<CollapsibleTrigger asChild>
										<Button
											variant='ghost'
											size='icon'
											className='ml-auto [&[data-state=open]>svg]:rotate-180 data-[state=open]:bg-muted'
										>
											<ChevronDown className='transition-all duration-200 ' />
										</Button>
									</CollapsibleTrigger>
								</div>

								<CollapsibleContent className='grid grid-cols-[0.75fr_2fr] gap-1.5 text-sm p-1.5 items-center'>
									<p className='text-muted-foreground font-semibold'>Site</p>

									<Button
										variant='ghost'
										className={cn(
											'w-full justify-start text-xs',
											!data?.site?.name && 'text-muted-foreground'
										)}
									>
										{data?.site?.name ?? 'Choose an option'}
									</Button>
								</CollapsibleContent>
							</Collapsible>
						</PropertyGroup>
					</PropertySection>

					<PropertySection>
						<Button
							variant='ghost'
							className='flex items-center gap-3 px-0 justify-between w-full data-[state=open]:bg-muted -mr-3'
						>
							<h4>Board</h4>
							<Settings />
						</Button>

						<PropertyGroup
							title={
								<div className='flex items-center gap-1.5'>
									<PanelsTopLeft />
									<span>{data.board?.name}</span>
								</div>
							}
						>
							<Collapsible className='w-full'>
								<div className='flex items-center gap-1.5 w-full text-sm'>
									<p className='text-muted-foreground font-medium'>Status</p>

									<ColoredBadge>{data?.status?.name}</ColoredBadge>

									<CollapsibleTrigger asChild>
										<Button
											variant='ghost'
											size='icon'
											className='ml-auto [&[data-state=open]>svg]:rotate-180 data-[state=open]:bg-muted'
										>
											<ChevronDown className='transition-all duration-200 ' />
										</Button>
									</CollapsibleTrigger>
								</div>

								<CollapsibleContent className='grid grid-cols-[0.75fr_2fr] gap-1.5 text-sm p-1.5 items-center'>
									<p className='text-muted-foreground font-semibold'>Status</p>

									<Button
										variant='ghost'
										className={cn(
											'w-full justify-start text-xs',
											!data?.status?.name && 'text-muted-foreground'
										)}
									>
										{data?.status?.name ?? 'Choose an option'}
									</Button>

									<p className='text-muted-foreground font-semibold'>Type</p>

									<Button
										variant='ghost'
										className={cn(
											'w-full justify-start text-xs',
											!data?.status?.name && 'text-muted-foreground'
										)}
									>
										{data?.type?.name ?? 'Choose an option'}
									</Button>

									<p className='text-muted-foreground font-semibold'>Subtype</p>

									<Button
										variant='ghost'
										className={cn(
											'w-full justify-start text-xs',
											!data?.status?.name && 'text-muted-foreground'
										)}
									>
										{data?.subType?.name ?? 'Choose an option'}
									</Button>

									<p className='text-muted-foreground font-semibold'>Item</p>

									<Button
										variant='ghost'
										className={cn(
											'w-full justify-start text-xs',
											!data?.item?.name && 'text-muted-foreground'
										)}
									>
										{data?.item?.name ?? 'Choose an option'}
									</Button>
								</CollapsibleContent>
							</Collapsible>
						</PropertyGroup>
					</PropertySection>
				</aside>
			</div>
		</>
	);
};

export function PropertySection({ children }: { children: React.ReactNode }) {
	return <div className='border-b py-3 first:pt-0 last:pb-0 last:border-b-0 -ml-3 space-y-1.5'>{children}</div>;
}

export function PropertyGroup({ title, children }: { title: string | React.ReactNode; children: React.ReactNode }) {
	return (
		<div className='border rounded-md p-3'>
			<h4>{title}</h4>
			{children}
		</div>
	);
}

import ManageUserAvatar from '@/components/avatar/manage-user-avatar';
import type { ServiceTicketNote } from '@/types/manage';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSuspenseQueries } from '@tanstack/react-query';
import { wait } from '@/utils/helpers';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export function InitalNote({ note }: { note?: ServiceTicketNote }) {
	return (
		<div>
			<div
				className='Box-sc-g0xbh4-0 gRssIw'
				style={{ gap: '16px', display: 'flex' }}
			>
				<a
					className='Avatar-module__avatarLink--S36bm Avatar-module__avatarOuter--MZJZH prc-Link-Link-85e08'
					aria-label="@github-product-roadmap's profile"
					href='https://github.com/github-product-roadmap'
					style={{ display: 'none', cursor: 'pointer', height: '100%' }}
				>
					<img
						className='Avatar-module__issueViewerAvatar--grA_h prc-Avatar-Avatar-ZRS-m'
						height={40}
						width={40}
						alt='@github-product-roadmap'
						src='https://avatars.githubusercontent.com/u/67656570?u=71034939d8d88be6d9b9068038dfdc8158fa69c0&v=4&size=80'
						style={{ flexShrink: 0 }}
					/>
				</a>
				<div
					className='Box-sc-g0xbh4-0 bDlPR react-issue-body'
					style={{ MozBoxFlex: '1', flexGrow: 1, minWidth: '0px', order: 0 }}
				>
					<h2
						className='sr-only'
						style={{
							padding: '0px',
							overflow: 'hidden',
							border: '0px',
							position: 'absolute',
							width: '1px',
							height: '1px',
							clipPath: 'rect(0px 0px 0px 0px)',
							overflowWrap: 'normal',
						}}
					>
						Description
					</h2>
					<div
						className='Box-sc-g0xbh4-0 crMLA-D'
						style={{ gap: '8px', display: 'flex', flexDirection: 'row' }}
					>
						<div
							className='rounded-md'
							style={{
								borderWidth: '1px',
								borderStyle: 'solid',
								borderImage: 'none',
								borderColor: 'var(--borderColor-default,var(--color-border-default,#d0d7de))',
								MozBoxFlex: '1',
								flexGrow: 1,
								width: '100%',
								minWidth: '0px',
							}}
						>
							<div
								className='bg-primary/10 p-1.5 pl-3'
								style={{
									flexFlow: 'wrap',
									flex: '1 1 0%',
									// padding: '4px 4px 4px 16px',
									overflow: 'hidden',
									// backgroundColor: 'var(--bgColor-muted,var(--color-canvas-subtle,#f6f8fa))',
									borderTopLeftRadius: '6px',
									borderTopRightRadius: '6px',
									borderBottomWidth: '1px',
									borderBottomStyle: 'solid',
									borderBottomColor:
										'var(--borderColor-muted,var(--color-border-muted,hsla(210,18%,87%,1)))',
									color: 'var(--fgColor-muted,var(--color-fg-muted,#57606a))',
									display: 'flex',
									fontSize: '14px',
									MozBoxPack: 'justify',
									justifyContent: 'space-between',
									MozBoxAlign: 'center',
									alignItems: 'center',
								}}
							>
								<div
									className='Box-sc-g0xbh4-0 fnEhwD ActivityHeader-module__activityHeader--Flalv'
									style={{
										display: 'grid',
										gridTemplateAreas:
											'"avatar title title title badges actions" "avatar footer footer footer footer edits"',
										gridTemplateColumns: 'auto 1fr auto auto auto auto',
										width: '100%',
										minWidth: '0px',
										minHeight: 'var(--control-small-size,28px)',
										MozBoxPack: 'justify',
										justifyContent: 'space-between',
										MozBoxAlign: 'stretch',
										alignItems: 'stretch',
										paddingBottom: '0px',
									}}
								>
									<div
										className='Box-sc-g0xbh4-0 iKiGfw Avatar-module__avatarInner--rVuJD'
										style={{
											placeSelf: 'center',
											gridArea: 'avatar',
											marginRight: '8px',
											display: 'flex',
										}}
									>
										<a
											className='Avatar-module__avatarLink--S36bm prc-Link-Link-85e08'
											aria-label="@github-product-roadmap's profile"
											href='https://github.com/github-product-roadmap'
											style={{ cursor: 'pointer', height: '100%' }}
										>
											<img
												className='prc-Avatar-Avatar-ZRS-m'
												height={24}
												width={24}
												alt='@github-product-roadmap'
												src='https://avatars.githubusercontent.com/u/67656570?u=71034939d8d88be6d9b9068038dfdc8158fa69c0&v=4&size=48'
											/>
										</a>
									</div>
									<div
										className='Box-sc-g0xbh4-0 koxHLL ActivityHeader-module__narrowViewportWrapper--Hjl75'
										style={{
											display: 'flex',
											gridColumn: 'title / badges',
											minWidth: '0px',
											flexWrap: 'wrap',
											MozBoxAlign: 'center',
											alignItems: 'center',
											flexShrink: 1,
											flexBasis: 'auto',
											columnGap: '0.45ch',
											paddingTop: '4px',
											paddingBottom: '4px',
										}}
									>
										<div
											className='Box-sc-g0xbh4-0 dqmClk'
											style={{
												gridArea: 'title',
												overflow: 'hidden',
												marginTop: '0px',
												MozBoxAlign: 'center',
												alignItems: 'center',
												display: 'flex',
												flexShrink: 1,
												flexBasis: 'auto',
											}}
										>
											<a
												className='Box-sc-g0xbh4-0 Iynuz prc-Link-Link-85e08'
												href='https://github.com/github-product-roadmap'
												style={{
													gridArea: 'login',
													overflow: 'hidden',
													whiteSpace: 'nowrap',
													color: 'var(--fgColor-default,var(--color-fg-default,#24292f))',
													fontWeight: 500,
													flexShrink: 1,
													textOverflow: 'ellipsis',
													alignSelf: 'flex-end',
												}}
											>
												github-product-roadmap
											</a>
										</div>
										<div
											className='Box-sc-g0xbh4-0 bJQcYY ActivityHeader-module__footer--FVHp7'
											style={{
												fontSize: 'var(--text-body-size-small,12px)',
												gridArea: 'footer',
												lineHeight: 1.4,
												paddingBottom: '0px',
											}}
										>
											<span>opened </span>
											<a
												className='Box-sc-g0xbh4-0 dEDevN prc-Link-Link-85e08'
												href='https://github.com/github/roadmap/issues/928#issue-2159789196'
												style={{
													color: 'var(--fgColor-muted,var(--color-fg-muted,#57606a))',
												}}
											>
												<relative-time
													className='sc-aXZVg gcWyXp'
													dateTime='2024-02-28T20:13:11.000Z'
													title='Feb 28, 2024, 12:13 PM PST'
													style={{
														whiteSpace: 'nowrap',
														fontSize: 'inherit',
													}}
												>
													on Feb 28, 2024
												</relative-time>
											</a>
											<span
												className='MarkdownLastEditedBy-module__container--fKxHN'
												style={{
													overflow: 'hidden',
													color: '#59636e',
													fontSize: '0.875rem',
												}}
											>
												<span> · </span>
												<span>
													edited by{' '}
													<a
														className='Box-sc-g0xbh4-0 dEDevN prc-Link-Link-85e08'
														href='https://github.com/github-product-roadmap'
														style={{
															color: 'var(--fgColor-muted,var(--color-fg-muted,#57606a))',
														}}
													>
														github-product-roadmap
													</a>
												</span>
											</span>
										</div>
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant='ghost'
												size='icon'
												className='hover:bg-primary/15 hover:text-primary'
											>
												<Ellipsis />
											</Button>
										</DropdownMenuTrigger>
									</DropdownMenu>
								</div>
							</div>

							<Tiptap
								content={note?.text ?? ''}
								editorClassName='py-0'
								className='py-0'
								editable={false}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
