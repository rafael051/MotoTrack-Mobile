import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FormInput from '../components/FormInput';
import globalStyles from '../styles/globalStyles';

export default function CadastroMotoScreen() {
    const [placa, setPlaca] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [ano, setAno] = useState('');
    const [renavam, setRenavam] = useState('');

    const salvarMoto = async () => {
        const placaRegex = /^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/;

        if (!placa.trim() || !marca.trim() || !modelo.trim() || !ano.trim() || !renavam.trim()) {
            console.log('Preencha todos os campos!');
            return;
        }

        if (!placaRegex.test(placa)) {
            console.log('Placa inválida! Use o formato ABC-1D23 ou ABC1D23.');
            return;
        }

        const novaMoto = { placa, marca, modelo, ano, renavam };

        try {
            const existentes = JSON.parse(await AsyncStorage.getItem('motos')) || [];
            existentes.push(novaMoto);
            await AsyncStorage.setItem('motos', JSON.stringify(existentes));
            console.log('Moto salva com sucesso!');
            setPlaca('');
            setMarca('');
            setModelo('');
            setAno('');
            setRenavam('');
        } catch (error) {
            console.error('Erro ao salvar moto:', error);
        }
    };

    return (
        <View style={globalStyles.container}>
            <FormInput
                label="Placa"
                value={placa}
                onChangeText={(text) => setPlaca(text.toUpperCase())}
                placeholder="Digite a placa da moto"
                maxLength={8}
            />
            <FormInput
                label="Marca"
                value={marca}
                onChangeText={setMarca}
                placeholder="Digite a marca da moto"
            />
            <FormInput
                label="Modelo"
                value={modelo}
                onChangeText={setModelo}
                placeholder="Digite o modelo da moto"
            />
            <FormInput
                label="Ano"
                value={ano}
                onChangeText={setAno}
                placeholder="Digite o ano da moto"
                keyboardType="numeric"
                maxLength={4}
            />
            <FormInput
                label="Renavam"
                value={renavam}
                onChangeText={setRenavam}
                placeholder="Digite o Renavam"
                keyboardType="numeric"
                maxLength={11}
            />

            <TouchableOpacity style={globalStyles.button} onPress={salvarMoto}>
                <Text style={globalStyles.buttonText}>Salvar</Text>
            </TouchableOpacity>
        </View>
    );
}
