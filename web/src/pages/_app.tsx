import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/themes";
import { Provider, cacheExchange, createClient, fetchExchange } from "urql";

const client = createClient({
  url: "http://localhost:4000/graphql",
  exchanges: [cacheExchange, fetchExchange], 
  fetchOptions: {
    credentials: "include",
  }
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS={true} theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}
