import { graphql } from "@/generated";
import { MeDocument } from "@/generated/graphql";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/next-js";
import { Box, IconButton } from "@chakra-ui/react";
import React from "react";
import { useMutation, useQuery } from "urql";

const deletePostMutation = graphql(`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id)
  }
`);

type Props = {
  id: number;
  creatorId: number;
};

const EditAndDeletePostButton = ({ id, creatorId }: Props) => {
  const [{ data: meData }] = useQuery({ query: MeDocument });
  const [, deletePost] = useMutation(deletePostMutation);
  if (meData?.me?.id !== creatorId) {
    return null;
  }
  return (
    <Box>
      <IconButton
        mr={4}
        as={Link}
        icon={<EditIcon />}
        aria-label="delete post"
        href={`/post/edit/${id}`}
      />
      <IconButton
        icon={<DeleteIcon />}
        aria-label="edit post"
        onClick={() => deletePost({ id })}
      />
    </Box>
  );
};

export default EditAndDeletePostButton;
