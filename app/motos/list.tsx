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
import { useTranslation } from "react-i18next";

/* ========================= utils ========================= */
const sanitize = (t?: string | null) => (t ?? "").replace(/[“”"']/g, "").trim();
const showStr = (v?: string | null) => (sanitize(v) || "—");
const showInt = (n?: number | null) => (typeof n === "number" && Number.isFinite(n) ? String(n) : "—");
const maskPlaca = (v?: string | null) => showStr(v).toUpperCase().replace(/[^A-Z0-9-]/g, "");

export default function MotosList() {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const router = useRouter();

    // Idioma
    const lang = (i18n.language || "pt").startsWith("es") ? "es" : "pt";
    const changeLang = (code: "pt" | "es") => i18n.changeLanguage(code);

    const [itens, setItens] = useState<Moto[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const carregar = useCallback(async () => {
        setErro(null);
        setLoading(true);
        try {
            const data = (await (MotoTrack as any).getMotos?.()) ?? (await (MotoTrack as any).buscarMotos?.()) ?? [];
            const sorted = [...data].sort((a, b) =>
                showStr(a.placa).localeCompare(showStr(b.placa), "pt-BR", { sensitivity: "base" })
            );
            setItens(sorted);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            const offline = message.includes("Network") || (e as any)?.name === "TypeError";
            setErro(offline ? t("common.offline") : t("common.loadFail"));
            setItens([]);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useFocusEffect(
        useCallback(() => {
            void carregar();
            return undefined;
        }, [carregar])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await carregar();
        setRefreshing(false);
    }, [carregar]);

    const novo = () => router.push("/motos/form");
    const editar = (id: number) => router.push({ pathname: "/motos/form", params: { id: String(id) } });

    const excluir = async (id: number) => {
        const ok = await new Promise<boolean>((resolve) => {
            Alert.alert(
                t("common.confirmDeleteTitle"),
                t("common.confirmDeleteMessage"),
                [
                    { text: t("common.cancel"), style: "cancel", onPress: () => resolve(false) },
                    { text: t("common.delete"), style: "destructive", onPress: () => resolve(true) },
                ]
            );
        });
        if (!ok) return;
        try {
            setDeletingId(id);
            await MotoTrack.deleteMoto(id);
            await carregar();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            const offline = message.includes("Network") || (e as any)?.name === "TypeError";
            Alert.alert(t("common.error"), offline ? t("common.offline") : t("common.deleteFail"));
        } finally {
            setDeletingId(null);
        }
    };

    const renderItem = ({ item }: { item: Moto }) => {
        const id = (item as any).id;
        const placa = maskPlaca((item as any).placa);
        const modelo = showStr((item as any).modelo);
        const marca = showStr((item as any).marca);
        const ano = showInt((item as any).ano);
        const status = showStr((item as any).status);
        const isDeleting = deletingId === id;

        return (
            <Pressable
                android_ripple={{ color: colors.ripple }}
                onPress={() => editar(id)}
                accessibilityRole="button"
                accessibilityLabel={t("motos.list.a11yEdit", { placa })}
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
                        {t("motos.list.anoStatus", { ano, status })}
                    </Text>
                </View>

                <View style={{ gap: 8 }}>
                    <Pressable
                        android_ripple={{ color: colors.ripple }}
                        onPress={() => editar(id)}
                        disabled={isDeleting}
                        style={[
                            listStyles.smallBtn,
                            { backgroundColor: colors.surface, borderColor: colors.border, opacity: isDeleting ? 0.6 : 1 },
                        ]}
                    >
                        <Text style={{ color: colors.text }}>{isDeleting ? "..." : t("common.edit")}</Text>
                    </Pressable>

                    <Pressable
                        android_ripple={{ color: colors.ripple }}
                        onPress={() => excluir(id)}
                        disabled={isDeleting}
                        style={[
                            listStyles.smallBtnDanger,
                            { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder, opacity: isDeleting ? 0.6 : 1 },
                        ]}
                    >
                        <Text style={{ color: "#fecaca" }}>{isDeleting ? t("common.deleting") : t("common.delete")}</Text>
                    </Pressable>
                </View>
            </Pressable>
        );
    };

    const keyExtractor = useCallback((i: Moto) => String((i as any).id), []);

    const LangButton = ({ code, label }: { code: "pt" | "es"; label: string }) => {
        const selected = lang === code;
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t("motos.form.a11yLang")} ${label}`}
                android_ripple={{ color: colors.ripple }}
                onPress={() => changeLang(code)}
                style={[
                    listStyles.smallBtn,
                    {
                        backgroundColor: selected ? colors.button : colors.surface,
                        borderColor: selected ? colors.button : colors.border,
                    },
                ]}
            >
                <Text style={{ color: selected ? colors.buttonText : colors.text }}>{label}</Text>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.background }]}>
            <View>
                {/* Cabeçalho + Troca de idioma */}
                <View style={[listStyles.row, { alignItems: "center" }]}>
                    <View style={{ flex: 1 }}>
                        <Text accessibilityRole="header" style={[globalStyles.title, { color: colors.text }]}>
                            {t("motos.list.title")}
                        </Text>
                        <Text style={[globalStyles.text, { color: colors.mutedText }]}>
                            {t("motos.list.subtitle")}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <LangButton code="pt" label="PT" />
                        <LangButton code="es" label="ES" />
                    </View>
                </View>

                {/* Ações topo */}
                <View style={listStyles.row}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("common.back")}
                        accessibilityHint={t("common.backHint")}
                        android_ripple={{ color: colors.ripple }}
                        style={[
                            globalStyles.button,
                            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                        ]}
                        onPress={() => router.back()}
                    >
                        <Text style={[globalStyles.buttonText, { color: colors.text }]}>{t("common.back")}</Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("motos.list.a11yCreate")}
                        android_ripple={{ color: colors.ripple }}
                        style={[globalStyles.button, { backgroundColor: colors.button }]}
                        onPress={novo}
                    >
                        <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>{t("common.new")}</Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("common.refresh")}
                        android_ripple={{ color: colors.ripple }}
                        style={[
                            globalStyles.button,
                            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                        ]}
                        onPress={carregar}
                    >
                        <Text style={[globalStyles.buttonText, { color: colors.text }]}>{t("common.refresh")}</Text>
                    </Pressable>
                </View>

                {/* Lista */}
                <View
                    style={[listStyles.cardOutlined, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    {loading ? (
                        <ActivityIndicator />
                    ) : (
                        <>
                            {!!erro && <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>{erro}</Text>}

                            <FlatList
                                data={itens}
                                keyExtractor={keyExtractor}
                                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                                ListEmptyComponent={
                                    <Text style={[globalStyles.text, { color: colors.mutedText, textAlign: "center" }]}>
                                        {t("common.noRecords")}
                                    </Text>
                                }
                                renderItem={renderItem}
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
