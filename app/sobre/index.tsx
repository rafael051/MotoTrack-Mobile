import React from "react";
import { View, Text, ScrollView } from "react-native";
import globalStyles from "../../src/styles/globalStyles";
import { useTheme } from "../../src/context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function SobreScreen(): JSX.Element {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const COMMIT_HASH = "fdc22ad"; // 🔁 Substitua pelo hash real

    return (
        <ScrollView contentContainerStyle={[globalStyles.container, { backgroundColor: colors.background }]}>
            <Text style={[globalStyles.title, { color: colors.text }]}>
                {t("about.title", "🚀 Sobre o MotoPatio")}
            </Text>
            <Text style={{ color: colors.text, marginVertical: 8 }}>
                {t("about.description", "Aplicativo desenvolvido em React Native para o gerenciamento de motos no pátio.")}
            </Text>
            <Text style={{ color: colors.text, marginTop: 20 }}>
                {t("about.commit", "Hash do Commit de Referência:")} {COMMIT_HASH}
            </Text>
        </ScrollView>
    );
}
