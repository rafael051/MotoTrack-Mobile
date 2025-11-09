// File: app/eventos/list.tsx
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    View, Text, ActivityIndicator, Alert, FlatList, Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../src/context/ThemeContext";
import globalStyles, { listStyles } from "../../src/styles/globalStyles";
import ThemeToggleButton from "../../src/components/ThemeToggleButton";
import { MotoTrack, type Evento } from "../../src/services/mototrack";
import { useTranslation } from "react-i18next";

/* ========================= util data ========================= */
const sanitize = (t?: string) => (t ?? "").replace(/[“”"']/g, "").trim();
const tryParsePt = (s: string): Date | null => {
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
    const pt = tryParsePt(raw);
    if (pt) return pt;
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

export default function EventosList() {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const router = useRouter();

    // === Idioma ===
    const lang = (i18n.language || "pt").startsWith("es") ? "es" : "pt";
    const changeLang = (code: "pt" | "es") => i18n.changeLanguage(code);

    const [itens, setItens] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const carregar = useCallback(async () => {
        setErro(null);
        setLoading(true);
        try {
            const data = await MotoTrack.getEventos();
            const withSort = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
                const aRaw = (a as any).dataHora ?? "";
                const bRaw = (b as any).dataHora ?? "";
                const aTime = asDate(aRaw)?.getTime() ?? 0;
                const bTime = asDate(bRaw)?.getTime() ?? 0;
                if (bTime !== aTime) return bTime - aTime;
                return ((b as any).id ?? 0) - ((a as any).id ?? 0);
            });
            setItens(withSort);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            const offline = message.includes("Network") || (e as any)?.name === "TypeError";
            const msg = offline ? t("common.offline") : t("common.loadFail");
            setErro(msg);
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

    const novo = () => router.push("/eventos/form");
    const editar = (id: number) =>
        router.push({ pathname: "/eventos/form", params: { id: String(id) } });

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
            await MotoTrack.deleteEvento(id);
            await carregar();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            const offline = message.includes("Network") || (e as any)?.name === "TypeError";
            const msg = offline ? t("common.offline") : t("common.deleteFail");
            Alert.alert(t("common.error"), msg);
        } finally {
            setDeletingId(null);
        }
    };

    const renderItem = ({ item }: { item: Evento }) => {
        const raw = (item as any).dataHora ?? "";
        const d = asDate(raw);
        const quando = d ? formatPt(d, true) : "—";
        const id = (item as any).id;
        const isDeleting = deletingId === id;

        return (
            <Pressable
                android_ripple={{ color: colors.ripple }}
                onPress={() => editar(id)}
                accessibilityRole="button"
                accessibilityLabel={t("eventos.list.a11yEdit", { id })}
                style={[
                    listStyles.rowItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[globalStyles.cardPlaca, { color: colors.text }]}>#{id}</Text>
                    <Text style={[globalStyles.text, { color: colors.text }]}>
                        {t("eventos.list.dataHora", { value: quando })}
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
                        <Text style={{ color: colors.text }}>
                            {isDeleting ? "..." : t("common.edit")}
                        </Text>
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
                        <Text style={{ color: "#fecaca" }}>
                            {isDeleting ? t("common.deleting") : t("common.delete")}
                        </Text>
                    </Pressable>
                </View>
            </Pressable>
        );
    };

    const keyExtractor = useCallback((i: Evento) => String((i as any).id), []);

    // ====== UI ======
    const LangButton = ({ code, label }: { code: "pt" | "es"; label: string }) => {
        const selected = lang === code;
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Idioma ${label}`}
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
                            {t("eventos.list.title")}
                        </Text>
                        <Text style={[globalStyles.text, { color: colors.mutedText }]}>
                            {t("eventos.list.subtitle")}
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
                        accessibilityLabel={t("eventos.list.a11yCreate")}
                        android_ripple={{ color: colors.ripple }}
                        style={[globalStyles.button, { backgroundColor: colors.button }]}
                        onPress={() => router.push("/eventos/form")}
                    >
                        <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                            {t("common.new")}
                        </Text>
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
