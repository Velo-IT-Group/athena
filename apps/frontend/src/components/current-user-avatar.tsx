import { useCurrentUserImage } from '@/hooks/use-current-user-image';
import { useCurrentUserName } from '@/hooks/use-current-user-name';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import type { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

export const CurrentUserAvatar = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
	const profileImage = useCurrentUserImage();
	const name = useCurrentUserName();
	const initials = name
		?.split(' ')
		?.map((word) => word[0])
		?.join('')
		?.toUpperCase();

	const supabase = createClient();

	async function updateProfile(event: ChangeEvent<HTMLInputElement>, avatarUrl: string) {
		event.preventDefault();

		const { data } = await supabase.auth.getSession();
		const updates = {
			...data.session?.user.user_metadata,
			id: data.session?.user.id,
			avatar_url: avatarUrl,
			updated_at: new Date(),
		};

		const { error } = await supabase.auth.updateUser({ data: updates });

		if (error) {
			alert(error.message);
		} else {
			// setAvatarUrl(avatarUrl);
		}
		// setLoading(false);
	}

	async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
		try {
			// setUploading(true);

			if (!event.target.files || event.target.files.length === 0) {
				throw new Error('You must select an image to upload.');
			}

			const file = event.target.files[0];
			const fileExt = file.name.split('.').pop();
			const fileName = `${Math.random()}.${fileExt}`;
			const filePath = `${fileName}`;

			const { error: uploadError, data } = await supabase.storage.from('avatars').upload(filePath, file);

			if (uploadError) {
				throw uploadError;
			}

			const {
				data: { publicUrl },
			} = supabase.storage.from('avatars').getPublicUrl(data?.path);

			updateProfile(event, publicUrl);
		} catch (error) {
			alert((error as Error).message);
		} finally {
			// setUploading(false);
		}
	}

	return (
		<Avatar
			className={cn('size-7', size === 'md' && 'size-9', size === 'lg' && 'size-12', size === 'xl' && 'size-16')}
		>
			{profileImage && (
				<AvatarImage
					src={profileImage}
					alt={initials}
				/>
			)}
			<AvatarFallback>{initials}</AvatarFallback>
			<input
				style={{
					// visibility: 'hidden',
					position: 'absolute',
				}}
				className='inset-0 z-10 h-full w-full opacity-0'
				type='file'
				id='single'
				accept='image/*'
				onChange={uploadAvatar}
				// disabled={uploading}
			/>
		</Avatar>
	);
};
