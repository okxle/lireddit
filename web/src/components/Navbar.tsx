import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
import React from "react";
import { graphql } from "@/generated";
import { useMutation, useQuery } from "urql";
import isServer from "@/utils/isServer";
import { useRouter } from "next/router";

const meQuery = graphql(`
  query Me {
    me {
      id
      username
    }
  }
`);

const logoutMutation = graphql(`
  mutation Logout {
    logout
  }
`);

type Props = {};

const Navbar = (props: Props) => {
  const router = useRouter();
  const [{ data, fetching }] = useQuery({
    query: meQuery,
  });
  const [{ fetching: logoutFetching }, logout] = useMutation(logoutMutation);

  let body;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <nav>
        <Link mr={2} href={"/login"}>
          Login
        </Link>
        <Link href={"/register"}>Register</Link>
      </nav>
    );
  } else {
    body = (
      <Flex align="center">
        <Button as={Link} mr={4} href="/create-post">
          Create post
        </Button>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout({});
            router.reload();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          Sign out
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4} position="sticky" top={0} zIndex={10}>
      <Flex flex={1} maxW={800} m="auto">
        <Link href="/">
          <Heading>LiReddit</Heading>
        </Link>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};

export default Navbar;
