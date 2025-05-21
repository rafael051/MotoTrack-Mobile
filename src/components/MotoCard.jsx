import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../styles/globalStyles';

/**
 * Componente MotoCard
 *
 * @param {Object} moto - Objeto da moto (placa, modelo)
 * @param {Function} onPress - Função acionada ao tocar no card
 */
export default function MotoCard({ moto, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={globalStyles.card}>
            <Text style={globalStyles.cardPlaca}>{moto.placa}</Text>
            <Text style={globalStyles.cardModelo}>{moto.modelo}</Text>
        </TouchableOpacity>
    );
}
