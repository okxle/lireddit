import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "@/generated/graphql";
import { betterUpdateQuery } from "@/utils/betterUpdateQuery";
import { devtoolsExchange } from "@urql/devtools";
import {
  cacheExchange as cacheExchangeURL,
} from "@urql/exchange-graphcache";
import Router  from "next/router";
import { errorExchange, fetchExchange } from "urql";

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
    errorExchange({
      onError(error) {
        console.log(error)
        if (error?.message.includes("not authenticated")) {
          Router.replace("/login");
        }
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
