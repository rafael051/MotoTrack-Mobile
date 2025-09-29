// File: app/index.tsx
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import globalStyles from "../styles/globalStyles";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";

// defina EXPO_PUBLIC_API_BASE no app.config/app.json/env
const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://10.0.2.2:8080";

export default function HomeScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [apiOk, setApiOk] = useState<boolean | null>(null);
    const [loadingPing, setLoadingPing] = useState(false);

    // 🔌 Ping simples para verificar disponibilidade da API
    const pingApi = async () => {
        try {
            setLoadingPing(true);
            const res = await fetch(`${API_BASE}/actuator/health`);
            setApiOk(res.ok);
        } catch {
            setApiOk(false);
        } finally {
            setLoadingPing(false);
        }
    };

    useEffect(() => {
        pingApi();
    }, []);

    return (
        <SafeAreaView
            style={[
                globalStyles.container,
                // 🏠 estilos específicos da Home vindos do globalStyles
                globalStyles.homeContainer,
                { backgroundColor: colors.background },
            ]}
        >
            {/* Cabeçalho */}
            <View style={globalStyles.homeHeader}>
                <Text style={[globalStyles.title, { color: colors.text }]}>MotoTrack</Text>
                <Text style={[globalStyles.text, { color: colors.mutedText }]}>
                    Bem-vindo! Escolha uma ação abaixo.
                </Text>
            </View>

            {/* Status da API */}
            <View style={globalStyles.homeStatusRow}>
                <Text style={[globalStyles.text, { color: colors.text }]}>Status da API:</Text>
                {loadingPing ? (
                    <ActivityIndicator />
                ) : (
                    <View
                        style={[
                            globalStyles.homeStatusDot,
                            { backgroundColor: apiOk ? "#22C55E" : "#EF4444", borderColor: colors.border },
                        ]}
                    />
                )}
                <TouchableOpacity onPress={pingApi} style={globalStyles.homeLinkBtn}>
                    <Text style={[globalStyles.link, { color: colors.button }]}>atualizar</Text>
                </TouchableOpacity>
            </View>

            {/* Ações */}
            <View style={{ flex: 1, justifyContent: "center", gap: 12 }}>
                <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: colors.button }]}
                    onPress={() => router.push("/motos/cadastrar")}
                >
                    <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                        Cadastrar Moto
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: colors.button }]}
                    onPress={() => router.push("/motos")}
                >
                    <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                        Listar Motos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: colors.button }]}
                    onPress={() => router.push("/preferencias")}
                >
                    <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                        Preferências
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: colors.button }]}
                    onPress={() => router.push("/patios/cadastrar")}
                >
                    <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                        Cadastrar Pátio
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: colors.button }]}
                    onPress={() => router.push("/sobre")}
                >
                    <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                        Sobre
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Rodapé: toggle de tema embaixo */}
            <View style={globalStyles.homeFooter}>
                <ThemeToggleButton />
            </View>
        </SafeAreaView>
    );
}
