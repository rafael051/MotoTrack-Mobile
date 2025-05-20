import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FormInput from '../components/FormInput.jsx';
import globalStyles from '../styles/globalStyles.js';

export default function CadastroMotoScreen() {
    const [placa, setPlaca] = useState('');
    const [modelo, setModelo] = useState('');

    const salvarMoto = async () => {
        if (!placa.trim() || !modelo.trim()) {
            console.log('Preencha todos os campos!');
            return;
        }

        const novaMoto = { placa, modelo };
        try {
            const existentes = JSON.parse(await AsyncStorage.getItem('motos')) || [];
            existentes.push(novaMoto);
            await AsyncStorage.setItem('motos', JSON.stringify(existentes));
            console.log('Moto salva com sucesso!');
            setPlaca('');
            setModelo('');
        } catch (error) {
            console.error('Erro ao salvar moto:', error);
        }
    };

    return (
        <View style={globalStyles.container}>
            <FormInput
                label="Placa"
                value={placa}
                onChangeText={setPlaca}
                placeholder="Digite a placa da moto"
            />

            <FormInput
                label="Modelo"
                value={modelo}
                onChangeText={setModelo}
                placeholder="Digite o modelo da moto"
            />

            <TouchableOpacity style={globalStyles.button} onPress={salvarMoto}>
                <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
        </View>
    );
}
