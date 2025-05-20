import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './MotoCardStyles.js';

/**
 * Componente MotoCard
 *
 * @param {Object} moto - Objeto da moto (placa, modelo)
 * @param {Function} onPress - Função acionada ao tocar no card
 */
export default function MotoCard({ moto, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <Text style={styles.placa}>{moto.placa}</Text>
            <Text style={styles.modelo}>{moto.modelo}</Text>
        </TouchableOpacity>
    );
}
