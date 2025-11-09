// File: app/agendamentos/form.tsx
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
import { MotoTrack, type Agendamento } from "../../src/services/mototrack";
import { notifyCRUD, scheduleReminder } from "../../src/notifications/notificationsService";
import { useTranslation } from "react-i18next";

/* ============================================================================
   🕒 Data/Hora (PT-BR) — máscara suave + normalização no blur
   ============================================================================ */
const sanitize = (t: string) => (t ?? "").replace(/[“”"']/g, "").trim();

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

const parsePtToDate = (input?: string): Date | null => {
    const s = sanitize(input ?? "");
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    const [, dd, mm, yyyy, HH, MI, SS = "00"] = m;
    const dt = new Date(+yyyy, +mm - 1, +dd, +HH, +MI, +SS);
    return isNaN(+dt) ? null : dt;
};

export default function AgendamentoForm() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEdit = !!id;
    const router = useRouter();
    const { colors } = useTheme();

    // 🌍 i18n
    const { t, i18n } = useTranslation();
    const mudarIdioma = (lang: string) => i18n.changeLanguage(lang);

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ data?: string; motoId?: string; descricao?: string }>({});

    const [form, setForm] = useState<Partial<Agendamento & {
        motoId?: number; descricao?: string; dataAgendada?: string;
    }>>({
        dataAgendada: "",
        motoId: undefined,
        descricao: "",
    });

    const [dataHoraText, setDataHoraText] = useState<string>("");

    const titulo = useMemo(
        () => (isEdit ? t("sched.form.editTitle", "✏️ Editar Agendamento") : t("sched.form.newTitle", "📅 Novo Agendamento")),
        [isEdit, t]
    );

    const isFutureDate = (d: Date) => d.getTime() > Date.now();

    const carregar = async () => {
        setErro(null); setLoading(true);
        setFieldErrors({});
        try {
            if (!isEdit) {
                setForm({ dataAgendada: "", motoId: undefined, descricao: "" });
                setDataHoraText("");
            } else {
                const _id = Number(id);
                if (!Number.isFinite(_id) || _id <= 0) {
                    Alert.alert(t("common.attention", "Atenção"), t("sched.form.invalidId", "Agendamento inválido."));
                    router.replace("/agendamentos/list");
                    return;
                }
                const found = await MotoTrack.getAgendamento(_id);
                setForm({
                    id: (found as any).id,
                    dataAgendada: (found as any).dataAgendada,
                    motoId: (found as any).motoId,
                    descricao: (found as any).descricao,
                });
                setDataHoraText((found as any).dataAgendada ?? "");
            }
        } catch (e: any) {
            const msg =
                e?.message?.includes("Network") || e?.name === "TypeError"
                    ? t("common.networkDown", "Sem conexão. Verifique sua internet.")
                    : (e?.message ?? t("common.loadFail", "Falha ao carregar"));
            setErro(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregar(); }, [id]);

    useEffect(() => {
        if (loading) return;
        setDataHoraText(form?.dataAgendada ?? "");
    }, [loading, form?.dataAgendada]);

    const salvar = async () => {
        setFieldErrors({});

        const normalized = normalizePtDateTime(dataHoraText);
        if (!normalized) {
            setFieldErrors((e) => ({ ...e, data: t("sched.validation.fullDate", "Informe Data/Hora completa (dd/mm/aaaa hh:mm).") }));
            Alert.alert(t("common.validation", "Validação"), t("sched.validation.fullDate", "Informe Data/Hora completa (dd/mm/aaaa hh:mm)."));
            return;
        }
        const parsed = parsePtToDate(normalized);
        if (!parsed) {
            setFieldErrors((e) => ({ ...e, data: t("sched.validation.invalidDate", "Data/Hora inválida.") }));
            Alert.alert(t("common.validation", "Validação"), t("sched.validation.invalidDate", "Data/Hora inválida."));
            return;
        }
        if (!isFutureDate(parsed)) {
            setFieldErrors((e) => ({ ...e, data: t("sched.validation.futureDate", "Data/Hora deve ser futura.") }));
            Alert.alert(t("common.validation", "Validação"), t("sched.validation.futureDate", "Data/Hora deve ser futura."));
            return;
        }

        if (!form.motoId) {
            setFieldErrors((e) => ({ ...e, motoId: t("sched.validation.motoRequired", "Informe o ID da moto.") }));
            Alert.alert(t("common.validation", "Validação"), t("sched.validation.motoRequired", "Informe o ID da moto."));
            return;
        }

        const desc = sanitize(form.descricao ?? "");
        if (!desc || desc.length < 5) {
            setFieldErrors((e) => ({ ...e, descricao: t("sched.validation.descMin", "Descrição deve ter ao menos 5 caracteres.") }));
            Alert.alert(t("common.validation", "Validação"), t("sched.validation.descMin", "Informe a descrição"));
            return;
        }

        setSalvando(true);
        try {
            const payload = {
                dataAgendada: normalized,
                motoId: Number(form.motoId),
                descricao: desc,
            } as any;

            if (!isEdit) {
                const novo = await MotoTrack.createAgendamento(payload);

                await notifyCRUD("AGENDAMENTO", "CREATE", t("sched.notify.created", "Agendamento #{id} criado.").replace("{id}", String((novo as any).id)));

                const d = parsePtToDate(normalized);
                if (d) {
                    await scheduleReminder(
                        "agendamento",
                        (novo as any).id,
                        d,
                        10,
                        t("home.reminderTitle", "Lembrete de Agendamento"),
                        t("sched.reminderAt", "Agendamento #{id} às {time}.")
                            .replace("{id}", String((novo as any).id))
                            .replace("{time}", d.toLocaleString())
                    );
                }

                Alert.alert(t("common.success", "Sucesso"), t("sched.form.created", "Agendamento criado."));
                router.replace(`/agendamentos/form?id=${(novo as any).id}`);
            } else {
                await MotoTrack.updateAgendamento(Number(id), payload);

                await notifyCRUD("AGENDAMENTO", "UPDATE", t("sched.notify.updated", "Agendamento #{id} atualizado.").replace("{id}", String(id)));

                const d = parsePtToDate(normalized);
                if (d) {
                    await scheduleReminder(
                        "agendamento",
                        Number(id),
                        d,
                        10,
                        t("home.reminderTitle", "Lembrete de Agendamento"),
                        t("sched.reminderAt", "Agendamento #{id} às {time}.")
                            .replace("{id}", String(id))
                            .replace("{time}", d.toLocaleString())
                    );
                }

                Alert.alert(t("common.success", "Sucesso"), t("sched.form.updated", "Agendamento atualizado."));
                router.replace("/agendamentos/list");
            }
        } catch (e: any) {
            const msg =
                e?.message?.includes("Network") || e?.name === "TypeError"
                    ? t("common.networkDown", "Sem conexão. Verifique sua internet.")
                    : (e?.message ?? t("common.saveFail", "Falha ao salvar"));
            Alert.alert(t("common.error", "Erro"), msg);
        } finally {
            setSalvando(false);
        }
    };

    const excluir = async () => {
        if (!isEdit) return;
        const ok = await new Promise<boolean>((resolve) => {
            Alert.alert(
                t("common.deleteConfirm", "Confirmar exclusão?"),
                t("common.deleteIrreversible", "Essa ação não poderá ser desfeita."),
                [
                    { text: t("common.cancel", "Cancelar"), style: "cancel", onPress: () => resolve(false) },
                    { text: t("common.delete", "Excluir"), style: "destructive", onPress: () => resolve(true) },
                ]
            );
        });
        if (!ok) return;
        try {
            await MotoTrack.deleteAgendamento(Number(id));
            await notifyCRUD("AGENDAMENTO", "DELETE", t("sched.notify.deleted", "Agendamento #{id} excluído.").replace("{id}", String(id)));
            Alert.alert(t("common.deleted", "Excluído"), t("sched.form.removed", "Agendamento removido."));
            router.replace("/agendamentos/list");
        } catch (e: any) {
            const msg =
                e?.message?.includes("Network") || e?.name === "TypeError"
                    ? t("common.networkDown", "Sem conexão. Verifique sua internet.")
                    : (e?.message ?? t("common.deleteFail", "Não foi possível excluir"));
            Alert.alert(t("common.error", "Erro"), msg);
        }
    };

    return (
        <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView>

                    {/* Título */}
                    <Text style={[globalStyles.title, { color: colors.text }]}>{titulo}</Text>
                    <Text style={[globalStyles.text, { color: colors.mutedText, textAlign: "center" }]}>
                        {isEdit
                            ? t("sched.form.subtitleEdit", "Atualize os campos necessários.")
                            : t("sched.form.subtitleNew", "Preencha os dados para criar um agendamento.")}
                    </Text>

                    {/* Card do formulário */}
                    <View style={[formStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {loading ? (
                            <ActivityIndicator />
                        ) : (
                            <>
                                {!!erro && (
                                    <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>
                                        {erro}
                                    </Text>
                                )}

                                {/* Data/Hora */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>
                                        {t("sched.form.dateTimeLabel", "Data/Hora")}
                                    </Text>
                                    <TextInput
                                        placeholder={t("sched.form.dateTimePlaceholder", "dd/mm/aaaa hh:mm:ss")}
                                        placeholderTextColor={colors.mutedText}
                                        value={dataHoraText}
                                        onChangeText={(v) => setDataHoraText(maskDateTime(v))}
                                        onBlur={() => {
                                            const normalized = normalizePtDateTime(dataHoraText);
                                            if (!normalized) {
                                                setDataHoraText("");
                                                setForm((s) => ({ ...s, dataAgendada: "" }));
                                                return;
                                            }
                                            const d = parsePtToDate(normalized);
                                            if (!d) return;
                                            setForm((s) => ({ ...s, dataAgendada: normalized }));
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
                                        {t("sched.form.motoIdLabel", "Moto (ID)")}
                                    </Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        placeholder={t("sched.form.motoIdPlaceholder", "ID da moto")}
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

                                {/* Descrição */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>
                                        {t("sched.form.descLabel", "Descrição")}
                                    </Text>
                                    <TextInput
                                        placeholder={t("sched.form.descPlaceholder", "Ex.: Troca de óleo e revisão geral")}
                                        placeholderTextColor={colors.mutedText}
                                        value={form.descricao ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, descricao: v }))}
                                        editable={!salvando && !loading}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: fieldErrors.descricao ? colors.dangerBorder : colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                        multiline
                                        numberOfLines={4}
                                    />
                                    {!!fieldErrors.descricao && (
                                        <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>
                                            {fieldErrors.descricao}
                                        </Text>
                                    )}
                                </View>

                                {/* Ações */}
                                <View style={listStyles.row}>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={isEdit ? t("sched.form.btnUpdate", "Atualizar agendamento") : t("sched.form.btnSave", "Salvar agendamento")}
                                        accessibilityHint={t("sched.form.btnHint", "Valida os campos e envia os dados do agendamento.")}
                                        android_ripple={{ color: colors.ripple }}
                                        disabled={salvando}
                                        style={[globalStyles.button, { backgroundColor: colors.button }]}
                                        onPress={salvar}
                                    >
                                        <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                                            {salvando ? t("common.saving", "Salvando...") : (isEdit ? t("common.update", "Atualizar") : t("common.save", "Salvar"))}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={t("common.back", "Voltar")}
                                        android_ripple={{ color: colors.ripple }}
                                        style={[globalStyles.button, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                                        onPress={() => router.back()}
                                    >
                                        <Text style={[globalStyles.buttonText, { color: colors.text }]}>{t("common.back", "Voltar")}</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Excluir (somente no modo edição) */}
                    {isEdit && (
                        <View style={[formStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[globalStyles.text, { color: colors.text }]}>{t("common.actions", "Ações")}</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("sched.form.btnDelete", "Excluir agendamento")}
                                accessibilityHint={t("common.irreversible", "Ação irreversível")}
                                android_ripple={{ color: colors.ripple }}
                                onPress={excluir}
                                style={[formStyles.dangerBtn, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
                            >
                                <Text style={[globalStyles.buttonText, { color: "#fecaca" }]}>{t("common.delete", "Excluir")}</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Botões de idioma (padrão do projeto) */}
                    <View style={globalStyles.rowCenter}>
                        <Pressable
                            style={[globalStyles.langButton, { backgroundColor: colors.langPtBg }]}
                            onPress={() => mudarIdioma("pt")}
                        >
                            <Text style={{ color: colors.langPtText }}>PT</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                globalStyles.langButton,
                                {
                                    backgroundColor: colors.langEsBg,
                                    borderWidth: colors.langEsBorder ? 1 : 0,
                                    borderColor: colors.langEsBorder ?? "transparent",
                                },
                            ]}
                            onPress={() => mudarIdioma("es")}
                        >
                            <Text style={{ color: colors.langEsText }}>ES</Text>
                        </Pressable>
                    </View>

                    {/* Rodapé - Alternar tema */}
                    <View style={globalStyles.homeFooter}>
                        <ThemeToggleButton />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
