import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import "tailwindcss/tailwind.css";
import Image from "next/image";
import Link from "next/link";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { IoMdSend } from "react-icons/io";
import { useRef } from "react";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import Lottie from "lottie-react";
import typingIndicator from "./animation.json";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { MdOutlineUploadFile } from "react-icons/md";
import { FaFile } from "react-icons/fa";
import _ from "lodash";

import dynamic from "next/dynamic";
const EmojiPickers = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});
export default function Dashboard(props) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const socket = useSocket();
  const [users, setUsers] = useState(props?.user_data?.user_data || []);
  const [chat, setChat] = useState(props?.user_data?.chats || null);
  const [tik, setTik] = useState(false);
  const [lastMessages, setLastMessages] = useState([]);
  const [unreadMessage, setUnreadMessages] = useState([]);
  const [timeChat, setTimechat] = useState();
  const [typing, setTyping] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [message, setMessage] = useState([]);
  const [fileName, setFileName] = useState("");
  const Cryptr = require("cryptr");
  const cryptr = new Cryptr(props?.secret_key);
  const [chData, setChdata] = useState([]);
  const chatEndRef = useRef(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    if (props?.user_data?.user.length == 0) {
      router.push("/auth/login");
    }
    scrollToBottom();
  }, [chat]);
  if (unreadMessage[router.query?.user]) {
    setUnreadMessages([]);
  }
  async function refreshList() {
    const result = await axios.get(
      `${props.api_url}/chat/${router.query?.user}`,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    setUsers(result.data?.user_data);
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(
          `${props.api_url}/chat/${router.query?.user}`,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setChat(result.data.chats || []);
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      }
    };
    if (router.query?.user) {
      fetchData();
    }
    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to socket server.");
      });
      socket.emit("update_socket_id", username);
      socket.on("isTyping", (data) => {
        setTyping(data.isTyping);
      });
      socket.on("private_message", (data) => {
        refreshList();
        if (router?.query?.user) {
          setUnreadMessages((prev) => ({
            ...prev,
            [data.fromUsername]: true,
          }));
        }
        if (router?.query?.user === data?.fromUsername) {
          setUnreadMessages([]);
        }
        setLastMessages((prev) => ({
          ...prev,
          [data.fromUsername]: {
            content: data.content,
            timestamp: data.timestamp,
          },
        }));
        setChat((prevChat) => [...prevChat, data]);
      });
      return () => {
        socket.off("connect");
        socket.off("private_message");
      };
    }
  }, [socket, router.query?.user]);
  const username = props?.user_data?.user[0]?.username || null;
  async function submitMessage(e) {
    e.preventDefault();
    const message = e.target.message.value;
    const recipient = router.query?.user;
    if (!recipient) {
      return;
    }
    const timestamp = new Date().toISOString();
    if (fileName) {
      const formData = new FormData();
      formData.append("file", e.target.fileInput.files[0]);
      formData.append("toUsername", recipient);
      formData.append("fromUsername", username);
      formData.append("timestamp", timestamp);
      try {
        const response = await axios.post(
          `${props.api_url}/chat/${recipient}`,
          formData,
          {
            withCredentials: true,
          }
        );
        // Clear the file input and state
        setFileName("");
        document.getElementById("fileInput").value = "";
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    } else if (message) {
      socket.emit("private_message", {
        content: message,
        toUsername: recipient,
        toUserFullname: `${props?.user_data?.recipient_user[0]?.first_name} ${props?.user_data?.recipient_user[0]?.last_name}`,
        fromUsername: username,
        fromUserFullname: `${props?.user_data?.user[0]?.first_name} ${props?.user_data?.user[0]?.last_name}`,
        timestamp: timestamp,
      });
      await axios.post(
        `${props.api_url}/chat/${recipient}`,
        {
          message,
          msg_for: recipient,
          msg_from: username,
          msg_for_fullname: `${props?.user_data?.user[0]?.first_name} ${props?.user_data?.user[0]?.last_name}`,
          msg_to_fullname: `${props?.user_data?.recipient_user[0].first_name} ${props?.user_data?.recipient_user[0].last_name}`,
          timestamp: timestamp,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setChat((prev) => [
        ...prev,
        {
          content: message,
          toUsername: recipient,
          toUserFullname: `${props?.user_data?.recipient_user[0].first_name} ${props?.user_data?.recipient_user[0].last_name}`,
          fromUsername: username,
          fromUserFullname: `${props?.user_data?.user[0]?.first_name} ${props?.user_data?.user[0]?.last_name}`,
          timestamp: timestamp,
        },
      ]);
      setMessage("");
    }
    scrollToBottom();
  }
  function converTime(data) {
    const date = new Date(data);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    const formattedTime = `${hours}:${minutesStr} ${ampm}`;
    return formattedTime;
  }
  function Image_path(data) {
    return `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${data}`;
  }
  const full_name = `${props?.user_data?.user[0]?.first_name} ${props?.user_data?.user[0]?.last_name}`;
  function wordCheck(word) {
    if (word?.length > 10) {
      return `${word.slice(0, 10)}...`;
    } else {
      return word;
    }
  }
  const recipient = router.query?.user;
  function checkTyping() {
    setTimeout(() => {
      socket.emit("isTyping", {
        isTyping: false,
        toUsername: recipient,
        toUserFullname:
          `${props?.user_data?.recipient_user[0]?.first_name} ${props?.user_data?.recipient_user[0]?.last_name}` ||
          "",
        fromUsername: username,
        fromUserFullname:
          `${props?.user_data?.user[0]?.first_name} ${props?.user_data?.user[0]?.last_name}` ||
          "",
      });
    }, 1000);
  }

  const handleKeyPress = useCallback(
    _.debounce((isTyping) => {
      socket.emit("isTyping", {
        isTyping: true,
        toUsername: recipient,
        toUserFullname:
          `${props?.user_data?.recipient_user[0]?.first_name} ${props?.user_data?.recipient_user[0]?.last_name}` ||
          "",
        fromUsername: username,
        fromUserFullname:
          `${props?.user_data?.user[0]?.first_name} ${props?.user_data?.user[0]?.last_name}` ||
          "",
      });
      checkTyping();
    }, 1000),
    [username, recipient, props.user_data]
  );

  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };
  const handleImageClick = () => {
    document.getElementById("fileInput").click();
  };
  function handleFileChange(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      console.log("No file selected");
    }
  }

  const handleChange = useCallback(
    (event) => {
      const value = event.target.value;
      setMessage(value);
      handleKeyPress(event);
    },
    [handleKeyPress, setMessage]
  );

  useEffect(() => {
    return () => {
      handleKeyPress.cancel(); // Cleanup debounce function on unmount or dependencies change
    };
  }, [handleKeyPress]);

  return (
    <div className="flex flex-col bg-gray-800">
      <div className="flex overflow-hidden" style={{ height: "calc(100vh)" }}>
        <div className="hidden md:block md:w-[30vmax] min-w-[300px] bg-slate-900">
          <div className=" h-[100px] flex items-center justify-center">
            <h1 className=" text-slate-200 text-xl font-bold">Chats</h1>
          </div>
          <div
            className="overflow-y-auto p-3 mb-9 pb-20"
            style={{ height: "calc(100vh - 100px)" }}
          >
            {users.length > 0
              ? users.map((user, i) => (
                  <div
                    key={i}
                    className="flex items-center mb-4 cursor-pointer hover:bg-slate-900 p-2 rounded-md"
                  >
                    <Link
                      href={`/chat/${user?.username}`}
                      className="flex w-full"
                      onClick={() => {
                        unreadMessage[user?.username]
                          ? "ami ses gesi"
                          : "nothing";
                      }}
                    >
                      <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                        <div class="relative">
                          {user?.image ? (
                            <Image
                              src={`${user?.image}`}
                              alt={user?.username}
                              width={100}
                              height={100}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <img
                              src={`https://api.dicebear.com/8.x/fun-emoji/svg?seed=${user?.username}`}
                              alt={user?.username}
                              width={100}
                              height={100}
                              className="w-12 h-12 rounded-full"
                            />
                          )}
                          <span class="absolute left-9 top-1 h-3 w-3 top-9 left-16 bg-green-500 rounded-full"></span>
                        </div>
                      </div>
                      <div className="flex w-2/3 justify-between items-center">
                        <div className="flex-1">
                          <h2 className="text-lg text-white font-semibold">
                            {user?.first_name} {user?.last_name}
                          </h2>
                          <p
                            className={`text-gray-300 break-all ${
                              unreadMessage[user?.username] && "font-extrabold"
                            } font-normal`}
                          >
                            {wordCheck(lastMessages[user.username]?.content) ||
                              "No messge"}
                          </p>
                        </div>
                        {unreadMessage[user?.username] && (
                          <div className="bg-slate-300 w-2 rounded-full h-2"></div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))
              : "Loading ..."}
          </div>
        </div>
        <div className="w-full">
          <nav className="top-0 h-[65px] z-50 w-full bg-gray-800">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
              <div className="flex items-center justify-between relative top-2">
                <div className="flex items-center justify-start rtl:justify-end">
                  <Link
                    className={
                      "block md:hidden text-white font-extrabold text-5xl"
                    }
                    href="/"
                  >
                    <MdOutlineKeyboardArrowLeft />
                  </Link>
                  <Link href="/" className="flex w-[100px] md:w-[150px]">
                    <Image
                      src="/logo.svg"
                      alt="logo"
                      width={100}
                      height={100}
                      className="h-8 mr-[10px] md:mr-0"
                    />
                    <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white ">
                      Inbox
                    </span>
                  </Link>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center ml-3">
                    <div>
                      <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        type="button"
                        className="flex text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                          {props?.user_data?.user[0]?.image ? (
                            <Image
                              src={props?.user_data?.user[0]?.image}
                              alt="User profile picture"
                              width={40}
                              height={40}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <img
                              src={`https://api.dicebear.com/8.x/fun-emoji/svg?seed=${props?.user_data?.user[0]?.username}`}
                              alt={props?.user_data?.user[0]?.username}
                              className="w-full h-full rounded-full"
                            />
                          )}
                        </div>
                      </button>
                      <div
                        className={`${
                          isSidebarOpen ? "flex" : "hidden"
                        } bg-slate-600 p-3 right-2 absolute w-40 items-center justify-center`}
                      >
                        <Link href={"/auth/logout"} className={"text-white"}>
                          Logout
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <div className="flex h-1/2" style={{ height: " calc(100% - 142px)" }}>
            <div
              className="flex md:block w-full flex-col justify-end"
              style={{ display: "flex" }}
            >
              <div className="flex flex-col flex-grow overflow-y-auto">
                <div className="flex-grow ">
                  <ul className="w-full">
                    {chat.length > 0 ? (
                      chat.map((message, index) => (
                        <li key={index} className={`p-4 flex flex-col w-full`}>
                          <div
                            className={`flex ${
                              message?.fromUserFullname == full_name
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex w-auto flex-col max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100  ${
                                message?.fromUserFullname == full_name
                                  ? "rounded-l-lg rounded-b-lg"
                                  : "rounded-e-xl rounded-es-xl"
                              } bg-gray-700`}
                            >
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {message?.fromUserFullname ==
                                  `${props?.user_data?.user[0]?.first_name} ${props?.user_data?.user[0]?.last_name}`
                                    ? "me"
                                    : message?.fromUserFullname}
                                  :{" "}
                                </span>
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                  {converTime(message?.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white break-all">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <h1 className="  text-slate-400">No chat Found</h1>
                    )}
                    {typing ? (
                      <div
                        className={`flex flex-col w-[100px] border-gray-200 ml-[17px] "rounded-e-xl rounded-ee-xl rounded-se-xl rounded-es-xl bg-gray-700`}
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white"></span>
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400"></span>
                        </div>
                        <Lottie
                          animationData={typingIndicator}
                          loop={true}
                          style={{ width: "100%", height: "50px" }}
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    <div ref={chatEndRef} />
                  </ul>
                  <br />
                </div>
              </div>
            </div>
          </div>
          <footer className="bg-transparent p-5 h-[77px] -mt-[10px]">
            <div className="flex flex-col items-center gap-3 justify-center">
              <div className="w-full gap-3 flex-col flex justify-center items-center">
                <form className="flex w-full md:w-2/3" onSubmit={submitMessage}>
                  <div className="flex w-full justify-end items-center">
                    <input
                      type="text"
                      name="message"
                      placeholder="Type a message..."
                      className="w-full p-2 rounded-md focus:outline-none bg-slate-600 text-white focus:border-blue-500"
                      onChange={handleChange}
                      value={message}
                    />
                    <div
                      className={
                        "text-slate-400 text-3xl mb-7 absolute cursor-pointer"
                      }
                      onClick={(e) => {
                        e.preventDefault(); // Prevent the form submission
                        setEmojiOpen(!emojiOpen);
                      }}
                    >
                      <MdOutlineEmojiEmotions />
                    </div>
                  </div>

                  <div
                    className={`absolute ${
                      emojiOpen ? "flex" : "hidden"
                    } bottom-[63px] left-0 w-full sm:w-[35%] justify-end sm:left-auto flex`}
                  >
                    <EmojiPickers
                      Theme={"dark"}
                      style={{ background: "#1d2737" }}
                      onEmojiClick={handleEmojiClick}
                    />
                  </div>

                  <button className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2">
                    <IoMdSend />
                  </button>
                </form>
              </div>
            </div>
          </footer>
          <br />
        </div>

        <div className="w-1/3 hidden lg:flex justify-center p-[30px] items-center">
          <section className=" flex justify-center bg-slate-700 h-[90vh] w-full rounded-lg">
            {props?.user_data?.recipient_user?.map((e, i) => (
              <div
                key={i}
                className="flex flex-col w-1/2 leading-1.5 p-4 rounded-e-xl rounded-es-xl bg-transparent"
              >
                <br />

                <div className="flex flex-col justify-center items-center w-full">
                  <img
                    src={
                      e?.image == undefined ? Image_path(e?.username) : e.image
                    }
                    width={170}
                    height={170}
                    className="rounded-full"
                    alt={` ${e?.first_name} ${e?.last_name}`}
                  />
                  <br />
                  <div className="flexitems-center space-x-2 rtl:space-x-reverse">
                    <h1 className=" font-semibol text-center text-4xl font-bold text-slate-300 ">
                      {e?.first_name} {e?.last_name}
                    </h1>
                    <br />
                    <div className="flex gap-5">
                      <h3 className="text-xl  text-center font-bold text-sky-200">
                        Email{" "}
                      </h3>
                      <p className="text-xl text-sky-200">{e?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.headers.cookie || "";
  try {
    const result = await fetch(
      `http://localhost:4000/chat/${context?.params?.user}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
        },
      }
    );
    const data = await result.json();

    console.log(data);

    if (data?.error) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        user_data: data,
        api_url: process.env?.API_URL,
        secret_key: process.env?.SECRET_KEY,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}
