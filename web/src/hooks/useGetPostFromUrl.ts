import { graphql } from "@/generated";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import useGetIntId from "./useGetIntId";

const postQuery = graphql(`
  query Post($id: Int!) {
    post(id: $id) {
      id
      createdAt
      updatedAt
      title
      points
      text
      voteStatus
      creator {
        id
        username
      }
    }
  }
`);

const useGetPostFromUrl = () => {
  const intId = useGetIntId();
  return useQuery({
    query: postQuery,
    variables: { id: intId },
    pause: intId === -1
  });
}

export default useGetPostFromUrl;