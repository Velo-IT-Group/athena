import React, { useMemo } from 'react';
import { CardContent } from '../ui/card';
import ParticipantListItem, { Participant } from './participant-list-item';
import { useTaskContext } from './context';

const ActiveCallParticipants = () => {
	const { conferenceParticipants } = useTaskContext();
	const entries = useMemo(() => Object.entries(conferenceParticipants ?? {}), [conferenceParticipants]);
	return (
		<CardContent className='p-1.5 flex flex-col justify-start'>
			{entries.map(([key, value]) => (
				<ParticipantListItem
					key={key}
					participantType={key as Participant}
					sid={value}
					showRemoval={entries.length > 2}
				/>
			))}
			{/* {items.map((item) => {
				const data = item.data as ParticipantInstance;

				return (
					<ParticipantListItem
						key={data.AccountSid}
						participantType={'customer'}
						sid={data.AccountSid}
						showRemoval={items.length > 2}
					/>
				);
			})} */}
		</CardContent>
	);
};

export default ActiveCallParticipants;
