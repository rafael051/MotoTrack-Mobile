import React from 'react';
import { View, Text, TextInput } from 'react-native';
import globalStyles from '../styles/globalStyles';

const { inputContainer, inputLabel, input } = globalStyles;

/**
 * Componente de Input reutilizável com label.
 *
 * @param {string} label - Texto que será exibido acima do input
 * @param {string} value - Valor atual do input
 * @param {function} onChangeText - Função que atualiza o valor do input
 * @param {string} placeholder - Texto de placeholder (opcional)
 */
export default function FormInput({ label, value, onChangeText, placeholder, ...props }) {
    return (
        <View style={inputContainer}>
            <Text style={inputLabel}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                style={input}
                {...props}
            />
        </View>
    );
}
