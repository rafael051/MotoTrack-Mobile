import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MotoCard from '../components/MotoCard.jsx';
import globalStyles from '../styles/globalStyles.js';

export default function ListagemMotosScreen({ navigation }) {
    const [motos, setMotos] = useState([]);

    useEffect(() => {
        const carregar = async () => {
            try {
                const dados = JSON.parse(await AsyncStorage.getItem('motos')) || [];
                setMotos(dados);
            } catch (error) {
                console.error('Erro ao carregar motos:', error);
            }
        };

        const unsubscribe = navigation.addListener('focus', carregar);
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={globalStyles.container}>
            <FlatList
                data={motos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <MotoCard
                        moto={item}
                        onPress={() => navigation.navigate('DetalheMoto', { moto: item })}
                    />
                )}
                ListEmptyComponent={
                    <Text style={globalStyles.text}>Nenhuma moto cadastrada ainda.</Text>
                }
            />
        </View>
    );
}
