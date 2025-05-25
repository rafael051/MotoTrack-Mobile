import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../styles/globalStyles';

/**
 * Componente MotoCard
 *
 * @param {Object} moto - Objeto da moto (placa, marca, modelo, ano, renavam)
 * @param {Function} onPress - Função acionada ao tocar no card
 */
export default function MotoCard({ moto, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={globalStyles.card}>
            <Text style={globalStyles.cardPlaca}>Placa: {moto.placa}</Text>
            <Text style={globalStyles.cardModelo}>Marca: {moto.marca}</Text>
            <Text style={globalStyles.cardModelo}>Modelo: {moto.modelo}</Text>
            <Text style={globalStyles.cardModelo}>Ano: {moto.ano}</Text>
            <Text style={globalStyles.cardModelo}>Renavam: {moto.renavam}</Text>
        </TouchableOpacity>
    );
}
