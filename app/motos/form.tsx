// File: app/motos/form.tsx
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    View, Text, TextInput, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, Pressable, ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import globalStyles, { formStyles, listStyles } from "../../src/styles/globalStyles";
import ThemeToggleButton from "../../src/components/ThemeToggleButton";
import { MotoTrack, type Moto } from "../../src/services/mototrack";
import { notifyCRUD } from "../../src/notifications/notificationsService";
import { useTranslation } from "react-i18next";

/* ============================================================================ */
const sanitize = (t?: string) => (t ?? "").replace(/[“”"']/g, "").trim();
/** Converte string -> int (ou undefined) */
const toInt = (v?: string) => {
    if (v == null) return undefined;
    const onlyDigits = String(v).replace(/\D/g, "");
    if (!onlyDigits) return undefined;
    const n = Number(onlyDigits);
    return Number.isFinite(n) ? n : undefined;
};
/** Exibe int em string */
const intToStr = (n?: number) => (n == null || !Number.isFinite(n) ? "" : String(n));
/** Máscara leve p/ placa (aceita Mercosul AAA0A00) */
const maskPlaca = (v?: string) => sanitize(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);

type MotoForm = {
    id?: number;
    placa: string;
    modelo?: string;
    marca?: string;
    ano?: number;
    status?: string;
};

export default function MotoFormScreen() {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEdit = !!id;
    const router = useRouter();
    const { colors } = useTheme();

    // Idioma
    const lang = (i18n.language || "pt").startsWith("es") ? "es" : "pt";
    const changeLang = (code: "pt" | "es") => i18n.changeLanguage(code);

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const [fieldErrors, setFieldErrors] = useState<{ placa?: string; ano?: string }>({});

    const [form, setForm] = useState<MotoForm>({
        placa: "",
        modelo: "",
        marca: "",
        ano: undefined,
        status: "",
    });

    const titulo = useMemo(
        () => (isEdit ? t("motos.form.titleEdit") : t("motos.form.titleNew")),
        [isEdit, t]
    );

    const carregar = async () => {
        setErro(null);
        setLoading(true);
        setFieldErrors({});
        try {
            if (!isEdit) {
                setForm({ placa: "", modelo: "", marca: "", ano: undefined, status: "" });
            } else {
                const motoId = Number(id);
                if (!Number.isFinite(motoId) || motoId <= 0) {
                    Alert.alert(t("common.attention"), t("motos.form.invalidItem"));
                    router.replace("/motos/list");
                    return;
                }
                const m = await MotoTrack.getMoto(motoId);
                setForm({
                    id: (m as any).id,
                    placa: maskPlaca((m as any).placa ?? ""),
                    modelo: ((m as any).modelo ?? "") as string,
                    marca: ((m as any).marca ?? "") as string,
                    ano: (m as any).ano ?? undefined,
                    status: ((m as any).status ?? "") as string,
                });
            }
        } catch (e: any) {
            const msg =
                e?.message?.includes("Network") || e?.name === "TypeError"
                    ? t("common.offline")
                    : (e?.message ?? t("common.loadFail"));
            setErro(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void carregar(); }, [id]);

    const validar = (): boolean => {
        const fe: typeof fieldErrors = {};
        const placa = maskPlaca(form.placa);
        if (!placa) fe.placa = t("motos.form.errPlacaRequired");
        else if (placa.length !== 7) fe.placa = t("motos.form.errPlacaLen");
        else if (!/^[A-Z0-9]{7}$/.test(placa)) fe.placa = t("motos.form.errPlacaInvalid");

        if (form.ano != null) {
            if (!Number.isInteger(form.ano)) fe.ano = t("motos.form.errAnoInt");
            else if (form.ano < 1900 || form.ano > 2100) fe.ano = t("motos.form.errAnoRange");
        }

        setFieldErrors(fe);
        if (Object.keys(fe).length) {
            Alert.alert(t("common.validation"), t("motos.form.errGeneric"));
            return false;
        }
        return true;
    };

    const salvar = async () => {
        setFieldErrors({});
        if (!validar()) return;

        setSalvando(true);
        try {
            const payload: Partial<Moto> = {
                placa: maskPlaca(form.placa),
                modelo: sanitize(form.modelo),
                marca: sanitize(form.marca),
                ano: form.ano,
                status: sanitize(form.status),
            };

            if (!isEdit) {
                const novo = await MotoTrack.createMoto(payload as any);
                await notifyCRUD("MOTO", "CREATE", t("motos.notifications.created", { id: (novo as any).id }));
                Alert.alert(t("common.success"), t("motos.form.created"));
                router.replace(`/motos/form?id=${(novo as any).id}`);
            } else {
                await MotoTrack.updateMoto(Number(id), payload as any);
                await notifyCRUD("MOTO", "UPDATE", t("motos.notifications.updated", { id }));
                Alert.alert(t("common.success"), t("motos.form.updated"));
                router.replace("/motos/list");
            }
        } catch (e: any) {
            const msg =
                e?.message?.includes("Network") || e?.name === "TypeError"
                    ? t("common.offline")
                    : (e?.message ?? t("common.saveFail"));
            Alert.alert(t("common.error"), msg);
        } finally {
            setSalvando(false);
        }
    };

    const excluir = async () => {
        if (!isEdit) return;
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
            await MotoTrack.deleteMoto(Number(id));
            await notifyCRUD("MOTO", "DELETE", t("motos.notifications.deleted", { id }));
            Alert.alert(t("common.deleted"), t("motos.form.removed"));
            router.replace("/motos/list");
        } catch (e: any) {
            const msg =
                e?.message?.includes("Network") || e?.name === "TypeError"
                    ? t("common.offline")
                    : (e?.message ?? t("common.deleteFail"));
            Alert.alert(t("common.error"), msg);
        }
    };

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
                        opacity: salvando ? 0.7 : 1,
                    },
                ]}
            >
                <Text style={{ color: selected ? colors.buttonText : colors.text }}>{label}</Text>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView>

                    {/* Título + Troca de idioma */}
                    <View style={[listStyles.row, { alignItems: "center" }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[globalStyles.title, { color: colors.text }]}>{titulo}</Text>
                            <Text style={[globalStyles.text, { color: colors.mutedText, textAlign: "left" }]}>
                                {isEdit ? t("motos.form.subtitleEdit") : t("motos.form.subtitleNew")}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <LangButton code="pt" label="PT" />
                            <LangButton code="es" label="ES" />
                        </View>
                    </View>

                    {/* Card do formulário */}
                    <View style={[formStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {loading ? (
                            <ActivityIndicator />
                        ) : (
                            <>
                                {!!erro && (
                                    <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>{erro}</Text>
                                )}

                                {/* Placa */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>{t("motos.form.placaLabel")} *</Text>
                                    <TextInput
                                        placeholder={t("motos.form.placaPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={form.placa}
                                        onChangeText={(v) => setForm((s) => ({ ...s, placa: maskPlaca(v) }))}
                                        autoCapitalize="characters"
                                        maxLength={7}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            {
                                                borderColor: fieldErrors.placa ? colors.dangerBorder : colors.border,
                                                color: colors.text,
                                                backgroundColor: colors.surface,
                                                textTransform: "uppercase",
                                            },
                                        ]}
                                    />
                                    {!!fieldErrors.placa && (
                                        <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>
                                            {fieldErrors.placa}
                                        </Text>
                                    )}
                                </View>

                                {/* Modelo */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>{t("motos.form.modeloLabel")}</Text>
                                    <TextInput
                                        placeholder={t("motos.form.modeloPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={form.modelo ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, modelo: v }))}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                </View>

                                {/* Marca */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>{t("motos.form.marcaLabel")}</Text>
                                    <TextInput
                                        placeholder={t("motos.form.marcaPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={form.marca ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, marca: v }))}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                </View>

                                {/* Ano */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>{t("motos.form.anoLabel")}</Text>
                                    <TextInput
                                        placeholder={t("motos.form.anoPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={intToStr(form.ano)}
                                        onChangeText={(v) => setForm((s) => ({ ...s, ano: toInt(v) }))}
                                        keyboardType="numeric"
                                        maxLength={4}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: fieldErrors.ano ? colors.dangerBorder : colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                    {!!fieldErrors.ano && (
                                        <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>
                                            {fieldErrors.ano}
                                        </Text>
                                    )}
                                </View>

                                {/* Status */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>{t("motos.form.statusLabel")}</Text>
                                    <TextInput
                                        placeholder={t("motos.form.statusPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={form.status ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, status: v }))}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                </View>

                                {/* Ações */}
                                <View style={listStyles.row}>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={isEdit ? t("motos.form.a11yUpdate") : t("motos.form.a11ySave")}
                                        accessibilityHint={t("motos.form.a11yHintSubmit")}
                                        android_ripple={{ color: colors.ripple }}
                                        disabled={salvando}
                                        style={[globalStyles.button, { backgroundColor: colors.button }]}
                                        onPress={salvar}
                                    >
                                        <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                                            {salvando ? t("common.saving") : (isEdit ? t("common.update") : t("common.save"))}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={t("common.back")}
                                        android_ripple={{ color: colors.ripple }}
                                        style={[globalStyles.button, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                                        onPress={() => router.back()}
                                    >
                                        <Text style={[globalStyles.buttonText, { color: colors.text }]}>{t("common.back")}</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Excluir (somente no modo edição) */}
                    {isEdit && (
                        <View style={[formStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[globalStyles.text, { color: colors.text }]}>{t("motos.form.actionsTitle")}</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("motos.form.a11yDelete")}
                                accessibilityHint={t("motos.form.a11yDeleteHint")}
                                android_ripple={{ color: colors.ripple }}
                                onPress={excluir}
                                style={[formStyles.dangerBtn, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
                            >
                                <Text style={[globalStyles.buttonText, { color: "#fecaca" }]}>{t("common.delete")}</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Rodapé - Alternar tema */}
                    <View style={globalStyles.homeFooter}>
                        <ThemeToggleButton />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
