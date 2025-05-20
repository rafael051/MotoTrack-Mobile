import React from 'react';
import { View, Text, TextInput } from 'react-native';
import styles from './FormInputStyles.js';

/**
 * Componente de Input reutilizável com label.
 *
 * @param {string} label - Texto que será exibido acima do input
 * @param {string} value - Valor atual do input
 * @param {function} onChangeText - Função que atualiza o valor do input
 * @param {string} placeholder - Texto de placeholder (opcional)
 */
export default function FormInput({ label, value, onChangeText, placeholder }) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                style={styles.input}
            />
        </View>
    );
}
