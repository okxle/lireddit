"useclient";
import Layout from "@/components/Layout";
import { graphql } from "@/generated";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { Link } from "@chakra-ui/next-js";
import { NextPageContext } from "next";
import { initUrqlClient, withUrqlClient } from "next-urql";
import { ssrExchange, useQuery } from "urql";

const postsQuery = graphql(`
  query Post($limit: Int!, $cursor: String!){
    posts(limit: $limit, cursor: $cursor){
      id,
      createdAt,
      updatedAt,
      title
    }
  }
`);

type Props = {};
const limit = 10;

export async function getServerSideProps(context: NextPageContext) {
  const ssrCache = ssrExchange({ isClient: false });
  const client = initUrqlClient(createUqrlClient(ssrCache), false);
  await client.query(postsQuery, {cursor: "", limit}).toPromise();
  return {
    props: {
      urqlState: ssrCache.extractData(),
    },
  };
}

function Home() {
  const [{ data }] = useQuery({ 
    query: postsQuery, 
    variables: {
      cursor: "",
      limit
    }
  });
  return (
    <Layout>
      <Link href="/create-post">Create post</Link>
      <hr />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((d) => <div key={d.id}>{d.title}</div>)
      )}
    </Layout>
  );
}

export default withUrqlClient(createUqrlClient)(Home);
