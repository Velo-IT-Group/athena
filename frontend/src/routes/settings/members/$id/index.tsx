import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Editable, EditableArea, EditableInput, EditableLabel, EditablePreview } from '@/components/ui/editable';
import { getProfile, getProfilePhoneNumber } from '@/lib/supabase/read';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const editSchema = z.object({
	edit: z.boolean().optional(),
});

export const Route = createFileRoute('/settings/members/$id/')({
	component: RouteComponent,
	validateSearch: editSchema,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { edit } = Route.useSearch();
	const [{ data }, { data: phoneData }] = useSuspenseQueries({
		queries: [
			{
				queryKey: ['profiles', id],
				queryFn: () => getProfile({ data: id }),
			},
			{
				queryKey: ['profiles', id, 'phone_numbers'],
				queryFn: () => getProfilePhoneNumber({ data: id }),
			},
		],
	});

	const details = [
		{
			items: [
				{ label: 'First Name', value: data.first_name },
				{ label: 'Last Name', value: data.last_name },
				{ label: 'Username', value: data.username },
				{ label: 'Phone', value: phoneData?.phone_number },
			],
		},
		{
			items: [
				{ label: 'First Name', value: data.first_name },
				{ label: 'Last Name', value: data.last_name },
				{ label: 'Username', value: data.username },
				{ label: 'Phone', value: phoneData?.phone_number },
			],
		},
	];

	return (
		<>
			<section className='space-y-1.5'>
				<h2 className='px-3'>Personal Details</h2>

				<Card>
					<CardContent className='grid grid-cols-[0.25fr_1fr_1fr] gap-6'>
						<div className='space-y-3'>
							<Avatar className='size-16'>
								{/* <AvatarImage src={data.avatar_url} /> */}
								<AvatarFallback className='text-2xl'>NB</AvatarFallback>
							</Avatar>

							<div>
								<h3 className='font-semibold'>
									{data?.first_name} {data?.last_name}
								</h3>

								<p className='text-sm text-muted-foreground'>{data.username}</p>
							</div>
						</div>

						{details.map(({ items }, index) => (
							<div key={items.length + index}>
								{items.map((d) => (
									<Editable
										key={d.label}
										editing={edit}
										defaultValue={d.value ?? undefined}
										className='grid grid-cols-[1fr_3fr] items-center gap-1.5'
									>
										<EditableLabel className='text-sm text-muted-foreground'>
											{d.label}
										</EditableLabel>

										<EditableArea>
											<EditablePreview className='px-1.5' />
											<EditableInput className='px-1.5' />
										</EditableArea>
									</Editable>
								))}
							</div>
						))}
					</CardContent>
				</Card>
			</section>
		</>
	);
}
