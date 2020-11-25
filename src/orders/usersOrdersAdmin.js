import React from 'react';
import { View, SafeAreaView, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { Text, ListItem, Avatar, Card, Button, Badge, colors } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useQuery, gql } from '@apollo/client';
import { colorsLocal } from '../theme';
import moment from "moment";

const GET_ORDERS_ADMIN_QUERY = gql`
  query {
    getUsersOrdersAdmin {
      id
      name
      email
      phone
      orders {
        id
        order_date
        status
        user_id
        book_id
        books {
          id
          title
          price
          status
          cover_url
        }
      }
    }
  } 
`

const Orders = ({ navigation }) => {
  const { data, loading, error } = useQuery(GET_ORDERS_ADMIN_QUERY);

  if (error) {
    return (<SafeAreaView style={styles.loadingContainer}><Text style={styles.error}>{error.message}</Text></SafeAreaView>);
  }

  const renderFooter = () => {
    if (loading) {
      return (
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
        </SafeAreaView>
      );
    } else {
      return null
    }
  }

  const renderSeprator = () => (
    <View style={{ height: 1, width: '86%', backgroundColor: colors.divider, marginLeft: '14%' }} />
  )

  const { getUsersOrdersAdmin } = !!data && data;

  return (
    <View style={styles.container}>
      { getUsersOrdersAdmin && getUsersOrdersAdmin.length === 0 && <View style={styles.infoMsgContainer}>
        <Text style={styles.info}>No one has placed an order yet.</Text>
      </View>}
      <FlatList
        data={getUsersOrdersAdmin}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={renderSeprator}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.text}>
              <Text style={styles.label}>Name: </Text>{item.name}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Email: </Text>{item.email}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Phone: </Text>{item.phone}
            </Text>
            <Card.Divider />
            <Text h4>Orders</Text>
            {item.orders.map(order => {
              let badgeStatus
              switch (order.status) {
                case 'active':
                  badgeStatus = 'primary'
                  break;
                case 'pending':
                  badgeStatus = 'warnning'
                  break;
                case 'resolved':
                  badgeStatus = 'sucess'
                  break;
                default:
                  break;
              }
              return (<ListItem key={order.id}
                containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}
                onPress={() => { navigation.navigate('Books', { screen: 'ViewBook', params: { id: order.books.id } }) }}>
                <Avatar source={{ uri: order.books.cover_url }} />
                <ListItem.Content>
                  <ListItem.Subtitle>{order.books.title}</ListItem.Subtitle>
                  <Badge
                    status={badgeStatus}
                    value={order.books.status} />
                </ListItem.Content>
                <ListItem.Content>
                  <ListItem.Subtitle>{moment(order.order_date).format('ll')}</ListItem.Subtitle>
                </ListItem.Content>
                <ListItem.Content>
                  <ListItem.Title>{order.books.price + '\u0020'}<Text style={styles.currency + '\u0020'}>ETB</Text></ListItem.Title>
                </ListItem.Content>
                <ListItem.Content>

                  <ListItem.Subtitle>Order status</ListItem.Subtitle>
                  <Badge
                    value={order.status} />
                </ListItem.Content>
              </ListItem>)
            })}
            <Button
              type='outline'
              title="View order"
              icon={
                <Icon
                  name="eye"
                  size={20}
                  style={{ marginRight: 10 }}
                  color={colors.white}
                />
              }
              onPress={() => { navigation.push('ViewUserOrdersAdmin', { name: 'View user orders (Admin view)', id: item.id }) }}
            />

          </Card>)
        } />
    </View>)
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: colors.error,
    fontSize: 18,
    paddingHorizontal: 20
  },
  container: {
    flex: 1,
  },
  infoMsgContainer: {
    backgroundColor: colorsLocal.infoBg,
    marginBottom: 26,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  card: {
    shadowColor: colors.divider,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  info: {
    color: colorsLocal.info,
    fontSize: 18,
    lineHeight: 25,
    paddingHorizontal: 20
  },
  text: {
    marginTop: 10,
    textTransform: 'capitalize'
  },
  currency: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  label: {
    fontWeight: '600',
  },
});

export default Orders