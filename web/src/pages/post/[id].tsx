import Layout from "@/components/Layout";
import { graphql } from "@/generated";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "urql";

type Props = {};

const postQuery = graphql(`
  query Post($id: Int!) {
    post(id: $id) {
      id
      createdAt
      updatedAt
      title
      points
      text
      voteStatus
      creator {
        id
        username
      }
    }
  }
`);

const Post = (props: Props) => {
  const router = useRouter();
  const intId = typeof router.query.id === "string"? parseInt(router.query.id): -1;
  const [{ data, fetching }] = useQuery({
    query: postQuery,
    variables: { id: intId },
    pause: intId === -1
  });

  if (!data?.post) {
    return <Layout>
      <div>couldn't find post</div>
    </Layout>
  }
  
  return <Layout>
    <Heading mb={4}>{data?.post?.title}</Heading>
    {data?.post?.text}
  </Layout>;
};

export default withUrqlClient(createUqrlClient, { ssr: true })(Post);
