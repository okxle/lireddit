import InputField from "@/components/InputField";
import Wrapper from "@/components/Wrapper";
import { graphql } from "@/generated";
import { createUqrlClient } from "@/utils/createUqrlClient";
import { toErrorMap } from "@/utils/toErrorMap";
import { Flex, Box, Button, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage, NextPageContext } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useMutation } from "urql";

type Props = {
  // token: string;
};

const changePasswordMutation = graphql(`
  mutation ChangePassword($token: String!, $newPassword: String!) {
    changePassword(token: $token, newPassword: $newPassword) {
      errors {
        field
        message
      }
      user {
        id
        username
      }
    }
  }
`);

// export async function getServerSideProps(context: NextPageContext) {
//   const { token } = context.query;
//   return {
//     props: {
//       token,
//     },
//   };
// }

const ChangePassword: NextPage<Props> = () => {
  const router = useRouter();
  const [, changePassword] = useMutation(changePasswordMutation);
  const [tokenError, setTokenError] = useState("");

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            token: typeof router.query.token === "string" ? router.query.token : "",
            newPassword: values.newPassword,
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else {
            router.push("/");
          }
          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError && (
              <Flex>
                <Box color="red" mr={2}>{tokenError}</Box>
                <Link href="/forgot-password">Re-request password</Link>
              </Flex> 
            )}
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="teal"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUqrlClient, { ssr: false })(ChangePassword);
