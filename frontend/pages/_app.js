import "@/styles/globals.css";
import { SocketProvider } from "@/context/SocketContext";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  const api_url = process.env.NEXT_PUBLIC_API_URL || null;
  const { statusCode } = pageProps;

  useEffect(() => {
    if (statusCode === 500) {
      const timeout = setTimeout(() => {
        window.location.reload();
      }, 5000); // Refresh after 5 seconds

      return () => clearTimeout(timeout); // Clean up the timeout on component unmount
    }
  }, [statusCode]);

  return (
    <SocketProvider url={api_url}>
      <Component {...pageProps} />
    </SocketProvider>
  );
}
