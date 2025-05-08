import { useCallback, useEffect, useState } from "react";
import { Client, type Message, type Conversation } from "@twilio/conversations";
import { useMutation } from "@tanstack/react-query";
type Props = {
  conversation: Conversation;
};

const useTwilioConversation = ({ conversation }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!conversation || !isConnected) return;

    conversation.on("messageAdded", (message) =>
      setMessages((current) => [...current, message]),
    );

    conversation.on("messageUpdated", ({ message }) =>
      setMessages((current) =>
        current.map((m) => (m.sid === message.sid ? message : m)),
      ),
    );

    conversation.on("messageRemoved", ({ sid }) =>
      setMessages((current) => current.filter((m) => m.sid !== sid)),
    );
  }, [conversation, isConnected]);

  const { mutate: sendMessage } = useMutation({
    mutationFn: async (body: string) => await conversation?.sendMessage(body),
    onError: (error) => {
      console.error(error);
    },
  });

  const { mutate: leaveConversation } = useMutation({
    mutationFn: async () => await conversation?.leave(),
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    messages,
    conversation,
    isConnected,
    sendMessage,
    leaveConversation,
  };
};

export default useTwilioConversation;
