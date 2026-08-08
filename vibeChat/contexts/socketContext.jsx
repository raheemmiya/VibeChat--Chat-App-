import { createContext, useContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { useUser } from "./useUser";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {


  const [socket] = useState(()=> io("http://localhost:3000"))
  const {user} = useUser();
  const [onlineUsers, setOnlineUsers] = useState([]); 
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connection to io server successfull");
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!user || !socket) return;
    console.log("Socket Registration function reached! ");
    socket.emit('register-socket', user._id)
  }, [user, socket]);

  useEffect(()=>{ 
    function handleOnlineUsers(userIds){ 

      if (!socket) return
      setOnlineUsers(userIds)
    }
    socket.on('online-users', handleOnlineUsers);
    return () => socket.off("online-users", handleOnlineUsers);

  }, [socket])
  

  function sendMessage(data) {
    console.log(data);
    const messageData = {
      ...data,
      timestamps: Date.now(),
    };
    socket.emit("message-from-client", messageData);
  }

  return (
    <SocketContext.Provider value={{ sendMessage, socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
