// File: app/AlterarSenhaScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../src/services/firebaseConfig";
import { useRouter } from "expo-router";
import { useTheme } from "../src/context/ThemeContext";
import globalStyles, { themedStyles } from "../src/styles/globalStyles";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTranslation } from "react-i18next";

export default function AlterarSenhaScreen() {
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const router = useRouter();
    const { colors } = useTheme();
    const tStyles = themedStyles(colors);

    // 🌍 i18n
    const { t, i18n } = useTranslation();
    const mudarIdioma = (lang: string) => i18n.changeLanguage(lang);

    const mapFirebaseError = (code?: string) => {
        switch (code) {
            case "auth/wrong-password":
                return t("auth.errWrongPassword");
            case "auth/too-many-requests":
                return t("auth.errTooManyRequests");
            case "auth/weak-password":
                return t("auth.errWeakPassword");
            case "auth/requires-recent-login":
                return t("auth.errRequiresRecentLogin");
            default:
                return t("auth.errChangePasswordGeneric");
        }
    };

    const handleAlterarSenha = async () => {
        setErro(null);

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            setErro(t("auth.fillAllFields"));
            return;
        }
        if (novaSenha.length < 6) {
            setErro(t("auth.errWeakPassword"));
            return;
        }
        if (novaSenha !== confirmarSenha) {
            setErro(t("auth.errPasswordsDontMatch"));
            return;
        }

        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user || !user.email) {
                setErro(t("auth.errNoUserLogged"));
                return;
            }

            const credential = EmailAuthProvider.credential(user.email, senhaAtual);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, novaSenha);

            Alert.alert(t("common.success"), t("auth.passwordChangedSuccess"));
            router.back();
        } catch (e: any) {
            const msg = mapFirebaseError(e?.code);
            setErro(msg);
            console.log("Erro ao alterar senha:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
            <View style={globalStyles.authContainer}>
                {/* Título */}
                <Text accessibilityRole="header" style={[globalStyles.title, { color: colors.text }]}>
                    {t("auth.changePassword")}
                </Text>

                {/* Senha atual */}
                <View style={globalStyles.inputContainer}>
                    <Text style={[globalStyles.inputLabel, { color: colors.text }]}>
                        {t("auth.currentPasswordLabel")}
                    </Text>
                    <TextInput
                        style={[
                            globalStyles.input,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        placeholder={t("auth.currentPasswordPlaceholder")}
                        placeholderTextColor={colors.mutedText ?? "#aaa"}
                        value={senhaAtual}
                        onChangeText={setSenhaAtual}
                        autoCapitalize="none"
                        secureTextEntry
                        returnKeyType="next"
                    />
                </View>

                {/* Nova senha */}
                <View style={globalStyles.inputContainer}>
                    <Text style={[globalStyles.inputLabel, { color: colors.text }]}>
                        {t("auth.newPasswordLabel")}
                    </Text>
                    <TextInput
                        style={[
                            globalStyles.input,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        placeholder={t("auth.newPasswordPlaceholder")}
                        placeholderTextColor={colors.mutedText ?? "#aaa"}
                        value={novaSenha}
                        onChangeText={setNovaSenha}
                        autoCapitalize="none"
                        secureTextEntry
                        returnKeyType="next"
                    />
                </View>

                {/* Confirmar nova senha */}
                <View style={globalStyles.inputContainer}>
                    <Text style={[globalStyles.inputLabel, { color: colors.text }]}>
                        {t("auth.confirmNewPasswordLabel")}
                    </Text>
                    <TextInput
                        style={[
                            globalStyles.input,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        placeholder={t("auth.confirmNewPasswordPlaceholder")}
                        placeholderTextColor={colors.mutedText ?? "#aaa"}
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                        autoCapitalize="none"
                        secureTextEntry
                        returnKeyType="done"
                        onSubmitEditing={handleAlterarSenha}
                    />
                </View>

                {/* Erro */}
                {!!erro && <Text style={tStyles.errorText}>{erro}</Text>}

                {/* Ação principal */}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("auth.changePassword")}
                    onPress={handleAlterarSenha}
                    disabled={loading}
                    style={[globalStyles.button, { opacity: loading ? 0.7 : 1 }, tStyles.btnPrimary]}
                >
                    {loading ? (
                        <ActivityIndicator />
                    ) : (
                        <Text style={[globalStyles.buttonText, tStyles.btnPrimaryText]}>
                            {t("auth.changePassword")}
                        </Text>
                    )}
                </Pressable>

                {/* Voltar */}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("common.back", "Voltar")}
                    onPress={() => router.back()}
                    style={[globalStyles.button, tStyles.btnDangerOutline, { borderColor: colors.border, borderWidth: 1 }]}
                >
                    <Text style={[globalStyles.buttonText, { color: colors.text }]}>
                        {t("common.back", "Voltar")}
                    </Text>
                </Pressable>

                {/* Botões de idioma (iguais ao index.tsx) */}
                <View style={globalStyles.rowCenter}>
                    <Pressable
                        style={[globalStyles.langButton, { backgroundColor: colors.langPtBg }]}
                        onPress={() => mudarIdioma("pt")}
                    >
                        <Text style={{ color: colors.langPtText }}>PT</Text>
                    </Pressable>

                    <Pressable
                        style={[
                            globalStyles.langButton,
                            {
                                backgroundColor: colors.langEsBg,
                                borderWidth: colors.langEsBorder ? 1 : 0,
                                borderColor: colors.langEsBorder ?? "transparent",
                            },
                        ]}
                        onPress={() => mudarIdioma("es")}
                    >
                        <Text style={{ color: colors.langEsText }}>ES</Text>
                    </Pressable>
                </View>

                {/* Rodapé — Alternar tema */}
                <View style={globalStyles.homeFooter}>
                    <ThemeToggleButton />
                </View>
            </View>
        </View>
    );
}
