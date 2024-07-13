import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ url, children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    
    const socketIo = io(url, {
      withCredentials: true,
    });
    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("Connected to socket server");
    });

    socketIo.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socketIo.on("disconnect", (reason) => {
      console.log("Disconnected from socket server:", reason);
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
