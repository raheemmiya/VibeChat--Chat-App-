import { useEffect, useState } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { useSocket } from "./socketContext";
import { useUser } from "./useUser";

const MessageContext = createContext();

export const useMessage = () => {
  return useContext(MessageContext);
};

export const MessageProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useUser();

  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]); // NEW: every message involving the logged-in user, used for unread counts
  const [chatImages, setChatImages] = useState("");
  const [latestMessage, setLatestMessage] = useState({});

  async function getMessages(user1, user2) {
    const response = await fetch(
      `http://localhost:3000/api/get-messages?user1=${user1}&user2=${user2}`,
    );
    const chatHistory = await response.json();
    console.log(chatHistory);
    setMessages(chatHistory);
  }

  async function getLastMessages(loggedInUserId) {
    try {
      console.log(user._id);

      const response = await fetch(
        `http://localhost:3000/api/get-messages-by-user?userId=${user._id}`,
      );
      const allMsgs = await response.json();

      setAllMessages(allMsgs); // NEW: keep the full list for unread counts

      const lastTimeMessage = {};

      for (let i = 0; i < allMsgs.length; i++) {
        let currentMessage = allMsgs[i];

        let otherUserId;
        if (currentMessage.senderId === loggedInUserId) {
          otherUserId = currentMessage.recieverId;
        } else {
          otherUserId = currentMessage.senderId;
        }

        if (lastTimeMessage[otherUserId] === undefined) {
          lastTimeMessage[otherUserId] = currentMessage.createdAt;
        }
      }

      setLatestMessage(lastTimeMessage);
    } catch (error) {
      console.log(error);
    }
  }

  function addMessage(message) {
    setMessages((prev) => [...prev, message]);
  }

  useEffect(() => {
    if (!socket) return;

    function handleMessage(message) {
      console.log("message recieved: " + message);

      setMessages((prev) => [...prev, message]);
      setAllMessages((prev) => [...prev, message]); // NEW: keep unread-count source in sync live
      setLatestMessage((prev) => ({
        ...prev,
        [message.senderId]: message.createdAt,
        [message.recieverId]: message.createdAt,
      }));
    }

    socket.on("recieve-message", handleMessage);
    return () => {
      socket.off("recieve-message", handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    function handleSeenMessage(seenBy) {
      console.log("marked -seen reached");
      console.log(seenBy);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.recieverId?.toString() === seenBy?.toString()
            ? { ...msg, seen: true }
            : msg,
        ),
      );

      // NEW: keep allMessages' seen status in sync too, same logic
      setAllMessages((prev) =>
        prev.map((msg) =>
          msg.recieverId?.toString() === seenBy?.toString()
            ? { ...msg, seen: true }
            : msg,
        ),
      );
    }
    socket.on("marked-seen", handleSeenMessage);
    return () => socket.off("marked-seen", handleSeenMessage);
  }, [socket]);

  return (
    <MessageContext.Provider
      value={{
        getMessages,
        messages,
        setMessages,
        getLastMessages,
        latestMessage,
        allMessages, // NEW: expose it
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};