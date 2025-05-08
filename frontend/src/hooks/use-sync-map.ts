import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SyncClient, SyncMapItem } from "twilio-sync";

/**
 * Sync map hook
 * @param token - The access token created for the user.
 * @param mapKey - The uniqure name for the sync map you're trying to access.
 * @returns The sync map items.
 */
const useSyncMap = ({ token, mapKey }: { token: string; mapKey: string }) => {
  const syncMapClient = new SyncClient(token);
  const [items, setItems] = useState<SyncMapItem[]>([]);

  console.log(`fetching ${mapKey}`);

  const { data, isLoading } = useQuery({
    queryKey: ["syncMapClient", mapKey, token],
    queryFn: async () => {
      const map = await syncMapClient.map(mapKey);
      const { items } = await map.getItems();
      return { map, items };
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: "always",
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    enabled: !!token && !!mapKey,
  });

  useEffect(() => {
    if (isLoading || !data) return;
    const { map, items } = data;
    setItems(items);

    map.on("itemUpdated", (item) => {
      setItems((prev) => [
        ...prev.filter((i) => i.key !== item.item.key),
        item.item,
      ]);
    });

    map.on("itemAdded", (item) => {
      let newItems = [
        ...items.filter((i) => i.key !== item.item.key),
        item.item,
      ];
      setItems(newItems);
    });

    map.on("itemRemoved", (item) => {
      let newItems = [...items.filter((i) => i.key !== item.key)];
      setItems(newItems);
    });

    return () => {
      map.close();
    };
  }, [data]);

  return {
    items,
  };
};

export default useSyncMap;
