import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';

import api from '../../services/api';
import formatValue from '../../utils/formatValue';

import {
  Container,
  Header,
  HeaderTitle,
  FoodsContainer,
  FoodList,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
} from './styles';

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  formattedValue: number;
  thumbnail_url: string;
  cartTotal: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Food[]>([]);
  // const isFocused = useIsFocused();
  const { navigate } = useNavigation();

  useEffect(() => {
    async function loadOrders(): Promise<void> {
      const response = await api.get<Food[]>('orders');

      setOrders(response.data);
    }

    loadOrders();
  }, []);

  async function handleNavigate(id: number): Promise<void> {
    navigate('OrderDetails', {
      id,
    });
  }

  return (
    <Container>
      <Header>
        <HeaderTitle>Meus pedidos</HeaderTitle>
      </Header>

      <FoodsContainer>
        <FoodList
          data={orders}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <Food
              key={item.id}
              activeOpacity={0.6}
              onPress={() => handleNavigate(item.id)}
            >
              <FoodImageContainer>
                <Image
                  style={{ width: 88, height: 88 }}
                  source={{ uri: item.thumbnail_url }}
                />
              </FoodImageContainer>
              <FoodContent>
                <FoodTitle>{item.name}</FoodTitle>
                <FoodDescription>{item.description}</FoodDescription>
                <FoodPricing>{item.cartTotal}</FoodPricing>
              </FoodContent>
            </Food>
          )}
        />
      </FoodsContainer>
    </Container>
  );
};

export default Orders;
