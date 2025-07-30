import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { SyncMapItem } from "twilio-sync";
import { getSyncMapQuery } from "@/lib/twilio/api";

/**
 * Sync map hook
 * @param token - The access token created for the user.
 * @param mapKey - The uniqure name for the sync map you're trying to access.
 * @returns The sync map items.
 */
const useSyncMap = ({ token, mapKey }: { token: string; mapKey: string }) => {
	const [items, setItems] = useState<SyncMapItem[]>([]);

	const { data, isLoading } = useQuery(getSyncMapQuery({ mapKey, token }));

	const handleItemAdded = useCallback(
		({ item }: { item: SyncMapItem; isLocal: boolean }) =>
			setItems(
				(items) => [...items.filter((i) => i.key !== item.key), item],
			),
		[],
	);

	const handleItemUpdated = useCallback(
		({
			item,
		}: {
			item: SyncMapItem;
			isLocal: boolean;
			previousItemData: object;
		}) =>
			setItems(
				(items) => [...items.filter((i) => i.key !== item.key), item],
			),
		[],
	);

	const handleItemRemoved = useCallback(
		({
			key,
		}: {
			previousItemData: SyncMapItem;
			key: string;
			isLocal: boolean;
		}) => setItems((items) => [...items.filter((i) => i.key !== key)]),
		[],
	);

	useEffect(() => {
		if (isLoading || !data) return;
		const { map, items, client } = data;
		setItems(items);
		client.on("connectionStateChanged", (state) => {
			console.log("connection state changed", state);
		});
		client.on("connectionError", (error) => {
			console.log("connection error", error);
		});
		client.on("tokenAboutToExpire", () => {
			console.log("token about to expire");
		});
		client.on("tokenExpired", () => {
			console.log("token expired");
		});

		map.on("_subscriptionStateChanged", (state) => {
			console.log("subscription state changed", state);
		});

		map.on("itemUpdated", handleItemUpdated);

		map.on("itemAdded", handleItemAdded);

		map.on("itemRemoved", handleItemRemoved);

		return () => {
			map.off("itemUpdated", handleItemUpdated);

			map.off("itemAdded", handleItemAdded);

			map.off("itemRemoved", handleItemRemoved);

			map.close();
		};
	}, [
		data,
		handleItemAdded,
		handleItemUpdated,
		handleItemRemoved,
		isLoading,
	]);

	return {
		items,
		isLoading,
	};
};

export default useSyncMap;
