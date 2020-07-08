import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { StatusBar } from 'react-native';
import { Container, Content, Description } from './styles';

const Modal: React.FC = () => {
  return (
    <Container animationType="fade" transparent>
      <StatusBar hidden />
      <Content>
        <Icon name="thumbs-up" size={40} color="#39B100" />
        <Description>Pedido confirmado!</Description>
      </Content>
    </Container>
  );
};

export default Modal;
