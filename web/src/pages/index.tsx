import Layout from "@/components/Layout";
import UpdootSection from "@/components/UpdootSection";
import { graphql } from "@/generated";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { DeleteIcon } from "@chakra-ui/icons";
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
import { ssrExchange, useMutation, useQuery } from "urql";

const postsQuery = graphql(`
  query Posts($limit: Int!, $cursor: String) {
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

const deletePostMutation = graphql(`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id)
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

  const [, deletePost] = useMutation(deletePostMutation)

  if (!fetching && !data) {
    return <>You got no post for some reason</>;
  }

  return (
    <Layout>
      <Stack spacing={8}>
        {!data && fetching ? (
          <div>loading...</div>
        ) : (
          data!.posts.posts.map((d) => !d ? null : (
            <Flex key={d.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={d} />
              <Box flex={1}>
                <Link href={`/post/${d.id}`}>
                  <Heading fontSize="xl">{d.title}</Heading>
                </Link>
                <Text>posted by {d.creator.username}</Text>
                <Flex align="center">
                  <Text flex={1} mt={4}>{d.textSnippet}</Text>
                  <IconButton
                    colorScheme="red"
                    icon={<DeleteIcon />}
                    aria-label="delete post"
                    onClick={() => deletePost({id: d.id})}
                  />
                </Flex>
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

export default withUrqlClient(createUqrlClient, { ssr: true })(Home);
