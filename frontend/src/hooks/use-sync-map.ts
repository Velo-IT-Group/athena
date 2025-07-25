import { getSyncMapQuery } from "@/lib/twilio/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { SyncMapItem } from "twilio-sync";

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
    ({ item, isLocal }: { item: SyncMapItem; isLocal: boolean }) => {
      console.log("item updated", item);
      console.log("current items", items);
      const newItems = [
        ...items.filter((i) => i.key !== item.key),
        item,
      ];
      setItems(newItems);
    },
    [items],
  );

  const handleItemUpdated = useCallback(
    (
      { item, isLocal, previousItemData }: {
        item: SyncMapItem;
        isLocal: boolean;
        previousItemData: object;
      },
    ) => {
      console.log("item updated", item);
      console.log("current items", items);
      const newItems = [
        ...items.filter((i) => i.key !== item.key),
        item,
      ];
      setItems(newItems);
    },
    [items],
  );

  const handleItemRemoved = useCallback(
    (
      { previousItemData, key, isLocal }: {
        previousItemData: SyncMapItem;
        key: string;
        isLocal: boolean;
      },
    ) => {
      console.log("item deleted", key);
      console.log("current items", items);
      const newItems = [...items.filter((i) => i.key !== key)];
      setItems(newItems);
    },
    [items],
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
      map.close();
    };
  }, [data]);

  return {
    items,
    isLoading,
  };
};

export default useSyncMap;
