import { useEffect, useState, useRef } from "react";
import { useSocket, SocketProvider } from "../context/SocketContext";
import axios from "axios";

const Chat = (props) => {
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTypings, setIsTypings] = useState(false);
  const [file, setFile] = useState(null);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on("username_set", (username) => {
        setIsLoggedIn(true);
      });

      socket.on("private_message", (data) => {
        setChat((prev) => [...prev, data]);
        console.log(data);
      });

      socket.on("onTyping", (data) => {
        console.log(data);
        setIsTypings(data.isTyping);
      });
    }

    return () => {
      if (socket) {
        socket.off("username_set");
        socket.off("private_message");
        socket.off("onTyping");
      }
    };
  }, [socket]);

  const handleLogin = () => {
    socket.emit("set_username", username);
  };

  const checkTyping = (e) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("onTyping", {
      isTyping: true,
      toUsername: recipient,
    });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("onTyping", {
        isTyping: false,
        toUsername: recipient,
      });
    }, 3000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);
    formData.append("recipient", recipient);
    formData.append("message", message);

    socket.emit("private_message", {
      content: message,
      toUsername: recipient,
    });

    if (file) {
      socket.emit("onFile", {
        file: file.name,
        toUsername: recipient,
      });
    }
    setChat((prev) => [...prev, { content: message, from: "Me" }]);
    setMessage("");
    setFile(null);

    try {
      const result = await axios.post(`${props.api_url}/send`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <form onSubmit={sendMessage} encType="multipart/form-data">
            <input
              type="text"
              placeholder="Recipient Username"
              value={recipient}
              name="recipient"
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              type="text"
              placeholder="Message"
              value={message}
              name="message"
              onChange={(e) => setMessage(e.target.value)}
              onKeyUp={checkTyping}
            />
            <input
              type="file"
              name="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit">Send</button>
          </form>
          <div>
            {chat.map((msg, index) => (
              <div key={index}>
                <strong>{msg.from}: </strong>
                {msg.content}
              </div>
            ))}
          </div>
          <p>{isTypings ? "Typing ..." : ""}</p>
        </div>
      )}
    </div>
  );
};

const App = (props) => (
  <SocketProvider>
    <Chat {...props} />
  </SocketProvider>
);

export async function getServerSideProps(context) {
  const { req, res } = context;
  console.log(req);
  return {
    props: {
      api_url: process.env.NEXT_PUBLIC_API_URL,
    },
  };
}

export default App;
