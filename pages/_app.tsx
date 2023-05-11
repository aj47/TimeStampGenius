import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
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
      <ChakraProvider>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}
