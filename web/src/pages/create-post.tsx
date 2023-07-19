import InputField from "@/components/InputField";
import Layout from "@/components/Layout";
import { graphql } from "@/generated";
import useIsAuth from "@/hooks/useIsAuth";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "urql";

type Props = {};

const createPostMutation = graphql(`
  mutation CreatePost($input: PostInput!) {
    createPost(input: $input) {
      id
      createdAt
      updatedAt
      title
      text
      points
      creatorId
    }
  }
`);

const CreatePost = (props: Props) => {
  const router = useRouter();
  const [, createPost] = useMutation(createPostMutation);
  useIsAuth();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await createPost({ input: values });
          if (!response.error) router.push("/");
          return response;
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
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUqrlClient)(CreatePost);
