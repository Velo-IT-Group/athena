import { createClient } from '@/lib/supabase/server';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
interface Props {
	children: ReactNode;
	id: string;
	version: string;
	// onUpload?: (
	// 	results: {
	// 		file_path: string[];
	// 		mimetype: string;
	// 		size: number;
	// 	}[]
	// ) => void;
}

const ProposalDropZone = ({ children, id, version }: Props) => {
	const supabase = createClient();
	const [progress, setProgress] = useState(0);
	const [showProgress, setShowProgress] = useState(false);
	const [toastId, setToastId] = useState<string | number | null>(null);
	const uploadProgress = useRef([]);
	//   const { toast, dismiss, update } = useToast();

	const props = useSupabaseUpload({
		bucketName: 'attachments',
		path: `proposals/${id}/${version}`,
		allowedMimeTypes: ['image/*'],
		maxFiles: 2,
		maxFileSize: 1000 * 1000 * 10, // 10MB,
		upsert: true,
	});

	const processDocumentMutation = useMutation(
		{}
		// trpc.documents.processDocument.mutationOptions(),
	);

	useEffect(() => {
		if (!toastId && showProgress) {
			//     {
			//     title: `Uploading ${uploadProgress.current.length} files`,
			//     progress,
			//     variant: "progress",
			//     description: "Please do not close browser until completed",
			//     duration: Number.POSITIVE_INFINITY,
			//   }
			const id = toast.custom((id) => <div>Uploading files...</div>);

			setToastId(id);
		} else {
			//   update(toastId, {
			//     progress,
			//     title: `Uploading ${uploadProgress.current.length} files`,
			//   });
		}
	}, [showProgress, progress, toastId]);

	const onDrop = async (files: File[]) => {
		// NOTE: If onDropRejected
		if (!files.length) {
			return;
		}

		// Set default progress
		// uploadProgress.current = files.map(() => 0);

		setShowProgress(true);

		// Add uploaded (team_id)
		const path = [];

		try {
			const results = await Promise.all(
				files.map(
					async (file: File, idx: number) => {}
					//   resumableUpload(supabase, {
					//     bucket: "vault",
					//     path: [user?.team_id],
					//     file,
					//     onProgress: (bytesUploaded, bytesTotal) => {
					//       uploadProgress.current[idx] = (bytesUploaded / bytesTotal) * 100;

					//       const _progress = uploadProgress.current.reduce(
					//         (acc, currentValue) => {
					//           return acc + currentValue;
					//         },
					//         0,
					//       );

					//       setProgress(Math.round(_progress / files.length));
					//     },
					//   }),
				)
			);

			// Trigger the upload jobs
			processDocumentMutation
				.mutate
				// results.map((result) => ({
				//   file_path: [...path, result.filename],
				//   mimetype: result.file.type,
				//   size: result.file.size,
				// })),
				();

			// Reset once done
			uploadProgress.current = [];

			setProgress(0);
			//   toast({
			//     title: "Upload successful.",
			//     variant: "success",
			//     duration: 2000,
			//   });

			//   setShowProgress(false);
			//   setToastId(null);
			//   dismiss(toastId);
			// onUpload?.(results);
		} catch {
			//   toast({
			//     duration: 2500,
			//     variant: "error",
			//     title: "Something went wrong please try again.",
			//   });
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		onDropRejected: ([reject]) => {
			if (reject?.errors.find(({ code }) => code === 'file-too-large')) {
				// {
				//   duration: 2500,
				//   variant: "error",
				//   title: "",
				// }
				toast.error('File size to large.', { duration: 2500 });
			}

			if (reject?.errors.find(({ code }) => code === 'file-invalid-type')) {
				toast.error('File type not supported.', { duration: 2500 });
			}
		},
		maxSize: 5000000, // 5MB
		maxFiles: 25,
		accept: {
			'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.avif'],
			'application/pdf': ['.pdf'],
			'application/msword': ['.doc'],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
			'application/vnd.oasis.opendocument.text': ['.odt'],
			'application/vnd.ms-excel': ['.xls'],
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
			'application/vnd.ms-powerpoint': ['.ppt'],
			'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
			'application/vnd.oasis.opendocument.presentation': ['.odp'],
			'text/plain': ['.txt'],
			'text/csv': ['.csv'],
			'text/markdown': ['.md'],
			'application/rtf': ['.rtf'],
			'application/zip': ['.zip'],
			// "application/epub+zip": [".epub"],
			// "application/vnd.apple.pages": [".pages"],
		},
	});

	return (
		<div
			className='relative h-full'
			{...getRootProps({ onClick: (evt) => evt.stopPropagation() })}
		>
			<div className='absolute top-0 right-0 left-0 z-[51] w-full pointer-events-none h-[calc(100vh-150px)]'>
				<div
					className={cn(
						'bg-background dark:bg-[#1A1A1A] h-full w-full flex items-center justify-center text-center',
						isDragActive ? 'visible' : 'invisible'
					)}
				>
					<input
						{...getInputProps()}
						id='upload-files'
					/>

					<div className='flex flex-col items-center justify-center gap-2'>
						<p className='text-xs'>
							Drop your documents and files here. <br />
							Maximum of 25 files at a time.
						</p>

						<span className='text-xs text-[#878787]'>Max file size 5MB</span>
					</div>
				</div>
			</div>

			{children}
		</div>
	);
};

export default ProposalDropZone;
