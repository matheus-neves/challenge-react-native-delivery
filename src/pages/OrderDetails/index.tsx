import React, { useEffect, useState, useMemo } from 'react';
import { Image } from 'react-native';

import { useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  TotalPrice,
  TotalExtraContainer,
  TotalExtraText,
  TotalExtraContent,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  formattedPrice: string;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  quantity: number;
  extras: Extra[];
  cartTotal: string;
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);

  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadOrder(): Promise<void> {
      const { id } = routeParams;

      const response = await api.get<Food>(`orders/${id}`);

      const serializedExtras = response.data.extras.map(extra => ({
        ...extra,
        formattedPrice: formatValue(extra.value),
      }));

      setExtras(serializedExtras);
      setFood(response.data);
    }

    loadOrder();
  }, [routeParams]);

  const totalExtras = useMemo(() => {
    const calc = extras.reduce((acc, { quantity, value }) => {
      return acc + value * quantity;
    }, 0);

    return formatValue(calc);
  }, [extras]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <AdittionalItemText>Qtd.: {extra.quantity}</AdittionalItemText>
                <AdittionalItemText>{extra.formattedPrice}</AdittionalItemText>
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
          <TotalExtraContainer>
            <TotalExtraText>Total dos adicionais</TotalExtraText>
            <TotalExtraContent>
              <TotalExtraText />
              <TotalExtraText>{totalExtras}</TotalExtraText>
            </TotalExtraContent>
          </TotalExtraContainer>
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <TotalPrice>{food.cartTotal}</TotalPrice>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
