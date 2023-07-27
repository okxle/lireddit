import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React from "react";
import { graphql } from "@/generated";
import { useMutation, useQuery } from "urql";
import isServer from "@/utils/isServer";

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
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => {
            logout({});
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
    <Flex bg="tan" p={4} position="sticky" top={0} zIndex={10} alignItems="center">
      <Link href="/">
        <Heading>LiReddit</Heading>
      </Link>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};

export default Navbar;
