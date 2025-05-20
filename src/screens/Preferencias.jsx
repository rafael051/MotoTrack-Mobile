import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FormInput from '../components/FormInput.jsx';
import globalStyles from '../styles/globalStyles.js';

export default function PreferenciasScreen() {
    const [nome, setNome] = useState('');

    useEffect(() => {
        const carregarNome = async () => {
            try {
                const valor = await AsyncStorage.getItem('nomeUsuario');
                if (valor) setNome(valor);
            } catch (error) {
                console.error('Erro ao carregar nome:', error);
            }
        };
        carregarNome();
    }, []);

    const salvar = async () => {
        if (!nome.trim()) {
            console.log('Por favor, preencha seu nome.');
            return;
        }

        try {
            await AsyncStorage.setItem('nomeUsuario', nome);
            console.log('Nome salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar nome:', error);
        }
    };

    return (
        <View style={globalStyles.container}>
            <FormInput
                label="Seu nome:"
                value={nome}
                onChangeText={setNome}
                placeholder="Digite seu nome"
            />

            <TouchableOpacity style={globalStyles.button} onPress={salvar}>
                <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
        </View>
    );
}
