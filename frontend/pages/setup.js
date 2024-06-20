import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket, SocketProvider } from "../context/SocketContext";

export default function Setup({ auth_data, api_url }) {
  const router = useRouter();
  const socket = useSocket();
  // const img =
  //   auth_data?.user_data?.image ||
  //   `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${auth_data?.user_data?.username}`;
  const [image, setImage] = useState(null);
  const [socketID, setSocketID] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [preview, setPreview] = useState(
    auth_data?.user_data?.image ||
      `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${auth_data?.user_data?.username}`
  );
  const [err, setErr] = useState();

  const username = auth_data?.user?.passport?.user?.username || "";
  console.log(username);

  useEffect(() => {
    if (!username) {
      // router.push("/auth/login");
    } else if (auth_data?.user_data?.first_name) {
      // router.push("/");
    }
  }, [username, router]);

  useEffect(() => {
    if (socket) {
      setSocketID(socket.id);
      setIsLoading(false);
      socket.on("connect", () => {
        console.log("Connected: ", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected: ", socket.id);
      });

      socket.on("connect_error", (error) => {
        console.error("Connection Error: ", error);
      });
    }
    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
      }
    };
  }, [socket]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(preview);
    }
  };

  const handleImageClick = () => {
    document.getElementById("fileInput").click();
  };

  const submitData = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("socket_id", socketID);
    if (image) {
      formData.append("image", image);
    }

    try {
      const result = await axios.post(`${api_url}/setup`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(formData);

      console.log(result.data);

      toast.success("User data updated successfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      //  router.push("/");
    } catch (error) {
      setErr(error?.response?.data);
      console.error("Error updating account information:", error);
    }
  };

  return (
    <div className="bg-gray-900 h-screen flex justify-center items-center flex-wrap">
      {isLoading ? (
        <p className="text-white">Connecting...</p>
      ) : (
        <form className="max-w-sm mx-auto" onSubmit={submitData}>
          <div className="flex flex-col items-center mb-5">
            <div className="w-32 h-32">
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full rounded-full object-cover cursor-pointer"
                onClick={handleImageClick}
              />
            </div>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              name="image"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <br />
          {err && <p className=" text-center text-red-600">{err} </p>}
          <br />
          <div className="flex gap-5">
            <div className="mb-5">
              <label
                htmlFor="first_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your First Name
              </label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="John"
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="last_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your Last Name
              </label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div className="mb-5">
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
              placeholder="example"
              value={auth_data?.user_data?.username || ""}
              disabled
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
              placeholder="example@example.com"
              value={auth_data?.user_data?.email || ""}
              disabled
            />
          </div>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="submit"
          >
            Complete signup
          </button>
        </form>
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Same as */}
      <ToastContainer />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.headers.cookie || "";

  try {
    const result = await axios.get(`${process.env.API_URL}/setup`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
    });

    console.log(result.data);

    return {
      props: {
        api_url: process.env.API_URL,
        auth_data: result?.data || null,
      },
    };
  } catch (error) {
    console.error("Error fetching auth data:", error);

    return {
      props: {
        api_url: process.env.API_URL,
        auth_data: null,
      },
    };
  }
}
