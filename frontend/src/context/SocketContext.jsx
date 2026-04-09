import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuthUser from "../hooks/useAuthUser";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthUser();

  useEffect(() => {
    if (authUser) {
      const newSocket = io(SOCKET_URL, {
        query: {
          userId: authUser._id,
        },
      });

      setSocket(newSocket);

      // Listen for online users
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
