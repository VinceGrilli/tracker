import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import HabitList from '../components/HabitList';
import Layout from '../components/Layout';
import { withApollo } from '../lib/apollo';

const HELLO_QUERY = gql`
  query HelloQuery {
    sayHello
  }
`;

const Home = () => {
  const { data, loading, error } = useQuery(HELLO_QUERY);
  if (loading) return <div />;
  console.log(data);
  return (
    <Layout>
      <div className='hero'>
        <h1 className='title'>Habit Tracker</h1>
        <HabitList />
      </div>

      <style jsx>{`
        .hero {
          width: 100%;
          color: #333;
        }
        .title {
          margin: 0;
          width: 100%;
          padding-top: 80px;
          line-height: 1.15;
          font-size: 48px;
        }
        .title,
        .description {
          text-align: center;
        }
      `}</style>
    </Layout>
  );
};

export default withApollo(Home);
