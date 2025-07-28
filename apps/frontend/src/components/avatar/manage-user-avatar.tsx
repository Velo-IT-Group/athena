import { useQuery } from '@tanstack/react-query';
import { getSystemMemberImageQuery } from '@/lib/manage/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface Props {
	memberId?: number | null;
	contactId?: number | null;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
}

const ManageUserAvatar = ({ memberId, contactId, size = 'sm', className }: Props) => {
	const memberImageQuery = getSystemMemberImageQuery(memberId ?? undefined);
	const { data: blob } = useQuery(memberImageQuery);

	const { data } = useQuery({
		queryKey: memberId ? ['members', memberId, 'image', blob] : ['contacts', contactId, 'image', blob],
		queryFn: async () => {
			if (!blob) return undefined;
			const img = new Image();
			const imageUrl = URL.createObjectURL(blob);
			img.src = imageUrl;

			// newer promise based version of img.onload
			await img.decode();

			return imageUrl;
		},
		enabled: !!blob && (!!memberId || !!contactId),
		staleTime: Infinity,
		gcTime: Infinity,
		networkMode: 'offlineFirst',
	});

	return (
		<Avatar
			className={cn(
				className,
				'size-7',
				size === 'md' && 'size-9',
				size === 'lg' && 'size-12',
				size === 'xl' && 'size-16'
			)}
		>
			<AvatarFallback>
				<User className='size-4 stroke-[2]' />
			</AvatarFallback>
			<AvatarImage
				src={data}
				alt={data?.charAt(0)}
			/>
		</Avatar>
	);
};

export default ManageUserAvatar;
