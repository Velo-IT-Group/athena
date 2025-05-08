import { CurrentUserAvatar } from '@/components/current-user-avatar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Props = {};

const SettingsDialogProfileForm = (props: Props) => {
	return (
		<form className='space-y-6'>
			<section className='flex items-center gap-3'>
				<CurrentUserAvatar size='xl' />

				<label
					className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
					htmlFor='file_input'
				>
					Upload file
				</label>
				<input
					className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400'
					aria-describedby='file_input_help'
					id='file_input'
					type='file'
				/>
				<p
					className='mt-1 text-sm text-gray-500 dark:text-gray-300'
					id='file_input_help'
				>
					SVG, PNG, JPG or GIF (MAX. 800x400px).
				</p>

				{/* <input
					type='file'
					id='single'
					accept='image/*'
					// onChange={uploadAvatar}
					// disabled={uploading}
				/> */}

				{/* <div>
					<div>
						<Button
							variant='link'
							size='sm'
							className='pl-0 text-blue-500'
						>
							Upload new photo
						</Button>
						•
						<Button
							variant='link'
							size='sm'
							className='text-blue-500'
						>
							Remove photo
						</Button>
					</div>

					<p>Photos help your teammates recogize you in Athena</p>
				</div> */}
			</section>

			<section>
				<Label htmlFor='outOfOffice'>
					<Switch
						id='outOfOffice'
						name='outOfOffice'
					/>
					Set out of office
				</Label>
			</section>
		</form>
	);
};

export default SettingsDialogProfileForm;
