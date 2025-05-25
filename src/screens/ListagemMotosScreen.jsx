import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import globalStyles from '../styles/globalStyles';

export default function ListagemMotosScreen() {
    const [motos, setMotos] = useState([]);

    useEffect(() => {
        carregarMotos();
    }, []);

    const carregarMotos = async () => {
        try {
            const dados = JSON.parse(await AsyncStorage.getItem('motos')) || [];
            setMotos(dados);
        } catch (error) {
            console.error('Erro ao carregar motos:', error);
        }
    };

    const excluirMoto = async (index) => {
        try {
            const atualizadas = motos.filter((_, i) => i !== index);
            await AsyncStorage.setItem('motos', JSON.stringify(atualizadas));
            setMotos(atualizadas);
            console.log('Moto excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir moto:', error);
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={globalStyles.card}>
            <Text style={globalStyles.cardPlaca}>Placa: {item.placa}</Text>
            <Text style={globalStyles.cardModelo}>Marca: {item.marca}</Text>
            <Text style={globalStyles.cardModelo}>Modelo: {item.modelo}</Text>
            <Text style={globalStyles.cardModelo}>Ano: {item.ano}</Text>
            <Text style={globalStyles.cardModelo}>Renavam: {item.renavam}</Text>

            <TouchableOpacity
                style={[globalStyles.button, { marginTop: 10 }]}
                onPress={() => excluirMoto(index)}
            >
                <Text style={globalStyles.buttonText}>Excluir</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={globalStyles.container}>
            <FlatList
                data={motos}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={globalStyles.text}>Nenhuma moto cadastrada.</Text>
                }
            />
        </View>
    );
}
