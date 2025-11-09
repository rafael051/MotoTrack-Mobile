// File: app/sobre/index.tsx
import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import globalStyles, { themedStyles } from "../../src/styles/globalStyles";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggleButton from "../../src/components/ThemeToggleButton";
import { useTranslation } from "react-i18next";

export default function SobreScreen(): JSX.Element {
    const { colors } = useTheme();
    const tStyles = themedStyles(colors);

    // 🌍 i18n
    const { t, i18n } = useTranslation();
    const mudarIdioma = (lang: string) => i18n.changeLanguage(lang);

    return (
        <ScrollView contentContainerStyle={[globalStyles.container, { backgroundColor: colors.background }]}>
            <View style={[globalStyles.authContainer, globalStyles.homeHeader]}>
                {/* Título */}
                <Text style={[globalStyles.title, { color: colors.text }]}>
                    {t("about.title", "🚀 Sobre o MotoPatio")}
                </Text>

                {/* Descrição principal */}
                <Text style={[globalStyles.text, tStyles.centeredParagraph]}>
                    {t(
                        "about.description",
                        "O MotoPatio é um aplicativo mobile desenvolvido para otimizar o mapeamento inteligente e a gestão de motocicletas em pátios de locadoras. Ele oferece cadastro completo de motos, filiais, usuários, agendamentos e eventos, com sincronização via API REST em .NET e suporte a notificações push via Expo. O app também inclui autenticação com Firebase, modo claro/escuro, internacionalização (i18n) e integração em tempo real com o sistema web MotoTrack."
                    )}
                </Text>

                {/* Seção: Desenvolvedores */}
                <View style={globalStyles.homeHeader}>
                    <Text style={[globalStyles.title, { color: colors.text }]}>
                        {t("about.devs.title", "👨‍💻 Desenvolvedores")}
                    </Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>
                        {t("about.devs.rafael", "• Rafael Rodrigues de Almeida — RM 557837")}
                    </Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>
                        {t("about.devs.lucas", "• Lucas Kenji Miyahira — RM 555368")}
                    </Text>
                </View>

                {/* Seção: Tecnologias */}
                <View style={globalStyles.homeHeader}>
                    <Text style={[globalStyles.title, { color: colors.text }]}>
                        {t("about.techs.title", "📱 Tecnologias Utilizadas")}
                    </Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>• React Native + Expo</Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>• Firebase Authentication</Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>• Expo Notifications</Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>• AsyncStorage</Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>• Axios (consumo da API .NET)</Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>• React Navigation</Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>• i18next (internacionalização)</Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>• Context API e Theme Provider</Text>
                </View>

                {/* Seção: Licença */}
                <View style={globalStyles.homeHeader}>
                    <Text style={[globalStyles.title, { color: colors.text }]}>
                        {t("about.license.title", "📄 Licença")}
                    </Text>
                    <Text style={[globalStyles.text, tStyles.centeredParagraph]}>
                        {t(
                            "about.license.text",
                            "Este aplicativo foi desenvolvido exclusivamente para fins acadêmicos, como parte da disciplina Mobile Application Development da FIAP, demonstrando o uso de tecnologias modernas em um ambiente multiplataforma."
                        )}
                    </Text>
                </View>

                {/* Botões de idioma */}
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

                {/* Alternar tema */}
                <View style={globalStyles.homeFooter}>
                    <ThemeToggleButton />
                </View>
            </View>
        </ScrollView>
    );
}
