import axios from "axios";
import { useRouter } from "next/router";
import React from "react";
import { useEffect } from "react";

export default function Logout(props) {
  console.log(props);
  const router = useRouter();
  useEffect(() => {
    if (!props?.auth_data?.isAuth) {
      router.push("/auth/login");
    }
  });
  return (
    <div className="bg-gray-800 h-screen w-full text-white flex justify-center items-center">
      <h1>Logging Out....</h1>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.headers.cookie || "";

  try {
    const result = await axios.get(
      `${process.env.NEXT_PUBLIC_WEB_URL}/api/auth/logout`,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
        },
      }
    );

    console.log(result.data);

    return {
      props: {
        api_url: process.env.NEXT_PUBLIC_API_URL,
        auth_data: result.data,
      },
    };
  } catch (error) {
    console.error("Error fetching auth data:", error);

    return {
      props: {
        api_url: process.env.NEXT_PUBLIC_API_URL,
        auth_data: null,
      },
    };
  }
}
