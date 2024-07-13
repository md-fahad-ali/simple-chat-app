import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Login(props) {
  const isAuth = props?.auth_data?.success?.passport?.user || 0;
  const router = useRouter();

  const [err, setErr] = useState();
  const [clicked, setClicked] = useState(false);
  const [id, setId] = useState();

  async function submitData(e) {
    e.preventDefault();

    const { email, username, password, confirm_password } = e.target;

    if (password.value == confirm_password.value) {
      try {
        setClicked(true);
        const result = await axios.post(
          `${props.api_url}/auth/signup`,
          {
            username: username.value,
            email: email.value,
            password: password.value,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(result.data);
        if (result?.data?.isAuth) {
          router?.push("/setup");
        }
      } catch (error) {
        setErr(error?.response?.data);
        setClicked(false);
        console.log(error?.response?.data);
      }
    } else {
      setErr("Password not match!");
    }
    // console.log(email.value, password.value);
  }
  return (
    <div className="bg-gray-900 h-screen">
      <section class="bg-gray-900">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 text-white"
          >
            <a
              href="#"
              class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
            >
              <Image
                class="w-8 h-8 mr-2"
                src="/logo.svg"
                alt="logo"
                width={300}
                height={300}
                loading="lazy"
              />
              Let's Talk
            </a>
          </a>
          <div className="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-white">
                Create an account
              </h1>
              {err && <p className=" text-red-500">{err}</p>}
              <form
                className="space-y-4 md:space-y-6"
                action=""
                onSubmit={(e) => {
                  submitData(e);
                }}
              >
                <div>
                  <label
                    for="email"
                    className="block mb-2 text-sm font-medium text-gray-900 text-white"
                  >
                    Your username
                  </label>
                  <input
                    type="username"
                    name="username"
                    id="username"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example"
                    required=""
                  />
                </div>
                <div>
                  <label
                    for="email"
                    className="block mb-2 text-sm font-medium text-gray-900 text-white"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="name@company.com"
                    required=""
                  />
                </div>
                <div>
                  <label
                    for="password"
                    className="block mb-2 text-sm font-medium text-gray-900 text-white"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                    required=""
                  />
                </div>
                <div>
                  <label
                    for="confirm_password"
                    className="block mb-2 text-sm font-medium text-gray-900 text-white"
                  >
                    Confirm password
                  </label>
                  <input
                    type="text"
                    name="confirm_password"
                    id="confirm_password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                    required=""
                  />
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      aria-describedby="terms"
                      type="checkbox"
                      class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 bg-gray-700 border-gray-600 focus:ring-primary-600 ring-offset-gray-800"
                      required=""
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label
                      for="terms"
                      class="font-light text-gray-500 text-gray-300"
                    >
                      I accept the{" "}
                      <a
                        class="font-medium text-primary-600 hover:underline text-primary-500"
                        href="#"
                      >
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  class="w-full text-white bg-slate-900 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-primary-600 hover:bg-primary-700 focus:ring-primary-800 flex items-center content-center justify-center"
                >
                  Create an account
                  {clicked && (
                    <svg
                      className="w-5 h-5 ml-2 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                </button>{" "}
                <p class="text-sm font-light text-gray-500 text-gray-400">
                  Already have an account?{" "}
                  <a
                    href="#"
                    class="font-medium text-primary-600 hover:underline text-primary-500"
                  >
                    Login here
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;

  // Forward the cookie from the request headers
  const cookies = req.headers.cookie || "";

  try {
    const result = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/isAuth`,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
        },
      }
    );

    console.log(result?.data);

    return {
      props: {
        api_url: process.env.NEXT_PUBLIC_API_URL,
        auth_data: result?.data,
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
