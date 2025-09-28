import { Link } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword,sendPasswordResetEmail } from 'firebase/auth';
import {auth} from '../src/services/firebaseConfig'
import { useTheme } from '../src/context/ThemeContext';
import ThemeToggleButton from '../src/components/ThemeToggleButton';
import { useTranslation } from 'react-i18next';
import globalStyles from "../src/styles/globalStyles";


export default function LoginScreen() {
    // 🌍 i18n
    const { t, i18n } = useTranslation();

    const mudarIdioma = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    // 🎨 Cores do nosso ThemeContext
    const { colors } = useTheme();

    // 📧 Estados
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const router = useRouter();

    // 🔎 Verifica se já existe usuário logado
    const verificarUsuarioLogado = async () => {
        try {
            const usuarioSalvo = await AsyncStorage.getItem("@user");
            if (usuarioSalvo) {
                router.push("/HomeScreen");
            }
        } catch (error) {
            console.log("Erro ao verificar login", error);
        }
    };

    useEffect(() => {
        verificarUsuarioLogado();
    }, []);

    // 🔐 Login com Firebase
    const handleLogin = () => {
        if (!email || !senha) {
            Alert.alert("Atenção", "Preencha todos os campos!");
            return;
        }

        signInWithEmailAndPassword(auth, email, senha)
            .then(async (userCredential) => {
                const user = userCredential.user;
                await AsyncStorage.setItem("@user", JSON.stringify(user));
                router.push("/HomeScreen");
            })
            .catch((error) => {
                if (error.code === "auth/invalid-credential") {
                    Alert.alert("Atenção", "E-mail ou senha incorretos, verifique.");
                } else {
                    console.log("Erro:", error.message);
                }
            });
    };

    // 🔑 Resetar senha
    const esqueceuSenha = () => {
        if (!email) {
            Alert.alert("Atenção", "Digite o e-mail para recuperar a senha");
            return;
        }
        sendPasswordResetEmail(auth, email)
            .then(() => {
                Alert.alert("Sucesso", "E-mail de recuperação enviado");
            })
            .catch((error) => {
                console.log("Erro:", error.message);
                Alert.alert("Erro", "Não foi possível enviar o e-mail de reset");
            });
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
            <View style={globalStyles.authContainer}>
                <Text style={[globalStyles.title, { color: colors.text }]}>
                    {t("welcome")}
                </Text>

                {/* Inputs */}
                <TextInput
                    style={[
                        globalStyles.input,
                        {
                            color: colors.text,
                            borderWidth: 1,
                            borderColor: colors.border, // usa a cor de borda do tema
                        },
                    ]}
                    placeholder="E-mail"
                    placeholderTextColor={colors.mutedText}
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={[
                        globalStyles.input,
                        {
                            color: colors.text,
                            borderWidth: 1,
                            borderColor: colors.border,
                        },
                    ]}
                    placeholder={t("password")}
                    placeholderTextColor={colors.mutedText}
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                />


                {/* Botão Login */}
                <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: colors.button }]}
                    onPress={handleLogin}
                >
                    <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                        {t("login")}
                    </Text>
                </TouchableOpacity>

                {/* Botões de idioma */}
                <View style={globalStyles.rowCenter}>
                    <TouchableOpacity
                        style={[
                            globalStyles.langButton,
                            { backgroundColor: colors.langEnBg }
                        ]}
                        onPress={() => mudarIdioma("en")}
                    >
                        <Text style={{ color: colors.langEnText }}>EN</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            globalStyles.langButton,
                            { backgroundColor: colors.langPtBg }
                        ]}
                        onPress={() => mudarIdioma("pt")}
                    >
                        <Text style={{ color: colors.langPtText }}>PT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            globalStyles.langButton,
                            {
                                backgroundColor: colors.langEsBg,
                                borderWidth: colors.langEsBorder ? 1 : 0,
                                borderColor: colors.langEsBorder ?? "transparent",
                            }
                        ]}
                        onPress={() => mudarIdioma("es")}
                    >
                        <Text style={{ color: colors.langEsText }}>ES</Text>
                    </TouchableOpacity>
                </View>


                {/* Alternar tema */}
                <ThemeToggleButton />

                {/* Links */}
                <Link href="CadastrarScreen" style={[globalStyles.link, { color: colors.text }]}>
                    {t("register")}
                </Link>
                <Text
                    style={[globalStyles.forgotPassword, { color: colors.text }]}
                    onPress={esqueceuSenha}
                >
                    Esqueceu a senha?
                </Text>
            </View>
        </View>

    );
}
