import React from 'react';
import { View, Text } from 'react-native';
import globalStyles from '../styles/globalStyles.js';

export default function DetalheMotoScreen({ route }) {
    const { moto } = route.params;

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Detalhes da Moto</Text>

            <Text style={globalStyles.text}>
                <Text style={{ fontWeight: 'bold' }}>Placa: </Text>
                {moto.placa}
            </Text>

            <Text style={globalStyles.text}>
                <Text style={{ fontWeight: 'bold' }}>Marca: </Text>
                {moto.marca}
            </Text>

            <Text style={globalStyles.text}>
                <Text style={{ fontWeight: 'bold' }}>Modelo: </Text>
                {moto.modelo}
            </Text>

            <Text style={globalStyles.text}>
                <Text style={{ fontWeight: 'bold' }}>Ano: </Text>
                {moto.ano}
            </Text>

            <Text style={globalStyles.text}>
                <Text style={{ fontWeight: 'bold' }}>Renavam: </Text>
                {moto.renavam}
            </Text>
        </View>
    );
}
