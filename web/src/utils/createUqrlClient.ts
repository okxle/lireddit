import {fetchExchange } from "urql";
import {
  cacheExchange as cacheExchangeURL,
} from "@urql/exchange-graphcache";
import { devtoolsExchange } from "@urql/devtools";
import {
  MeDocument,
  MeQuery,
  LoginMutation,
  LogoutMutation,
  RegisterMutation,
} from "@/generated/graphql";
import { betterUpdateQuery } from "@/utils/betterUpdateQuery";

export const createUqrlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  exchanges: [
    cacheExchangeURL({
      updates: {
        Mutation: {
          login: (_result: any, args, cache, info) => {
            // cache.updateQuery({query: MeDocument}, (query) => {
            //   if (_result.login.errors) return query;
            //   return {me: _result.login.user}
            // })
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) return query;
                return { me: result.login.user };
              }
            );
          },
          register: (_result, args, cache, info) => {
            console.log({ _result, args, cache, info });
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) return query;
                return { me: result.register.user };
              }
            );
          },
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => {
                return { me: null };
              }
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
    devtoolsExchange,
  ],
  fetchOptions: {
    credentials: "include" as const,
  },
});
