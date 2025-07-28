import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColoredBadge } from '@/components/ui/badge';
import { getCompanyQuery } from '@/lib/manage/api';
import { getCompany } from '@/lib/manage/read';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Circle } from 'lucide-react';

export default function CompanyHeader({ id }: { id: string }) {
	const { data: company } = useSuspenseQuery(getCompanyQuery(Number(id)));

	return (
		<header className='flex items-center gap-3 px-3 mt-3'>
			<Avatar className='size-20 rounded-full object-cover'>
				<AvatarFallback className='text-2xl font-semibold uppercase'>
					{company.name[0]}
					{company.name[1]}
				</AvatarFallback>

				<AvatarImage
					src={`https://logo.clearbit.com/${company.website}`}
					className='object-cover'
				/>
			</Avatar>

			<div className='space-y-[1ch]'>
				<div className='flex items-center gap-[1ch]'>
					<h1 className='text-xl font-semibold'>{company.name}</h1>

					{company?.types?.map((type) => (
						<ColoredBadge
							variant={type.name === 'VIP' ? 'yellow' : 'gray'}
							key={type.id + (type?.identity ?? '')}
						>
							<Circle className='size-1.5 mr-1.5 fill-inherit' /> {type.name}
						</ColoredBadge>
					))}
				</div>

				<div className='flex items-center gap-[1ch]'>
					{company && (
						<p className='text-sm text-muted-foreground relative grow-0 shrink'>
							{company.territory?.name}
						</p>
					)}

					{company?.types?.some((type) => type.id === 57) && (
						<ColoredBadge
							className='rounded-md'
							variant='green'
						>
							Green
						</ColoredBadge>
					)}
					{company?.types?.some((type) => type.id === 56) && (
						<ColoredBadge
							className='rounded-md'
							variant='yellow'
						>
							Yellow
						</ColoredBadge>
					)}
					{company?.types?.some((type) => type.id === 55) && (
						<ColoredBadge
							className='rounded-md'
							variant='red'
						>
							Red
						</ColoredBadge>
					)}
				</div>
			</div>
		</header>
	);
}
