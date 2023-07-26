import { graphql } from "@/generated";
import { Post, PostQuery } from "@/generated/graphql";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { useMutation } from "urql";

type Props = {
  post: PostQuery["posts"]["posts"][0];
};

const voteMutation = graphql(`
  mutation Vote($value: Int!, $postId: Int!) {
    vote(value: $value, postId: $postId)
  }
`);

const UpdootSection = ({ post }: Props) => {
  const [loading, setLoading] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useMutation(voteMutation);
  return (
    <Flex alignItems="center" direction="column" justifyContent="center" mr={4}>
      <IconButton
        aria-label="updoot post"
        icon={<ChevronUpIcon />}
        onClick={async () => {
          if (post.voteStatus === 1) return;
          setLoading("updoot-loading");
          await vote({ value: 1, postId: post.id });
          setLoading("not-loading");
        }}
        isLoading={loading === "updoot-loading"}
        boxSize="24px"
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
      />
      {post.points}
      <IconButton
        aria-label="downdoot post"
        icon={<ChevronDownIcon />}
        onClick={async () => {
          if (post.voteStatus === -1) return;
          setLoading("downdoot-loading");
          await vote({ value: -1, postId: post.id });
          setLoading("not-loading");
        }}
        isLoading={loading === "downdoot-loading"}
        boxSize="24px"
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
      />
    </Flex>
  );
};

export default UpdootSection;
