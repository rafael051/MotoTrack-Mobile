// File: app/CadastrarScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';
import { useTheme } from '../src/context/ThemeContext';
import globalStyles from '../src/styles/globalStyles';
import ThemeToggleButton from '../src/components/ThemeToggleButton';
import { useTranslation } from 'react-i18next';

export default function CadastrarScreen() {
    // 🌍 i18n
    const { t, i18n } = useTranslation();
    const mudarIdioma = (lang: string) => i18n.changeLanguage(lang);

    // 🎨 Tema
    const { colors } = useTheme();

    // 🧭 Router
    const router = useRouter();

    // 📝 Form
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    // 🚀 Criar usuário
    const handleCadastro = () => {
        if (!nome || !email || !senha) {
            Alert.alert(t('common.attention'), t('auth.fillAllFields'));
            return;
        }

        createUserWithEmailAndPassword(auth, email, senha)
            .then(() => router.push('/HomeScreen'))
            .catch(() => Alert.alert(t('common.error'), t('auth.userNotCreated')));
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
            {/* Título */}
            <Text style={[globalStyles.title, { color: colors.text }]}>
                {t('auth.createAccount')}
            </Text>

            {/* Nome (placeholder traduzido: auth.fullName) */}
            <TextInput
                style={[
                    globalStyles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                ]}
                placeholder={t('auth.fullName')}
                placeholderTextColor={colors.mutedText ?? '#9AA0A6'}
                value={nome}
                onChangeText={setNome}
            />

            {/* E-mail (igual ao index: placeholder simples) */}
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

            {/* Senha (segue o index usando t('password')) */}
            <TextInput
                style={[
                    globalStyles.input,
                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                ]}
                placeholder={t('password')}
                placeholderTextColor={colors.mutedText ?? '#9AA0A6'}
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
            />

            {/* Botão Cadastrar */}
            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.button }]}
                onPress={handleCadastro}
                activeOpacity={0.9}
            >
                <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                    {t('auth.signUp')}
                </Text>
            </TouchableOpacity>

            {/* Botões de idioma (iguais ao index.tsx) */}
            <View style={globalStyles.rowCenter}>
                <TouchableOpacity
                    style={[globalStyles.langButton, { backgroundColor: colors.langPtBg }]}
                    onPress={() => mudarIdioma('pt')}
                >
                    <Text style={{ color: colors.langPtText }}>PT</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        globalStyles.langButton,
                        {
                            backgroundColor: colors.langEsBg,
                            borderWidth: colors.langEsBorder ? 1 : 0,
                            borderColor: colors.langEsBorder ?? 'transparent',
                        },
                    ]}
                    onPress={() => mudarIdioma('es')}
                >
                    <Text style={{ color: colors.langEsText }}>ES</Text>
                </TouchableOpacity>
            </View>

            {/* Alternar tema */}
            <ThemeToggleButton />
        </View>
    );
}
