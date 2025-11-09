// File: app/eventos/form.tsx
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
import { MotoTrack, type Evento } from "../../src/services/mototrack";
import { notifyCRUD } from "../../src/notifications/notificationsService";
import { useTranslation } from "react-i18next";

/* ============================================================================ */
const sanitize = (t?: string) => (t ?? "").replace(/[“”"']/g, "").trim();
/** Máscara SUAVE: insere separadores sem completar zeros */
const maskDateTime = (t: string) => {
    const d = sanitize(t).replace(/\D/g, "").slice(0, 14); // dd mm aaaa hh mm ss
    let out = d.slice(0, 2);
    if (d.length >= 3) out += "/" + d.slice(2, 4);
    if (d.length >= 5) out += "/" + d.slice(4, 8);
    if (d.length >= 9) out += " " + d.slice(8, 10);
    if (d.length >= 11) out += ":" + d.slice(10, 12);
    if (d.length >= 13) out += ":" + d.slice(12, 14);
    return out;
};
/** Normaliza ao sair do campo: dd/MM/yyyy HH:mm:ss (ss=00 se faltar) */
const normalizePtDateTime = (t: string) => {
    const d = sanitize(t).replace(/\D/g, "");
    if (d.length < 12) return "";
    const pad2 = (v: string) => v.padStart(2, "0");
    const pad4 = (v: string) => v.padStart(4, "0");
    const dd = pad2(d.slice(0, 2));
    const mm = pad2(d.slice(2, 4));
    const yyyy = pad4(d.slice(4, 8));
    const HH = pad2(d.slice(8, 10));
    const MI = pad2(d.slice(10, 12));
    const SS = pad2(d.slice(12, 14) || "00");
    return `${dd}/${mm}/${yyyy} ${HH}:${MI}:${SS}`;
};
/** Parse "dd/MM/yyyy HH:mm[:ss]" -> Date (local) */
const parsePtToDate = (input?: string): Date | null => {
    const s = sanitize(input ?? "");
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    const [, dd, mm, yyyy, HH, MI, SS = "00"] = m;
    const dt = new Date(+yyyy, +mm - 1, +dd, +HH, +MI, +SS);
    return isNaN(+dt) ? null : dt;
};

export default function EventoForm() {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEdit = !!id;
    const router = useRouter();
    const { colors } = useTheme();

    // === Idioma ===
    const lang = (i18n.language || "pt").startsWith("es") ? "es" : "pt";
    const changeLang = (code: "pt" | "es") => i18n.changeLanguage(code);

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const [fieldErrors, setFieldErrors] = useState<{
        data?: string; motoId?: string; tipo?: string; motivo?: string;
    }>({});

    const [form, setForm] = useState<Partial<Evento & {
        motoId?: number; tipo?: string; motivo?: string; localizacao?: string | null; dataHora?: string;
    }>>({
        dataHora: "",
        motoId: undefined,
        tipo: "",
        motivo: "",
        localizacao: "",
    });

    const [dataHoraText, setDataHoraText] = useState<string>("");

    const titulo = useMemo(
        () => (isEdit ? t("eventos.form.titleEdit") : t("eventos.form.titleNew")),
        [isEdit, t]
    );

    const carregar = async () => {
        setErro(null); setLoading(true);
        setFieldErrors({});
        try {
            if (!isEdit) {
                setForm({ dataHora: "", motoId: undefined, tipo: "", motivo: "", localizacao: "" });
                setDataHoraText("");
            } else {
                const _id = Number(id);
                if (!Number.isFinite(_id) || _id <= 0) {
                    Alert.alert(t("common.attention"), t("eventos.form.invalidEvent"));
                    router.replace("/eventos/list");
                    return;
                }
                const found = await MotoTrack.getEvento(_id);
                setForm({
                    id: (found as any).id,
                    dataHora: (found as any).dataHora,
                    motoId: (found as any).motoId,
                    tipo: (found as any).tipo,
                    motivo: (found as any).motivo,
                    localizacao: (found as any).localizacao,
                });
                setDataHoraText((found as any).dataHora ?? "");
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

    useEffect(() => { carregar(); }, [id]);

    useEffect(() => {
        if (loading) return;
        setDataHoraText(form?.dataHora ?? "");
    }, [loading, form?.dataHora]);

    const salvar = async () => {
        setFieldErrors({});
        const normalized = normalizePtDateTime(dataHoraText);
        if (!normalized) {
            setFieldErrors((e) => ({ ...e, data: t("eventos.form.errDateRequired") }));
            Alert.alert(t("common.validation"), t("eventos.form.errDateRequired"));
            return;
        }
        const parsed = parsePtToDate(normalized);
        if (!parsed) {
            setFieldErrors((e) => ({ ...e, data: t("eventos.form.errDateInvalid") }));
            Alert.alert(t("common.validation"), t("eventos.form.errDateInvalid"));
            return;
        }
        if (!form.motoId) {
            setFieldErrors((e) => ({ ...e, motoId: t("eventos.form.errMotoRequired") }));
            Alert.alert(t("common.validation"), t("eventos.form.errMotoRequired"));
            return;
        }
        const tipo = sanitize(form.tipo ?? "");
        if (!tipo) {
            setFieldErrors((e) => ({ ...e, tipo: t("eventos.form.errTipoRequired") }));
            Alert.alert(t("common.validation"), t("eventos.form.errTipoRequired"));
            return;
        }
        const motivo = sanitize(form.motivo ?? "");
        if (!motivo || motivo.length < 3) {
            setFieldErrors((e) => ({ ...e, motivo: t("eventos.form.errMotivoMin") }));
            Alert.alert(t("common.validation"), t("eventos.form.errMotivoMin"));
            return;
        }

        setSalvando(true);
        try {
            const payload = {
                dataHora: normalized,
                motoId: Number(form.motoId),
                tipo,
                motivo,
                localizacao: sanitize(form.localizacao ?? ""),
            } as any;

            if (!isEdit) {
                const novo = await MotoTrack.createEvento(payload);
                await notifyCRUD("EVENTO", "CREATE", t("eventos.notifications.created", { id: (novo as any).id }));
                Alert.alert(t("common.success"), t("eventos.form.created"));
                router.replace(`/eventos/form?id=${(novo as any).id}`);
            } else {
                await MotoTrack.updateEvento(Number(id), payload);
                await notifyCRUD("EVENTO", "UPDATE", t("eventos.notifications.updated", { id }));
                Alert.alert(t("common.success"), t("eventos.form.updated"));
                router.replace("/eventos/list");
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
            await MotoTrack.deleteEvento(Number(id));
            await notifyCRUD("EVENTO", "DELETE", t("eventos.notifications.deleted", { id }));
            Alert.alert(t("common.deleted"), t("eventos.form.removed"));
            router.replace("/eventos/list");
        } catch (e: any) {
            const msg =
                e?.message?.includes("Network") || e?.name === "TypeError"
                    ? t("common.offline")
                    : (e?.message ?? t("common.deleteFail"));
            Alert.alert(t("common.error"), msg);
        }
    };

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

                    {/* Título + Troca de Idioma */}
                    <View style={[listStyles.row, { alignItems: "center" }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[globalStyles.title, { color: colors.text }]}>{titulo}</Text>
                            <Text style={[globalStyles.text, { color: colors.mutedText, textAlign: "left" }]}>
                                {isEdit ? t("eventos.form.subtitleEdit") : t("eventos.form.subtitleNew")}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <LangButton code="pt" label="PT" />
                            <LangButton code="es" label="ES" />
                        </View>
                    </View>

                    <View style={[formStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {loading ? (
                            <ActivityIndicator />
                        ) : (
                            <>
                                {!!erro && (
                                    <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>{erro}</Text>
                                )}

                                {/* Data/Hora */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>
                                        {t("eventos.form.dataHoraLabel")}
                                    </Text>
                                    <TextInput
                                        placeholder={t("eventos.form.dataHoraPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={dataHoraText}
                                        onChangeText={(v) => setDataHoraText(maskDateTime(v))}
                                        onBlur={() => {
                                            const normalized = normalizePtDateTime(dataHoraText);
                                            if (!normalized) {
                                                setDataHoraText("");
                                                setForm((s) => ({ ...s, dataHora: "" }));
                                                return;
                                            }
                                            const d = parsePtToDate(normalized);
                                            if (!d) return;
                                            setForm((s) => ({ ...s, dataHora: normalized }));
                                            setDataHoraText(normalized);
                                        }}
                                        inputMode="numeric"
                                        maxLength={19}
                                        autoCorrect={false}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: fieldErrors.data ? colors.dangerBorder : colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                    {!!fieldErrors.data && (
                                        <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>
                                            {fieldErrors.data}
                                        </Text>
                                    )}
                                </View>

                                {/* Moto ID */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>
                                        {t("eventos.form.motoIdLabel")}
                                    </Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        placeholder={t("eventos.form.motoIdPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={form.motoId ? String(form.motoId) : ""}
                                        onChangeText={(v) => {
                                            const n = Number(v.replace(/\D/g, ""));
                                            setForm((s) => ({ ...s, motoId: Number.isFinite(n) && n > 0 ? n : undefined }));
                                        }}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: fieldErrors.motoId ? colors.dangerBorder : colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                    {!!fieldErrors.motoId && (
                                        <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>
                                            {fieldErrors.motoId}
                                        </Text>
                                    )}
                                </View>

                                {/* Tipo */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>
                                        {t("eventos.form.tipoLabel")}
                                    </Text>
                                    <TextInput
                                        placeholder={t("eventos.form.tipoPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={form.tipo ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, tipo: v }))}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: fieldErrors.tipo ? colors.dangerBorder : colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                    {!!fieldErrors.tipo && (
                                        <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>
                                            {fieldErrors.tipo}
                                        </Text>
                                    )}
                                </View>

                                {/* Motivo */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>
                                        {t("eventos.form.motivoLabel")}
                                    </Text>
                                    <TextInput
                                        placeholder={t("eventos.form.motivoPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={form.motivo ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, motivo: v }))}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: fieldErrors.motivo ? colors.dangerBorder : colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                        multiline
                                    />
                                    {!!fieldErrors.motivo && (
                                        <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>
                                            {fieldErrors.motivo}
                                        </Text>
                                    )}
                                </View>

                                {/* Localização */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>
                                        {t("eventos.form.localizacaoLabel")}
                                    </Text>
                                    <TextInput
                                        placeholder={t("eventos.form.localizacaoPlaceholder")}
                                        placeholderTextColor={colors.mutedText}
                                        value={form.localizacao ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, localizacao: v }))}
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
                                        accessibilityLabel={isEdit ? t("eventos.form.a11yUpdate") : t("eventos.form.a11ySave")}
                                        accessibilityHint={t("eventos.form.a11yHintSubmit")}
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
                                        style={[
                                            globalStyles.button,
                                            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                                        ]}
                                        onPress={() => router.back()}
                                    >
                                        <Text style={[globalStyles.buttonText, { color: colors.text }]}>{t("common.back")}</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Ações extras (excluir) */}
                    {isEdit && (
                        <View style={[formStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[globalStyles.text, { color: colors.text }]}>{t("eventos.form.actionsTitle")}</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("eventos.form.a11yDelete")}
                                accessibilityHint={t("eventos.form.a11yDeleteHint")}
                                android_ripple={{ color: colors.ripple }}
                                onPress={excluir}
                                style={[formStyles.dangerBtn, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
                            >
                                <Text style={[globalStyles.buttonText, { color: "#fecaca" }]}>{t("common.delete")}</Text>
                            </Pressable>
                        </View>
                    )}

                    <View style={globalStyles.homeFooter}>
                        <ThemeToggleButton />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
