import React from "react";

export default function Check(props) {
  console.log(props);
  return (
    <div>
      <h1>Check Page</h1>
      {JSON.stringify(props)}
      <code></code>
    </div>
  );
}
export async function getServerSideProps(context) {
  const { req, res } = context;
  const cookies = req.headers.cookie || "";
  const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/isAuth`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
  });
  const data = await result.json();

  console.log(cookies);

  return {
    props: {
      user_data: data,
      api_url: process.env?.NEXT_PUBLIC_API_URL,
    },
  };
}
