import InputField from "@/components/InputField";
import Wrapper from "@/components/Wrapper";
import { graphql } from "@/generated/gql";
import { createUrlClient } from "@/utils/createUrlClient";
import { toErrorMap } from "@/utils/toErrorMap";
import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useMutation } from "urql";

type Props = {};

const registerMutation = graphql(`
mutation Register($options: UsernamePasswordInput!) {
  register(options: $options){
    user{
      id,
      username
    }
    errors {
      field
      message
    }
  }
}`)

const Register = (props: Props) => {
  const router = useRouter();
  const [, register] = useMutation(registerMutation);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={async (values, {setErrors}) => {
          const response = await register({options: values})
          if(response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors))
          } else {
            router.push("/")
          }
          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="teal"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrlClient)(Register);
