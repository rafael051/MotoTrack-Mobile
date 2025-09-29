// File: app/CadastrarScreen.tsx
// ===============================================
// 🧾 Tela de Cadastro (Criar Conta)
// - Mantém a lógica atual, apenas com COMENTÁRIOS.
// - Usa ThemeContext p/ cores, Firebase Auth p/ cadastro
// - Navega via expo-router após sucesso
// ===============================================

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';
import { useTheme } from '../src/context/ThemeContext';
import globalStyles from '../src/styles/globalStyles';
import ThemeToggleButton from '../src/components/ThemeToggleButton'; // ⬅️ ADICIONADO

export default function CadastrarScreen() {
    // 🎨 Cores do tema (light/dark) vindas do ThemeContext
    const { colors } = useTheme();

    // 🧭 Navegação declarativa (expo-router)
    const router = useRouter();

    // 📝 Estados de formulário
    const [nome, setNome]   = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    // 🚀 Ação principal: criar usuário no Firebase Auth
    const handleCadastro = () => {
        if (!nome || !email || !senha) {
            return Alert.alert('Atenção', 'Preencha todos os campos!');
        }

        createUserWithEmailAndPassword(auth, email, senha)
            .then(() => router.push('/HomeScreen'))
            .catch(() => Alert.alert('Erro', 'Usuário não cadastrado.'));
    };

    return (
        // 📦 Container base usando estilo global + cor de fundo do tema
        <View style={[globalStyles.container, { backgroundColor: colors.background }]}>



            {/* 🏷️ Título da tela com cor do tema */}
            <Text style={[globalStyles.title, { color: colors.text }]}>Criar Conta</Text>

            {/* 🧑 Nome completo */}
            <TextInput
                style={[
                    globalStyles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Nome completo"
                placeholderTextColor={colors.mutedText ?? '#9AA0A6'}
                value={nome}
                onChangeText={setNome}
            />

            {/* 📧 E-mail */}
            <TextInput
                style={[
                    globalStyles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="E-mail"
                placeholderTextColor={colors.mutedText ?? '#9AA0A6'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            {/* 🔒 Senha */}
            <TextInput
                style={[
                    globalStyles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Senha"
                placeholderTextColor={colors.mutedText ?? '#9AA0A6'}
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
            />

            {/* ✅ Botão de ação principal */}
            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.button }]}
                onPress={handleCadastro}
                activeOpacity={0.9}
            >
                <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                    Cadastrar
                </Text>
            </TouchableOpacity>

            {/* 🔘 Alternar tema */}
            <ThemeToggleButton /> {/* ⬅️ ADICIONADO */}
        </View>
    );
}
