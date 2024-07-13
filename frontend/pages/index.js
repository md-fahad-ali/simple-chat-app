import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import "tailwindcss/tailwind.css";
import Image from "next/image";
import Link from "next/link";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { IoMdSend } from "react-icons/io";
import { useRef } from "react";

export default function Dashboard(props) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const socket = useSocket();
  const [users, setUsers] = useState(props?.user_data?.user_data || []);
  const [chat, setChat] = useState(props?.user_data?.chats || null);
  const [lastMessages, setLastMessages] = useState([]);
  const [unreadMessage, setUnreadMessages] = useState([]);

  const handleLogout = () => {
    router.push("/auth/logout");
  };

  const chatEndRef = useRef(null);

  console.log(props?.user_data?.user[0]?.username || null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log(props?.user_data?.user);
    if (props?.user_data?.user == 0) {
      router.push("/auth/login");
    }
    scrollToBottom();
  }, [chat]);

  async function refreshList() {
    try {
      const result = await axios.get(props?.api_url, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setUsers(result.data?.user_data);
      console.log("refresh list", result.data?.user_data);
    } catch (error) {
      console.log(error.message);
    }
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

    // Fetch data when the component mounts or the route changes
    if (router.query?.user) {
      fetchData();
    }

    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to socket server.");
      });

      socket.emit(
        "update_socket_id",
        props?.user_data?.user[0]?.username || null
      );

      socket.on("private_message", (data) => {
        console.log("unreadMessage", unreadMessage);
        console.log("data of private mesaage", data);

        refreshList();

        console.log("ok i got it");
        setUnreadMessages((prev) => ({
          ...prev,
          [data.fromUsername]: true,
        }));

        console.log(router?.query?.user, data?.fromUsername);
        if (router?.query?.user === data?.fromUsername) {
          setUnreadMessages([]);
        } else {
          console.log("pathao");
        }

        console.log(data);

        setLastMessages((prev) => ({
          ...prev,
          [data.fromUsername]: {
            content: data.content,
            timestamp: data.timestamp,
          },
        }));

        // setChat((prevChat) => [...prevChat, data]);
      });

      return () => {
        socket.off("connect");
        socket.off("private_message");
      };
    }
  }, [socket, router.query?.user]);

  // const username = props?.user_data?.user[0]?.username || null;

  function Image_path(data) {
    return `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${data}`;
  }

  // const full_name = `${props?.user_data?.user[0]?.first_name} ${props?.user_data?.user[0]?.last_name}`;

  return (
    <div className="flex flex-col bg-gray-800">
      <div className="flex overflow-hidden" style={{ height: "calc(100vh)" }}>
        <div className="block w-full md:w-[30vmax] min-w-[300px] bg-slate-900">
          {/* chats part */}
          <div className=" h-[100px] flex items-center justify-between md:justify-center">
            <div className="flex items-center justify-start rtl:justify-end w-[75px] md:w-auto">
              <Link
                href="/"
                className="flex md:hidden ml-2 md:mr-24 w-[110px] md:w-auto"
              >
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={100}
                  height={100}
                  className="h-8"
                />
              </Link>
            </div>
            <h1 className=" text-slate-200 text-xl font-bold">Chats</h1>

            {/* Profile */}
            <div className={" block md:hidden"}>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                type="button"
                className="flex text-sm mr-5 bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open user menu</span>
                <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                  {props?.user_data?.user[0]?.image ? (
                    <Image
                      src={props?.user_data?.user[0]?.image || null}
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
                } bg-slate-600 p-3 fixed right-3 md:left-3 w-40 items-center justify-center`}
              >
                <Link href={"/auth/logout"} className={"text-white"}>
                  Logout
                </Link>
              </div>
            </div>
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
                        {/* <div className=" rounded-full bg-green-500 absolute w-[15px] h-[15px]"></div>
                         */}
                        <div class="flex justify-center">
                          <div class="relative">
                            {user?.image ? (
                              <Image
                                src={`${user?.image || null}`}
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
                            <span class="absolute left-9 top-1 h-3 w-3 top-12 left-16 bg-green-500 rounded-full"></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex w-2/3 justify-between items-center">
                        <div className="flex-1">
                          <h2 className="text-lg text-white font-semibold">
                            {user?.first_name} {user?.last_name}
                          </h2>
                          <p
                            className={`text-gray-300 ${
                              unreadMessage[user?.username] && "font-extrabold"
                            } font-normal`}
                          >
                            {/* {chData?.fromUsername == user?.username
                            ? `${chData?.content} `
                            : ``} */}
                            {lastMessages[user.username]?.content ||
                              "No messge"}
                          </p>
                        </div>
                        {console.log(
                          unreadMessage[user?.username],
                          user?.username
                        )}
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

        <div className="w-full hidden md:block">
          <nav className="top-0 h-[65px] z-50 w-full bg-gray-800">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
              <div className="flex items-center justify-between relative top-2">
                <div className="flex items-center justify-start rtl:justify-end w-auto">
                  <Link href="/" className="flex ml-2 md:mr-24 w-auto">
                    <Image
                      src="/logo.svg"
                      alt="logo"
                      width={100}
                      height={100}
                      className="h-8"
                    />
                    <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                      Inbox
                    </span>
                  </Link>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center ml-3">
                    <div>
                      <div
                        className="flex text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 hover:bg-none"
                        id="user-menu-button"
                        aria-expanded="false"
                        data-dropdown-toggle="dropdown"
                        data-dropdown-placement="bottom"
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="relative w-10 h-10 overflow-hidden bg-transparent rounded-full ">
                          {/* {props?.user_data?.user[0]?.image ? (
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
                          )} */}
                        </div>
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
                <div className="flex-grow h-1/2">
                  <ul className="w-full flex justify-center items-center">
                    <h1 className="  text-slate-400 text-center">
                      No chat Found
                    </h1>

                    <div ref={chatEndRef} />
                  </ul>
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/3 hidden lg:flex justify-center p-[30px] items-center">
          <section className=" flex justify-center bg-slate-700 h-[90vh] w-full rounded-lg">
            {props?.user_data?.user?.map((e, i) => (
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
                    <h1 className=" font-semibol text-4xl font-bold text-center text-slate-300 ">
                      {e?.first_name} {e?.last_name}
                    </h1>
                    <br />
                    <div className="flex gap-5">
                      <h3 className="text-xl  text-center font-bold text-sky-200">
                        Email{" "}
                      </h3>
                      <p className="text-xl text-sky-200">{e?.email}</p>
                    </div>
                    <br />
                    <div className="flex gap-5 items-center justify-center">
                      <Link
                        href={"/auth/logout"}
                        className="text-xl bg-slate-800 px-3 py-3 text-center font-bold text-sky-200"
                      >
                        Logout
                      </Link>
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
  const { req, res } = context;
  const cookies = req.headers.cookie || "";
  const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
  });
  const data = await result.json();

  return {
    props: {
      user_data: data,
      api_url: process.env?.NEXT_PUBLIC_API_URL,
    },
  };
}
