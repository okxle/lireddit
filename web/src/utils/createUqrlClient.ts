import {
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from "@/generated/graphql";
import { betterUpdateQuery } from "@/utils/betterUpdateQuery";
import { devtoolsExchange } from "@urql/devtools";
import {
  Resolver,
  cacheExchange as cacheExchangeURL,
} from "@urql/exchange-graphcache";
import Router from "next/router";
import { errorExchange, fetchExchange } from "urql";
import { gql } from "@urql/core";
import { cursorPagination } from "./cursorPagination";
import isServer from "./isServer";

export const createUqrlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  } 
  return {
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
    headers : cookie ? { cookie } : undefined
  },
  exchanges: [
    devtoolsExchange,
    cacheExchangeURL({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          deletePost : (_result: any, args, cache, info) => {
            cache.invalidate({__typename: "Post", id: (args as DeletePostMutationVariables).id})
          },
          vote: (_result: any, args, cache, info) => {
            const { postId, value } = args as VoteMutationVariables;
            const data = cache.readFragment<{ id: number; points?: number, voteStatus?: number }>(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId }
            );
            if (data) {
              if (data.voteStatus === value) return;
              const newPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value);
              cache.writeFragment(
                gql`
                  fragment __ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId, points: newPoints, voteStatus: value }
              );
            }
          },
          createPost: (_result: any, args, cache, info) => {
            // console.log(cache.inspectFields("Query"))
            const allFields = cache.inspectFields("Query");
            const fieldInfos = allFields.filter(
              (info) => info.fieldName === "posts"
            );
            fieldInfos.forEach((fieldInfo) => {
              cache.invalidate("Query", "posts", fieldInfo.arguments || {});
            });
            // console.log(cache.inspectFields("Query"))
          },
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
        console.log(error);
        if (error?.message.includes("not authenticated")) {
          Router.replace("/login");
        }
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
  };
};
