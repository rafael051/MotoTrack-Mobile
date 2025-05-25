import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FormInput from '../components/FormInput';
import globalStyles from '../styles/globalStyles';

export default function CadastroPatioScreen() {
    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [cep, setCep] = useState('');

    const validarCampos = () => {
        if (!nome.trim() || !endereco.trim() || !bairro.trim() || !cidade.trim() || !estado.trim() || !cep.trim()) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return false;
        }

        if (estado.length !== 2 || !/^[A-Za-z]{2}$/.test(estado)) {
            Alert.alert('Erro', 'Estado deve ter 2 letras (UF).');
            return false;
        }

        if (!/^\d{8}$/.test(cep)) {
            Alert.alert('Erro', 'CEP deve conter exatamente 8 dígitos numéricos.');
            return false;
        }

        return true;
    };

    const salvarPatio = async () => {
        if (!validarCampos()) return;

        const novoPatio = {
            nome,
            endereco,
            bairro,
            cidade,
            estado: estado.toUpperCase(),
            cep
        };

        try {
            const existentes = JSON.parse(await AsyncStorage.getItem('patios')) || [];
            existentes.push(novoPatio);
            await AsyncStorage.setItem('patios', JSON.stringify(existentes));
            console.log('Pátio salvo com sucesso!');

            // Limpar os campos
            setNome('');
            setEndereco('');
            setBairro('');
            setCidade('');
            setEstado('');
            setCep('');
        } catch (error) {
            console.error('Erro ao salvar pátio:', error);
            Alert.alert('Erro', 'Não foi possível salvar o pátio.');
        }
    };

    return (
        <View style={globalStyles.container}>
            <FormInput
                label="Nome do Pátio"
                value={nome}
                onChangeText={setNome}
                placeholder="Digite o nome do pátio"
            />
            <FormInput
                label="Endereço"
                value={endereco}
                onChangeText={setEndereco}
                placeholder="Digite o endereço"
            />
            <FormInput
                label="Bairro"
                value={bairro}
                onChangeText={setBairro}
                placeholder="Digite o bairro"
            />
            <FormInput
                label="Cidade"
                value={cidade}
                onChangeText={setCidade}
                placeholder="Digite a cidade"
            />
            <FormInput
                label="Estado (UF)"
                value={estado}
                onChangeText={(text) => setEstado(text.toUpperCase())}
                placeholder="Digite o estado"
                maxLength={2}
            />
            <FormInput
                label="CEP"
                value={cep}
                onChangeText={setCep}
                placeholder="Digite o CEP"
                keyboardType="numeric"
                maxLength={8}
            />

            <TouchableOpacity style={globalStyles.button} onPress={salvarPatio}>
                <Text style={globalStyles.buttonText}>Salvar Pátio</Text>
            </TouchableOpacity>
        </View>
    );
}
