import "@/styles/globals.css";
import { SocketProvider } from "@/context/SocketContext";

export default function App({ Component, pageProps }) {
  const api_url = process.env.NEXT_PUBLIC_API_URL || null;
  return (
    <SocketProvider url={api_url}>
      <Component {...pageProps} />{" "}
    </SocketProvider>
  );
}
