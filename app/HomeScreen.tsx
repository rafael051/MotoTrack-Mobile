// app/home/index.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Button,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    RefreshControl,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteUser } from "firebase/auth";

import { auth } from "../src/services/firebaseConfig";
import globalStyles from "../src/styles/globalStyles";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";
import {
    MotoTrack,
    type Moto,
    type Filial,
    type Agendamento,
    type Evento,
    type Usuario,
    setApiBase,
} from "../src/services/mototrack";

// Mantém a base alinhada com o service em tempo de execução
const API_BASE = process.env.EXPO_PUBLIC_API_BASE?.trim() ?? "http://10.0.2.2:5267";
setApiBase(API_BASE);

const fmtDateTime = (s?: string) => (s ? new Date(s).toLocaleString() : "—");

export default function HomeScreen() {
    const { colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const [motos, setMotos] = useState<Moto[]>([]);
    const [filiais, setFiliais] = useState<Filial[]>([]);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    const [apiOk, setApiOk] = useState<boolean | null>(null);
    const [pinging, setPinging] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const totals = useMemo(
        () => ({
            motos: motos.length,
            filiais: filiais.length,
            agendamentos: agendamentos.length,
            eventos: eventos.length,
            usuarios: usuarios.length,
        }),
        [motos, filiais, agendamentos, eventos, usuarios]
    );

    const pingApi = useCallback(async () => {
        try {
            setPinging(true);
            const res = await fetch(`${API_BASE}/actuator/health`);
            setApiOk(res.ok);
        } catch {
            setApiOk(false);
        } finally {
            setPinging(false);
        }
    }, []);

    const carregar = useCallback(async () => {
        setErro(null);
        setLoading(true);
        try {
            const [m, f, a, e, u] = await Promise.all([
                MotoTrack.buscarMotos(),
                MotoTrack.buscarFiliais(),
                MotoTrack.buscarAgendamentos(),
                MotoTrack.buscarEventos(),
                MotoTrack.buscarUsuarios(),
            ]);
            setMotos(m);
            setFiliais(f);
            setAgendamentos(a);
            setEventos(e);
            setUsuarios(u);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Falha ao carregar dados";
            setErro(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        pingApi();
        carregar();
    }, [pingApi, carregar]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([pingApi(), carregar()]);
        setRefreshing(false);
    }, [pingApi, carregar]);

    const realizarLogoff = async () => {
        await AsyncStorage.removeItem("@user");
        router.replace("/");
    };

    const excluirConta = () => {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const user = auth.currentUser;
                            if (user) {
                                await deleteUser(user);
                                await AsyncStorage.removeItem("@user");
                                Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso.");
                                router.replace("/");
                            } else {
                                Alert.alert("Erro", "Nenhum usuário logado.");
                            }
                        } catch (error) {
                            console.log("Erro ao excluir conta", error);
                            Alert.alert("Erro", "Não foi possível excluir a conta.");
                        }
                    },
                },
            ]
        );
    };

    const lastMoto = motos.at(-1);
    const lastFilial = filiais.at(-1);
    const lastAg = agendamentos.at(-1);
    const lastEv = eventos.at(-1);
    const lastUser = usuarios.at(-1);

    return (
        <SafeAreaView
            style={[
                globalStyles.container,
                styles.container,
                { backgroundColor: colors.background },
            ]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={20}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 24 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <Text style={[globalStyles.title, { color: colors.text }]}>
                            MotoTrack
                        </Text>
                        <Text style={[globalStyles.text, { color: colors.mutedText }]}>
                            Selecione um módulo para gerenciar itens (listar, incluir, alterar, excluir).
                        </Text>
                    </View>

                    {/* Status + Ações */}
                    <View style={styles.statusRow}>
                        <Text style={[globalStyles.text, { color: colors.text }]}>
                            Status da API:
                        </Text>
                        {pinging ? (
                            <ActivityIndicator />
                        ) : (
                            <View
                                style={[
                                    styles.statusDot,
                                    {
                                        backgroundColor: apiOk ? "#22C55E" : "#EF4444",
                                        borderColor: colors.border,
                                    },
                                ]}
                            />
                        )}
                        <TouchableOpacity onPress={pingApi} style={styles.linkBtn}>
                            <Text style={[globalStyles.link, { color: colors.button }]}>
                                atualizar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={carregar} style={styles.linkBtn}>
                            <Text style={[globalStyles.link, { color: colors.button }]}>
                                recarregar dados
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cards de módulos */}
                    <View style={styles.cardsWrap}>
                        <Card
                            title="Motos"
                            count={totals.motos}
                            subtitle={
                                lastMoto
                                    ? `Última: ${lastMoto.placa ?? "—"} • ${lastMoto.modelo ?? "—"}`
                                    : undefined
                            }
                            onPress={() => router.push("/motos")}
                            colors={colors}
                        />

                        <Card
                            title="Filiais"
                            count={totals.filiais}
                            subtitle={
                                lastFilial
                                    ? `Última: ${lastFilial.nome ?? "—"} • ${lastFilial.cidade ?? "—"}`
                                    : undefined
                            }
                            onPress={() => router.push("/filiais")}
                            colors={colors}
                        />

                        <Card
                            title="Agendamentos"
                            count={totals.agendamentos}
                            subtitle={
                                lastAg
                                    ? `Último: ${fmtDateTime(lastAg.dataHora)} • ${lastAg.status ?? "—"}`
                                    : undefined
                            }
                            onPress={() => router.push("/agendamentos")} // redireciona para /agendamentos/list
                            colors={colors}
                        />

                        <Card
                            title="Eventos"
                            count={totals.eventos}
                            subtitle={
                                lastEv
                                    ? `Último: ${lastEv.tipo ?? "—"} • ${fmtDateTime(lastEv.dataHora)}`
                                    : undefined
                            }
                            onPress={() => router.push("/eventos")}
                            colors={colors}
                        />

                        <Card
                            title="Usuários"
                            count={totals.usuarios}
                            subtitle={
                                lastUser
                                    ? `Último: ${lastUser.nome ?? "—"} • ${lastUser.email ?? "—"}`
                                    : undefined
                            }
                            onPress={() => router.push("/usuarios")}
                            colors={colors}
                        />
                    </View>

                    {/* Erro */}
                    {!!erro && (
                        <Text style={[globalStyles.text, { color: "#EF4444", marginTop: 8 }]}>
                            {erro}
                        </Text>
                    )}

                    {/* Conta */}
                    <View style={{ gap: 8, marginTop: 12 }}>
                        <Text
                            style={[
                                globalStyles.text,
                                { color: colors.text, textAlign: "center" },
                            ]}
                        >
                            Você está logado.
                        </Text>
                        <Button title="Realizar logoff" onPress={realizarLogoff} />
                        <Button
                            title="Alterar Senha"
                            color="orange"
                            onPress={() => router.push("/AlterarSenhaScreen")}
                        />
                        <Button title="Excluir Conta" color="red" onPress={excluirConta} />
                    </View>

                    {/* Rodapé */}
                    <View style={styles.footer}>
                        <ThemeToggleButton />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/** ---------- Components locais ---------- */

type CardProps = {
    title: string;
    count: number;
    subtitle?: string;
    onPress: () => void;
    colors: ReturnType<typeof useTheme>["colors"];
};

function Card({ title, count, subtitle, onPress, colors }: CardProps) {
    return (
        <TouchableOpacity
            style={[
                globalStyles.card,
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Text style={[globalStyles.cardModelo, { color: colors.text }]}>{title}</Text>
            <Text style={[globalStyles.title, { color: colors.text }]}>{count}</Text>
            {!!subtitle && (
                <Text style={[globalStyles.text, { color: colors.mutedText }]}>{subtitle}</Text>
            )}
        </TouchableOpacity>
    );
}

/** ---------- Styles ---------- */
const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, gap: 12 },
    header: { marginTop: 12, gap: 4 },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
        flexWrap: "wrap",
    },
    statusDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1 },
    linkBtn: { paddingHorizontal: 4, paddingVertical: 2 },
    cardsWrap: {
        flexDirection: "row",
        gap: 12,
        marginTop: 12,
        flexWrap: "wrap",
    },
    card: { flex: 1, minWidth: 150, padding: 12, borderWidth: 1, borderRadius: 12 },
    footer: { paddingBottom: 16, alignItems: "center", marginTop: 16 },
});
