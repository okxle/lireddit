import EditAndDeletePostButton from "@/components/EditAndDeletePostButton";
import Layout from "@/components/Layout";
import useGetPostFromUrl from "@/hooks/useGetPostFromUrl";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";

type Props = {};

const Post = (props: Props) => {
  const [{ data, fetching }] = useGetPostFromUrl();

  if (!data?.post) {
    return (
      <Layout>
        <div>couldn't find post</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{data?.post?.title}</Heading>
      <Box mb={4}>{data?.post?.text}</Box>
      <EditAndDeletePostButton
        id={data.post.id}
        creatorId={data.post.creator.id}
      />
    </Layout>
  );
};

export default withUrqlClient(createUqrlClient, { ssr: true })(Post);
