import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import Head from 'next/head';
import { ApolloProvider } from '@apollo/react-hooks';
import fetch from 'isomorphic-unfetch';

export function withApollo(PageComponent) {
  const WithApollo = ({ apolloClient, apolloState, ...pageProps }) => {
    const client = apolloClient || initApolloClient(apolloState);

    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  WithApollo.getInitialProps = async ctx => {
    const { AppTree } = ctx;
    // Initialize ApolloClient, add it to the ctx object so
    // we can use it in `PageComponent.getInitialProp`.
    const apolloClient = (ctx.apolloClient = initApolloClient());

    let pageProps = {};
    if (PageComponent.getInitialProps) {
      pageProps = await PageComponent.getInitailProps(ctx);
    }
    // if on server
    if (typeof window === 'undefined') {
      // When redirecting, the response is finished.
      // No point in continuing to render
      if (ctx.res && ctx.res.finished) {
        return pageProps;
      }
      try {
        // get all data from graphQL queries before app is rendered
        const { getDataFromTree } = await import('@apollo/react-ssr');
        await getDataFromTree(
          <AppTree
            pageProps={{
              ...pageProps,
              apolloClient,
            }}
          />
        );
      } catch (e) {
        console.error('Error while running `getDataFromTree`', e);
      }
      // getDataFromTree does not call componentWillUnmount
      // head side effect therefore need to be cleared manually
      Head.rewind();
    }
    // Extract query data from the Apollo store
    const apolloState = apolloClient.cache.extract();
    return {
      ...pageProps,
      apolloState,
    };
  };

  return WithApollo;
}

const initApolloClient = (initialState = {}) => {
  const cache = new InMemoryCache().restore(initialState);
  const link = new HttpLink({
    uri: `http://localhost:3000/api/graphql`,
  });
  const ssrMode = typeof window === 'undefined';
  const client = new ApolloClient({
    ssrMode,
    link,
    cache,
    fetch,
  });

  return client;
};
