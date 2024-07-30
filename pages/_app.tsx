import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { GlobalProvider } from '../store/GlobalStore';
import "../styles/Dashboard.css";
import "../styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <GlobalProvider>
        <Component {...pageProps} />
        <Analytics />
      </GlobalProvider>
    </SessionProvider>
  );
}
