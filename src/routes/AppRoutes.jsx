import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CadastroMotoScreen from '../screens/CadastroMotoScreen';
import ListagemMotosScreen from '../screens/ListagemMotosScreen';
import DetalheMotoScreen from '../screens/DetalheMotoScreen';
import PreferenciasScreen from '../screens/PreferenciasScreen';

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: '🏠 MotoPatio' }}
                />
                <Stack.Screen
                    name="CadastroMoto"
                    component={CadastroMotoScreen}
                    options={{ title: '➕ Cadastrar Moto' }}
                />
                <Stack.Screen
                    name="ListagemMotos"
                    component={ListagemMotosScreen}
                    options={{ title: '📋 Lista de Motos' }}
                />
                <Stack.Screen
                    name="DetalheMoto"
                    component={DetalheMotoScreen}
                    options={{ title: '🔍 Detalhes da Moto' }}
                />
                <Stack.Screen
                    name="Preferencias"
                    component={PreferenciasScreen}
                    options={{ title: '⚙️ Preferências' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
