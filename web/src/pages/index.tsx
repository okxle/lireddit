import Layout from "@/components/Layout";
import UpdootSection from "@/components/UpdootSection";
import { graphql } from "@/generated";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { NextPageContext } from "next";
import { initUrqlClient, withUrqlClient } from "next-urql";
import { useState } from "react";
import { ssrExchange, useQuery } from "urql";

const postsQuery = graphql(`
  query Post($limit: Int!, $cursor: String) {
    posts(limit: $limit, cursor: $cursor) {
      hasMore
      posts {
        id
        createdAt
        updatedAt
        title
        textSnippet
        points
        voteStatus
        creator {
          id
          username
        }
      }
    }
  }
`);

type Props = {};
const limit = 10;

// export async function getServerSideProps(context: NextPageContext) {
//   const ssrCache = ssrExchange({ isClient: false });
//   const client = initUrqlClient(createUqrlClient(ssrCache, context), false);
//   await client.query(postsQuery, { cursor: null, limit }).toPromise();
//   return {
//     props: {
//       urqlState: ssrCache.extractData(),
//     },
//   };
// }

function Home() {
  const [variables, setVariables] = useState({
    limit,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = useQuery({
    query: postsQuery,
    variables,
  });

  if (!fetching && !data) {
    return <>You got no post for some reason</>;
  }

  return (
    <Layout>
      <Flex align="end">
        <Heading>LiReddit</Heading>
        <Link ml="auto" href="/create-post">
          Create post
        </Link>
      </Flex>
      <br />
      <Stack spacing={8}>
        {!data && fetching ? (
          <div>loading...</div>
        ) : (
          data!.posts.posts.map((d) => (
            <Flex key={d.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={d}/>
              <Box>
                <Heading fontSize="xl">{d.title}</Heading>
                <Text>posted by {d.creator.username}</Text>
                <Text mt={4}>{d.textSnippet}</Text>
              </Box>
            </Flex>
          ))
        )}
      </Stack>
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                limit: variables.limit,
              });
            }}
            isLoading={fetching}
            mx="auto"
            my={8}
          >
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  );
}

export default withUrqlClient(createUqrlClient, {ssr: true})(Home);
