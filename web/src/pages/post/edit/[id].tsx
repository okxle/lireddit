import InputField from "@/components/InputField";
import Layout from "@/components/Layout";
import { graphql } from "@/generated";
import useGetIntId from "@/hooks/useGetIntId";
import useGetPostFromUrl from "@/hooks/useGetPostFromUrl";
import useIsAuth from "@/hooks/useIsAuth";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { useMutation } from "urql";

type Props = {};

const updatePostMutation = graphql(`
  mutation UpdatePost($id: Int!, $title: String!, $text: String!) {
    updatePost(id: $id, title: $title, text: $text) {
      id
      title
      text
      textSnippet
    }
  }
`);

const EditPost = (props: Props) => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, fetching }] = useGetPostFromUrl();
  const [, updatePost] = useMutation(updatePostMutation);
  useIsAuth();

  if (fetching) {
    return <Layout>
      <div>loading...</div>
    </Layout>
  }

  if (!data?.post) {
    return <Layout>
      <div>couldn't find post</div>
    </Layout>
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values, { setErrors }) => {
          await updatePost({id: intId, ...values})
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="text..."
                label="Body"
                textarea
              />
            </Box>
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="blackAlpha"
            >
              Edit Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUqrlClient)(EditPost);
