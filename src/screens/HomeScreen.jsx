import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../styles/globalStyles.js';

export default function HomeScreen({ navigation }) {
    return (
        <View style={[globalStyles.container, { flex: 1, justifyContent: 'center', gap: 12 }]}>
            <TouchableOpacity
                style={globalStyles.button}
                onPress={() => navigation.navigate('CadastroMoto')}
            >
                <Text style={globalStyles.buttonText}>Cadastrar Moto</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={globalStyles.button}
                onPress={() => navigation.navigate('ListagemMotos')}
            >
                <Text style={globalStyles.buttonText}>Listar Motos</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={globalStyles.button}
                onPress={() => navigation.navigate('Preferencias')}
            >
                <Text style={globalStyles.buttonText}>Preferências</Text>
            </TouchableOpacity>
        </View>
    );
}
