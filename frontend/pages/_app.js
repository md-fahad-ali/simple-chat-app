import "@/styles/globals.css";
import { SocketProvider } from "@/context/SocketContext";

export default function App({ Component, pageProps }) {
  console.log(process.env,"some process")
  return (
    <SocketProvider>
      <Component {...pageProps} />{" "}
    </SocketProvider>
  );
}
