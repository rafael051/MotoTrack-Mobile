// File: app/motos/list.tsx
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator, Alert, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../src/context/ThemeContext";
import globalStyles, { listStyles } from "../../src/styles/globalStyles";
import ThemeToggleButton from "../../src/components/ThemeToggleButton";
import { MotoTrack, type Moto } from "../../src/services/mototrack";

/* =========================
   🧰 Helpers
   ========================= */
const sanitize = (t?: string | null) => (t ?? "").replace(/[“”"']/g, "").trim();
const showStr = (v?: string | null) => (sanitize(v) || "—");
const showInt = (n?: number | null) => (typeof n === "number" && Number.isFinite(n) ? String(n) : "—");
const maskPlaca = (v?: string | null) => showStr(v).toUpperCase().replace(/[^A-Z0-9-]/g, "");

export default function MotosList() {
    const { colors } = useTheme();
    const router = useRouter();

    const [itens, setItens] = useState<Moto[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        setErro(null);
        setLoading(true);
        try {
            // Se tiver criado alias getMotos no service, usa; senão, buscarMotos()
            const data = (await (MotoTrack as any).getMotos?.()) ?? (await MotoTrack.buscarMotos());
            // Ordena por placa ASC (case-insensitive)
            const sorted = [...data].sort((a, b) =>
                showStr(a.placa).localeCompare(showStr(b.placa), "pt-BR", { sensitivity: "base" })
            );
            setItens(sorted);
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

    const novo = () => router.push("/motos/form");
    const editar = (id: number) =>
        router.push({ pathname: "/motos/form", params: { id: String(id) } });

    const excluir = async (id: number) => {
        const ok = await new Promise<boolean>((resolve) => {
            Alert.alert("Confirmar exclusão?", "Essa ação não poderá ser desfeita.", [
                { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
                { text: "Excluir", style: "destructive", onPress: () => resolve(true) },
            ]);
        });
        if (!ok) return;
        try {
            await MotoTrack.deleteMoto(id);
            void carregar();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Não foi possível excluir";
            Alert.alert("Erro", msg);
        }
    };

    const renderItem = ({ item }: { item: Moto }) => {
        const id = item.id;
        const placa = maskPlaca(item.placa);
        const modelo = showStr(item.modelo);
        const marca = showStr(item.marca);
        const ano = showInt(item.ano);
        const status = showStr(item.status);

        return (
            <Pressable
                android_ripple={{ color: colors.ripple }}
                onPress={() => editar(id)}
                accessibilityRole="button"
                accessibilityLabel={`Editar moto ${placa}`}
                style={[
                    listStyles.rowItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[globalStyles.cardPlaca, { color: colors.text }]} numberOfLines={1}>
                        {placa}
                    </Text>

                    <Text style={[globalStyles.text, { color: colors.text }]} numberOfLines={1}>
                        {modelo}{modelo !== "—" && marca !== "—" ? " • " : ""}{marca}
                    </Text>

                    <Text style={[globalStyles.text, { color: colors.mutedText }]} numberOfLines={1}>
                        Ano: {ano}  •  Status: {status}
                    </Text>
                </View>

                <View style={{ gap: 8 }}>
                    <Pressable
                        android_ripple={{ color: colors.ripple }}
                        onPress={() => editar(id)}
                        style={[
                            listStyles.smallBtn,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                        ]}
                    >
                        <Text style={{ color: colors.text }}>Editar</Text>
                    </Pressable>

                    <Pressable
                        android_ripple={{ color: colors.ripple }}
                        onPress={() => excluir(id)}
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

    const keyExtractor = useCallback((i: Moto) => String(i.id), []);

    return (
        <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.background }]}>
            <View>
                {/* Cabeçalho */}
                <View>
                    <Text accessibilityRole="header" style={[globalStyles.title, { color: colors.text }]}>
                        🏍️ Motos
                    </Text>
                    <Text style={[globalStyles.text, { color: colors.mutedText }]}>
                        Gerencie sua frota: placa, modelo, marca, ano e status.
                    </Text>
                </View>

                {/* Ações topo */}
                <View style={listStyles.row}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cadastrar nova moto"
                        android_ripple={{ color: colors.ripple }}
                        style={[globalStyles.button, { backgroundColor: colors.button }]}
                        onPress={novo}
                    >
                        <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>➕ Nova</Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Atualizar lista de motos"
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
                                <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>{erro}</Text>
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
                                refreshing={loading}
                                onRefresh={carregar}
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
