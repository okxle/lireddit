import { MeDocument } from '@/generated/graphql';
import { useRouter } from 'next/router';
import { useEffect } from 'react'
import { useQuery } from 'urql';

const useIsAuth = () => {
  const router = useRouter();
  const [{ data, fetching }] = useQuery({ 
    query: MeDocument,
  });

  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace("/login?next="+router.pathname);
    }
  
  }, [data, router, fetching])
}

export default useIsAuth;