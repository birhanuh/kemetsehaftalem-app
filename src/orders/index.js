import React from 'react';
import { View, SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import { useQuery, gql } from '@apollo/client';

const GET_ORDERS = gql`
  query {
    getOrders {
      title
      author
      condition
      language
      price
      status
      published_date
      isbn
      categories {
        name
      }
      orders {
        users {
          id
          name
        }
      }
    }
  }
`

const Orders = () => {
  const { data, loading, error } = useQuery(GET_ORDERS);

  const list = [
    {
      name: 'Amy Farha',
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
      subtitle: 'Vice President'
    },
    {
      name: 'Chris Jackson',
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
      subtitle: 'Vice Chairman'
    }
  ]

  if (error) { console.error('error', error) };
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  };

  // const { getOrders } = data;
  // console.log("ORDERS: ", getOrders);
  return (
    <View style={styles.container}>
      {
        list.map((l, i) => (
          <ListItem key={i} bottomDivider>
            <Avatar source={{ uri: l.avatar_url }} />
            <ListItem.Content>
              <ListItem.Title>{l.name}</ListItem.Title>
              <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ))
      }
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'powderblue',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50
  }
});

export default Orders