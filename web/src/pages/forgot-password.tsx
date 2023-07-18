import InputField from "@/components/InputField";
import Wrapper from "@/components/Wrapper";
import { toErrorMap } from "@/utils/toErrorMap";
import { Box, Flex, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import router from "next/router";
import React, { useState } from "react";
import login from "./login";
import { withUrqlClient } from "next-urql";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { graphql } from "@/generated";
import { useMutation } from "urql";

type Props = {};

const forgotPasswordMutation = graphql(`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`)

const ForgotPassword = (props: Props) => {
  const [, forgotPassword] = useMutation(forgotPasswordMutation);
  const [complete, setComplete] = useState(false);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await forgotPassword(values);
          setComplete(response.data?.forgotPassword as boolean)
          return response;
        }}
      >
        {({ isSubmitting }) => (
          complete ? 
          <Box>If an account of the email exist, we sent you and email.</Box>
          : <Form>
            <InputField
              name="email"
              placeholder="email"
              label="Email"
            />
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="teal"
            >
              Forgot Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUqrlClient)(ForgotPassword);
