// app/LoginScreen.tsx
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';
import { useTheme } from '../src/context/ThemeContext';
import ThemeToggleButton from '../src/components/ThemeToggleButton';
import { useTranslation } from 'react-i18next';

// estilos globais
import globalStyles, { tokens } from '../src/globalStyles';

export default function LoginScreen() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    // Redireciona se já estiver logado (Firebase persiste sessão)
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) router.replace('/HomeScreen');
        });
        return () => unsub();
    }, [router]);

    const placeholderColor = useMemo(
        () => colors.muted ?? '#9aa0a6',
        [colors.muted]
    );

    const isEmailValido = (value: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    const mapFirebaseError = (code?: string) => {
        switch (code) {
            case 'auth/invalid-credential':
            case 'auth/invalid-email':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return t('auth.invalidCredentials', 'E-mail ou senha inválidos.');
            case 'auth/too-many-requests':
                return t('auth.tooManyRequests', 'Muitas tentativas. Tente mais tarde.');
            case 'auth/network-request-failed':
                return t('auth.network', 'Falha de rede. Verifique sua conexão.');
            default:
                return t('auth.generic', 'Ocorreu um erro ao entrar.');
        }
    };

    const handleLogin = async () => {
        const emailTrim = email.trim();
        const senhaTrim = senha.trim();

        if (!emailTrim || !senhaTrim) {
            Alert.alert(t('common.attention', 'Atenção'), t('auth.fillAll', 'Preencha todos os campos!'));
            return;
        }
        if (!isEmailValido(emailTrim)) {
            Alert.alert(t('common.attention', 'Atenção'), t('auth.invalidEmail', 'E-mail inválido.'));
            return;
        }

        try {
            setLoading(true);
            Keyboard.dismiss();
            await signInWithEmailAndPassword(auth, emailTrim, senhaTrim);
            // redireciona via onAuthStateChanged
        } catch (error: any) {
            const msg = mapFirebaseError(error?.code);
            Alert.alert(t('common.attention', 'Atenção'), msg);
            console.log('[Login] error', error?.code, error?.message);
        } finally {
            setLoading(false);
        }
    };

    const esqueceuSenha = async () => {
        const emailTrim = email.trim();
        if (!emailTrim) {
            Alert.alert(t('common.attention', 'Atenção'), t('auth.typeEmail', 'Digite o e-mail para recuperar a senha.'));
            return;
        }
        if (!isEmailValido(emailTrim)) {
            Alert.alert(t('common.attention', 'Atenção'), t('auth.invalidEmail', 'E-mail inválido.'));
            return;
        }

        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, emailTrim);
            Alert.alert(t('common.ready', 'Pronto!'), t('auth.resetSent', 'Email de recuperação enviado.'));
        } catch (error: any) {
            console.log('[Reset] error', error?.code, error?.message);
            Alert.alert(t('common.attention', 'Atenção'), t('auth.resetFail', 'Erro ao enviar e-mail de reset de senha.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View
            style={[
                globalStyles.container,
                { backgroundColor: colors.background, justifyContent: 'center' },
            ]}
        >
            <Text style={[globalStyles.title, { color: colors.text, textAlign: 'center', marginBottom: 30 }]}>
                {t('welcome', 'Seja bem-vindo')}
            </Text>

            {/* Email */}
            <View style={globalStyles.inputContainer}>
                <Text style={[globalStyles.inputLabel, { color: colors.text }]}>{t('login', 'Realizar o login')}</Text>
                <TextInput
                    style={[
                        globalStyles.input,
                        {
                            color: colors.text,
                            borderColor: colors.border ?? tokens.colors.border,
                            backgroundColor: colors.surface ?? tokens.colors.card,
                        },
                    ]}
                    placeholder="E-mail"
                    placeholderTextColor={placeholderColor}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="next"
                />
            </View>

            {/* Senha */}
            <View style={globalStyles.inputContainer}>
                <Text style={[globalStyles.inputLabel, { color: colors.text }]}>{t('password', 'Senha')}</Text>
                <TextInput
                    style={[
                        globalStyles.input,
                        {
                            color: colors.text,
                            borderColor: colors.border ?? tokens.colors.border,
                            backgroundColor: colors.surface ?? tokens.colors.card,
                        },
                    ]}
                    placeholder={t('password', 'Senha')}
                    placeholderTextColor={placeholderColor}
                    secureTextEntry
                    textContentType="password"
                    value={senha}
                    onChangeText={setSenha}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                />
            </View>

            {/* Botão Login */}
            <TouchableOpacity
                style={[
                    globalStyles.button,
                    { backgroundColor: colors.primary ?? tokens.colors.primary, opacity: loading ? 0.7 : 1 },
                ]}
                onPress={handleLogin}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={t('login', 'Realizar o login')}
            >
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <Text style={globalStyles.buttonText}>{t('login', 'Realizar o login')}</Text>
                )}
            </TouchableOpacity>

            <ThemeToggleButton />

            {/* Cadastro */}
            <Link
                href="/CadastrarScreen"
                style={{ marginTop: 20, color: colors.text, alignSelf: 'center' }}
                accessibilityRole="link"
            >
                {t('register', 'Cadastre-se')}
            </Link>

            {/* Esqueci a senha */}
            <Text
                style={{ marginTop: 20, color: colors.text, alignSelf: 'center' }}
                onPress={esqueceuSenha}
                accessibilityRole="button"
            >
                {t('auth.forgotPassword', 'Esqueci a senha')}
            </Text>
        </View>
    );
}
