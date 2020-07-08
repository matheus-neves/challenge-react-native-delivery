import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image, Alert } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from '../../components/Modal';
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
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      // Load a specific food with extras based on routeParams id

      const { id } = routeParams;

      const response = await api.get<Food>(`foods/${id}`);

      const serializedFood = {
        ...response.data,
        formattedPrice: formatValue(response.data.price),
      };

      const dataExtra = serializedFood.extras.map(extra => ({
        ...extra,
        quantity: 0,
      }));

      setExtras(dataExtra);
      setFood(serializedFood);
    }

    loadFood();
  }, [routeParams]);

  useEffect(() => {
    const loadFavorites = async (): Promise<void> => {
      const response = await api.get<Food[]>('favorites');

      const founded = response.data.find(favorite => favorite.id === food.id);

      if (founded) setIsFavorite(true);
    };

    loadFavorites();
  }, [food.id]);

  function handleIncrementExtra(id: number): void {
    // Increment extra quantity

    const incrementedExtra = extras.map(extra => {
      const { quantity } = extra;

      if (extra.id === id) {
        return {
          ...extra,
          quantity: quantity + 1,
        };
      }

      return extra;
    });

    setExtras(incrementedExtra);
  }

  function handleDecrementExtra(id: number): void {
    // Decrement extra quantity
    const decrementedExtra = extras.map(extra => {
      if (extra.id === id && extra.quantity > 0) {
        return {
          ...extra,
          quantity: extra.quantity - 1,
        };
      }

      return extra;
    });

    setExtras(decrementedExtra);
  }

  function handleIncrementFood(): void {
    // Increment food quantity
    setFoodQuantity(state => state + 1);
  }

  function handleDecrementFood(): void {
    // Decrement food quantity
    setFoodQuantity(state => (state > 1 ? state - 1 : state));
  }

  const toggleFavorite = useCallback(async () => {
    // Toggle if food is favorite or not

    if (isFavorite) {
      await api.delete(`favorites/${food.id}`);
    } else {
      await api.post('favorites', {
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        image_url: food.image_url,
        thumbnail_url: food.thumbnail_url,
      });
    }
    setIsFavorite(state => !state);
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    // Calculate cartTotal

    const foodCalculation = foodQuantity * food.price;
    const extraTotal = extras.reduce((acc, { quantity, value }) => {
      return acc + value * quantity;
    }, 0);

    return formatValue(extraTotal + foodCalculation);
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    // Finish the order and save on the API

    try {
      const order = {
        ...food,
        quantity: foodQuantity,
        extras,
        cartTotal,
      };

      await api.post('orders', order);

      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigation.navigate('OrderDetails', {
          id: food.id,
        });
      }, 2000);
    } catch (error) {
      Alert.alert('Erro ao efetuar o pedido');
    }
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />
      {showModal && <Modal />}
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
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
