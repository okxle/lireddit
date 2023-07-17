/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query Me {\n    me {\n      id\n      username\n    }\n  }\n": types.MeDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  query Posts {\n    posts {\n      id\n      createdAt\n      updatedAt\n      title\n    }\n  }\n": types.PostsDocument,
    "\n  mutation Login($usernameOrEmail: String!, $password: String!) {\n    login(usernameOrEmail: $usernameOrEmail, password: $password) {\n      errors {\n        field\n        message\n      }\n      user {\n        id\n        username\n      }\n    }\n  }\n": types.LoginDocument,
    "\nmutation Register($options: UsernamePasswordInput!) {\n  register(options: $options){\n    user{\n      id,\n      username\n    }\n    errors {\n      field\n      message\n    }\n  }\n}": types.RegisterDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      username\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      username\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Posts {\n    posts {\n      id\n      createdAt\n      updatedAt\n      title\n    }\n  }\n"): (typeof documents)["\n  query Posts {\n    posts {\n      id\n      createdAt\n      updatedAt\n      title\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($usernameOrEmail: String!, $password: String!) {\n    login(usernameOrEmail: $usernameOrEmail, password: $password) {\n      errors {\n        field\n        message\n      }\n      user {\n        id\n        username\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($usernameOrEmail: String!, $password: String!) {\n    login(usernameOrEmail: $usernameOrEmail, password: $password) {\n      errors {\n        field\n        message\n      }\n      user {\n        id\n        username\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\nmutation Register($options: UsernamePasswordInput!) {\n  register(options: $options){\n    user{\n      id,\n      username\n    }\n    errors {\n      field\n      message\n    }\n  }\n}"): (typeof documents)["\nmutation Register($options: UsernamePasswordInput!) {\n  register(options: $options){\n    user{\n      id,\n      username\n    }\n    errors {\n      field\n      message\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;