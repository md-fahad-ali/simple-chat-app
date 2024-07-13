import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log(process.env.API_URL);
    const socketIo = io("https://simple-chat-app-3io6.onrender.com", {
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
