import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator, Alert, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../src/context/ThemeContext";
import globalStyles, { listStyles } from "../../src/styles/globalStyles";
import ThemeToggleButton from "../../src/components/ThemeToggleButton";
import { MotoTrack, type Agendamento } from "../../src/services/mototrack";

export default function AgendamentosList() {
    const { colors } = useTheme();
    const router = useRouter();

    const [itens, setItens] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        setErro(null);
        setLoading(true);
        try {
            const data = await MotoTrack.getAgendamentos();
            setItens(data);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Falha ao carregar";
            setErro(msg);
            setItens([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            void carregar();
            return undefined;
        }, [carregar])
    );

    const novo = () => router.push("/agendamentos/form");
    const editar = (id: number) =>
        router.push({ pathname: "/agendamentos/form", params: { id: String(id) } });

    const excluir = async (id: number) => {
        const ok = await new Promise<boolean>((resolve) => {
            Alert.alert("Confirmar exclusão?", "Essa ação não poderá ser desfeita.", [
                { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
                { text: "Excluir", style: "destructive", onPress: () => resolve(true) },
            ]);
        });
        if (!ok) return;
        try {
            await MotoTrack.deleteAgendamento(id);
            carregar();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Não foi possível excluir";
            Alert.alert("Erro", msg);
        }
    };

    const renderItem = ({ item }: { item: Agendamento }) => {
        const dt = new Date(item.dataHora);
        const dd = String(dt.getDate()).padStart(2, "0");
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const yy = dt.getFullYear();
        const hh = String(dt.getHours()).padStart(2, "0");
        const mi = String(dt.getMinutes()).padStart(2, "0");
        const quando = isNaN(+dt) ? "—" : `${dd}/${mm}/${yy} ${hh}:${mi}`;
        const motoId = (item as any).motoId ?? "—";
        const descricao = (item as any).descricao ?? "—";

        return (
            <Pressable
                android_ripple={{ color: colors.ripple }}
                onPress={() => editar(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Editar agendamento ${item.id}`}
                style={[
                    listStyles.rowItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[globalStyles.cardPlaca, { color: colors.text }]}>#{item.id}</Text>
                    <Text style={[globalStyles.text, { color: colors.text }]}>Data/Hora: {quando}</Text>
                    <Text style={[globalStyles.text, { color: colors.mutedText }]}>Moto ID: {motoId}</Text>
                    <Text style={[globalStyles.text, { color: colors.mutedText }]} numberOfLines={2}>
                        {descricao}
                    </Text>
                </View>

                <View style={{ gap: 8 }}>
                    <Pressable
                        android_ripple={{ color: colors.ripple }}
                        onPress={() => editar(item.id)}
                        style={[
                            listStyles.smallBtn,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                        ]}
                    >
                        <Text style={{ color: colors.text }}>Editar</Text>
                    </Pressable>

                    <Pressable
                        android_ripple={{ color: colors.ripple }}
                        onPress={() => excluir(item.id)}
                        style={[
                            listStyles.smallBtnDanger,
                            { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder },
                        ]}
                    >
                        <Text style={{ color: "#fecaca" }}>Excluir</Text>
                    </Pressable>
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.background }]}>
            <View>
                {/* Cabeçalho */}
                <View>
                    <Text accessibilityRole="header" style={[globalStyles.title, { color: colors.text }]}>
                        📅 Agendamentos
                    </Text>
                    <Text style={[globalStyles.text, { color: colors.mutedText }]}>
                        Gerencie seus agendamentos.
                    </Text>
                </View>

                {/* Ações topo */}
                <View style={listStyles.row}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Criar novo agendamento"
                        android_ripple={{ color: colors.ripple }}
                        style={[globalStyles.button, { backgroundColor: colors.button }]}
                        onPress={novo}
                    >
                        <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>➕ Novo</Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Atualizar lista de agendamentos"
                        android_ripple={{ color: colors.ripple }}
                        style={[
                            globalStyles.button,
                            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                        ]}
                        onPress={carregar}
                    >
                        <Text style={[globalStyles.buttonText, { color: colors.text }]}>Atualizar</Text>
                    </Pressable>
                </View>

                {/* Lista */}
                <View
                    style={[
                        listStyles.cardOutlined,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator />
                    ) : (
                        <>
                            {!!erro && (
                                <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>
                                    {erro}
                                </Text>
                            )}

                            <FlatList
                                data={itens}
                                keyExtractor={(i) => String(i.id)}
                                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                                ListEmptyComponent={
                                    <Text style={[globalStyles.text, { color: colors.mutedText, textAlign: "center" }]}>
                                        Nenhum registro encontrado.
                                    </Text>
                                }
                                renderItem={renderItem}
                            />
                        </>
                    )}
                </View>

                {/* Rodapé – Alternar tema */}
                <View style={globalStyles.homeFooter}>
                    <ThemeToggleButton />
                </View>
            </View>
        </SafeAreaView>
    );
}
