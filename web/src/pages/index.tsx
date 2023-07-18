"useclient"
import Navbar from "@/components/Navbar";
import { graphql } from "@/generated";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { Container } from "@chakra-ui/react";
import { NextPageContext } from "next";
import { initUrqlClient, withUrqlClient } from "next-urql";
import { ssrExchange, useQuery } from "urql";

const postsQuery = graphql(`
  query Posts {
    posts {
      id
      createdAt
      updatedAt
      title
    }
  }
`);

type Props = {
};

export async function getServerSideProps(context:  NextPageContext) {  
  const ssrCache = ssrExchange({ isClient: false });
  const client = initUrqlClient(createUqrlClient(ssrCache), false);
  await client.query(postsQuery, {}).toPromise();

  return {
    props: {
      urqlState: ssrCache.extractData(),
    },
  };
}

function Home() {
  const [{ data }] = useQuery({ query: postsQuery });
  return (
    <>
      <Navbar />
      <Container>
        Hello World
        <hr />
        {!data ? (
          <div>loading...</div>
        ) : (
          data.posts.map((d) => <div key={d.id}>{d.title}</div>)
        )}
      </Container>
    </>
  );
}

export default withUrqlClient(createUqrlClient)(Home);
