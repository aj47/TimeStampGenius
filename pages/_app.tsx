import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { Analytics } from '@vercel/analytics/react';
import "../styles/Dashboard.css"
import "../styles/globals.css"
const client = new ApolloClient({
  uri: "https://countries.trevorblades.com/",
  cache: new InMemoryCache(),
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ApolloProvider client={client}>
        <SessionProvider session={session}>
          <Component {...pageProps} />
          <Analytics />
        </SessionProvider>
    </ApolloProvider>
  );
}
