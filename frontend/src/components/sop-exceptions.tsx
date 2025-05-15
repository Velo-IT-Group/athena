'use client';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Content } from '@tiptap/core';
import { relativeDate } from '@/utils/date';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ColoredBadge } from '@/components/ui/badge';
import { RefreshCcw, ShieldAlert } from 'lucide-react';
import { Operation, PatchOperation } from '@/types';
import Tiptap from '@/components/tip-tap';
import type { CompanyNote } from '@/types/manage';
import { getCompanyNotesQuery } from '@/lib/manage/api';
import { createCompanyNote } from '@/lib/manage/create';

type Props = {
	note?: CompanyNote;
	companyId: number;
	isEditable?: boolean;
	className?: string;
};

const SOPExceptions = ({ companyId, isEditable = false, className }: Props) => {
	const [value, setValue] = useState<Content>('');
	const [isEditing, setIsEditing] = useState(false);
	const [showNew, setShowNew] = useState(false);

	const { data, isLoading, refetch } = useSuspenseQuery(
		getCompanyNotesQuery(companyId, {
			conditions: {
				'type/id': 6,
			},
			fields: ['id', 'text', '_info'],
		})
	);

	const note = data?.data?.[0];

	const updateNote = useMutation({
		mutationFn: async (operation: PatchOperation<CompanyNote>[]) => {},
		// await updateCompanyNote(companyId, note?.id ?? -1, operation),
		onError(error) {
			toast.error(error.message);
		},
		onSuccess() {
			setIsEditing(false);
			refetch();
		},
	});

	const createNote = useMutation({
		mutationKey: ['notes', companyId],
		mutationFn: (newNote: CompanyNote) => createCompanyNote({ data: { companyId, note: newNote } }),
		onError(error) {
			toast.error(error.message);
		},
		onSuccess() {
			setIsEditing(false);
			// refetch()
		},
	});

	//  const sopExceptionsCookie = cookieStore.get(`sop-exceptions:${companyId}`)
	//  const dateString = sopExceptionsCookie?.value
	const dateString = undefined;
	const lastViewedDate = dateString ? new Date(dateString) : undefined;

	useEffect(() => {
		if (!note && isLoading) return setValue('');
		if (!note && !isLoading) return setValue('');
		if (!note) return setValue('');

		setValue(note.text);

		if (lastViewedDate) {
			const noteDate = new Date(note._info.lastUpdated);
			if (noteDate.getTime() < lastViewedDate.getTime()) {
				setShowNew(true);
			}
		}
	}, [note, isLoading, lastViewedDate]);

	return (
		<Card className='flex flex-col'>
			<CardHeader className='flex-row items-center justify-between space-y-0'>
				<CardTitle>
					<ShieldAlert className='inline-block mr-1.5 mb-1' />
					SOP Exceptions
					{showNew && (
						<ColoredBadge
							variant='yellow'
							className='ml-[1ch]'
						>
							New
						</ColoredBadge>
					)}
				</CardTitle>

				<div>
					{isEditing && (
						<Button
							variant='link'
							size='sm'
							onClick={() => {
								setValue(note?.text ?? '');
								setIsEditing(false);
							}}
						>
							Cancel
						</Button>
					)}

					{isEditable && (
						<Button
							variant={isEditing ? 'secondary' : 'link'}
							size='sm'
							className={`${isEditing ? '' : 'h-auto'}`}
							disabled={isLoading}
							onClick={() => {
								if (!isEditing) return setIsEditing(true);
								if (note) {
									updateNote.mutate([
										{
											op: Operation.Replace,
											path: '/text',
											value: value,
										},
									]);
								} else {
									createNote.mutate({
										text: value?.toString() ?? '',
										// @ts-ignore
										type: { id: 6 },
									});
								}
							}}
						>
							{updateNote.isPending ||
								(createNote.isPending && <RefreshCcw className='mr-1.5 animate-spin' />)}
							{isEditing ? 'Save' : 'Edit'}
						</Button>
					)}
				</div>
			</CardHeader>

			<CardContent className='p-0'>
				<div className='space-y-1.5'>
					{isLoading ? (
						<div className='p-3 space-y-1.5'>
							<Skeleton className='w-full h-6' />
							<Skeleton className='w-3/4 h-6' />
							<Skeleton className='w-1/2 h-6' />
							<Skeleton className='w-1/4 h-6' />
						</div>
					) : (
						<Tiptap
							editable={isEditing}
							content={note?.text}
							placeholder='Type your description here...'
							// editorClassName="focus:outline-none text-sm w-auto focus-visible:ring-0"
							// editorContentClassName="px-0 py-1.5"
							className={cn(
								'border-none min-h-36 shadow-none !p-0',
								!!!isEditing && 'select-none',
								className
							)}
						/>
					)}
				</div>
			</CardContent>

			{note && (
				<CardFooter className='p-3 mt-auto h-14'>
					<Button
						variant='link'
						size='sm'
						className='text-xs text-muted-foreground hover:no-underline hover:cursor-default'
					>
						Last updated by{' '}
						<span className='mx-[0.5ch] font-semibold text-foreground'>{note._info?.updatedBy}</span>{' '}
						{relativeDate(new Date(note._info.lastUpdated))}
					</Button>
				</CardFooter>
			)}
		</Card>
	);
};

export default SOPExceptions;
