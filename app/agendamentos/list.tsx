import React, { useCallback, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator, Alert, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../src/context/ThemeContext";
import globalStyles, { listStyles } from "../../src/styles/globalStyles";
import ThemeToggleButton from "../../src/components/ThemeToggleButton";
import { MotoTrack, type Agendamento } from "../../src/services/mototrack";

/* =========================
   🧰 Helpers de Data/Hora
   ========================= */
const sanitize = (t?: string) => (t ?? "").replace(/[“”"']/g, "").trim();

const tryParsePt = (s: string): Date | null => {
    // dd/mm/aaaa hh:mm[:ss]
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) return null;
    const [, dd, mm, yyyy, HH = "00", MI = "00", SS = "00"] = m;
    const d = new Date(+yyyy, +mm - 1, +dd, +HH, +MI, +SS);
    return isNaN(+d) ? null : d;
};

const asDate = (value?: string | Date | null): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(+value) ? null : value;

    const raw = sanitize(String(value));

    // tenta pt-BR primeiro
    const pt = tryParsePt(raw);
    if (pt) return pt;

    // tenta Date nativo (ISO com/sem offset, epoch string, etc.)
    const d = new Date(raw);
    return isNaN(+d) ? null : d;
};

const formatPt = (d: Date, showSecondsIfAny = true) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const dd = pad(d.getDate());
    const mm = pad(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    const HH = pad(d.getHours());
    const MI = pad(d.getMinutes());
    const SS = pad(d.getSeconds());
    if (showSecondsIfAny && SS !== "00") return `${dd}/${mm}/${yyyy} ${HH}:${MI}:${SS}`;
    return `${dd}/${mm}/${yyyy} ${HH}:${MI}`;
};

export default function AgendamentosList() {
    const { colors } = useTheme();
    const router = useRouter();

    const [itens, setItens] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    // ⬇️ NOVO: pull-to-refresh e controle de exclusão em andamento
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const carregar = useCallback(async () => {
        setErro(null);
        setLoading(true);
        try {
            const data = await MotoTrack.getAgendamentos();

            // ordena por data (desc), usando os helpers (tolerante a formatos)
            const withSort = [...data].sort((a, b) => {
                const aRaw = (a as any).dataHora ?? (a as any).dataAgendada ?? "";
                const bRaw = (b as any).dataHora ?? (b as any).dataAgendada ?? "";
                const aD = asDate(aRaw)?.getTime() ?? 0;
                const bD = asDate(bRaw)?.getTime() ?? 0;
                return bD - aD;
            });

            setItens(withSort);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            const offline = message.includes("Network") || (e as any)?.name === "TypeError";
            const msg = offline ? "Sem conexão. Verifique sua internet." : "Falha ao carregar";
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

    // ⬇️ NOVO: ação de pull-to-refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await carregar();
        setRefreshing(false);
    }, [carregar]);

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
            setDeletingId(id); // ⬅️ NOVO: evita duplo clique
            await MotoTrack.deleteAgendamento(id);
            await carregar();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            const offline = message.includes("Network") || (e as any)?.name === "TypeError";
            const msg = offline ? "Sem conexão. Verifique sua internet." : "Não foi possível excluir";
            Alert.alert("Erro", msg);
        } finally {
            setDeletingId(null);
        }
    };

    const renderItem = ({ item }: { item: Agendamento }) => {
        // aceita dataHora (preferido) ou dataAgendada (fallback)
        const rawData =
            (item as any).dataHora ??
            (item as any).dataAgendada ??
            "";

        const d = asDate(rawData);
        const quando = d ? formatPt(d, true) : "—";
        const motoId = (item as any).motoId ?? "—";
        const descricao = (item as any).descricao ?? "—";

        const isDeleting = deletingId === item.id;

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
                        disabled={isDeleting}
                        style={[
                            listStyles.smallBtn,
                            { backgroundColor: colors.surface, borderColor: colors.border, opacity: isDeleting ? 0.6 : 1 },
                        ]}
                    >
                        <Text style={{ color: colors.text }}>{isDeleting ? "..." : "Editar"}</Text>
                    </Pressable>

                    <Pressable
                        android_ripple={{ color: colors.ripple }}
                        onPress={() => excluir(item.id)}
                        disabled={isDeleting}
                        style={[
                            listStyles.smallBtnDanger,
                            { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder, opacity: isDeleting ? 0.6 : 1 },
                        ]}
                    >
                        <Text style={{ color: "#fecaca" }}>{isDeleting ? "Excluindo..." : "Excluir"}</Text>
                    </Pressable>
                </View>
            </Pressable>
        );
    };

    // memoiza para evitar re-render desnecessário
    const keyExtractor = useCallback((i: Agendamento) => String(i.id), []);

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
                    {/* ⬇️ NOVO: Botão Voltar */}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                        accessibilityHint="Retorna para a tela anterior"
                        android_ripple={{ color: colors.ripple }}
                        style={[
                            globalStyles.button,
                            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                        ]}
                        onPress={() => router.back()}
                    >
                        <Text style={[globalStyles.buttonText, { color: colors.text }]}>Voltar</Text>
                    </Pressable>

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
                                keyExtractor={keyExtractor}
                                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                                ListEmptyComponent={
                                    <Text style={[globalStyles.text, { color: colors.mutedText, textAlign: "center" }]}>
                                        Nenhum registro encontrado.
                                    </Text>
                                }
                                renderItem={renderItem}
                                // ⬇️ NOVO: pull-to-refresh nativo
                                refreshing={refreshing}
                                onRefresh={onRefresh}
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
