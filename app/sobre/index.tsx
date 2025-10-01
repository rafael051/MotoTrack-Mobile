// File: app/sobre/index.tsx
import React from "react";
import { ScrollView, Text, View } from "react-native";
import globalStyles, { themedStyles } from "../../src/styles/globalStyles";
import { useTheme } from "../../src/context/ThemeContext";

export default function SobreScreen(): JSX.Element {
    const { colors } = useTheme();
    const t = themedStyles(colors);

    return (
        <ScrollView contentContainerStyle={globalStyles.container}>
            {/* Wrapper central com largura max (reaproveita seu authContainer) */}
            <View style={[globalStyles.authContainer, globalStyles.homeHeader]}>
                <Text style={globalStyles.title}>🚀 Sobre o MotoPatio</Text>

                <Text style={[globalStyles.text, t.centeredParagraph]}>
                    O MotoPatio é um aplicativo desenvolvido para realizar o mapeamento
                    inteligente e a gestão de motos em pátios. Permite o cadastro de motos,
                    a gestão de informações detalhadas, além da administração de pátios com
                    seus respectivos dados de localização.
                </Text>

                {/* Seção: Desenvolvedores */}
                <View style={globalStyles.homeHeader}>
                    <Text style={globalStyles.title}>👨‍💻 Desenvolvedores</Text>
                    <Text style={[globalStyles.text, t.centeredParagraph]}>
                        • Rafael Rodrigues de Almeida — RM 557837
                    </Text>
                    <Text style={[globalStyles.text, t.centeredParagraph]}>
                        • Lucas Kenji Miyahira — RM 555368
                    </Text>
                </View>

                {/* Seção: Tecnologias */}
                <View style={globalStyles.homeHeader}>
                    <Text style={globalStyles.title}>📱 Tecnologias Utilizadas</Text>
                    <Text style={[globalStyles.text, t.centeredParagraph]}>• React Native</Text>
                    <Text style={[globalStyles.text, t.centeredParagraph]}>• Expo</Text>
                    <Text style={[globalStyles.text, t.centeredParagraph]}>• AsyncStorage</Text>
                    <Text style={[globalStyles.text, t.centeredParagraph]}>• React Navigation</Text>
                </View>

                {/* Seção: Licença */}
                <View style={globalStyles.homeHeader}>
                    <Text style={globalStyles.title}>📄 Licença</Text>
                    <Text style={[globalStyles.text, t.centeredParagraph]}>
                        Este aplicativo foi desenvolvido exclusivamente para fins acadêmicos na
                        disciplina de Mobile Application Development.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
