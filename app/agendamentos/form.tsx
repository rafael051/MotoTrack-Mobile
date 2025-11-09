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

/* ============================================================================
   🕒 Data/Hora (PT-BR)
   - Digitação suave: máscara só insere separadores (sem zeros automáticos).
   - No onBlur/salvar: normaliza p/ dd/MM/yyyy HH:mm:ss (com :00 se faltar).
   - API: envia/recebe `dataAgendada` como string PT-BR (NÃO ISO).
   ============================================================================ */

/** Remove aspas e trims */
const sanitize = (t: string) => (t ?? "").replace(/[“”"']/g, "").trim();

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
    // precisa ter no mínimo dd mm aaaa hh mm => 12 dígitos
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

export default function AgendamentoForm() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEdit = !!id;
    const router = useRouter();
    const { colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    // ⬇️ NOVO: erros por campo para feedback inline
    const [fieldErrors, setFieldErrors] = useState<{ data?: string; motoId?: string; descricao?: string }>({});

    // Mantemos o shape sem "status" no payload (não existe no schema)
    const [form, setForm] = useState<Partial<Agendamento & {
        motoId?: number; descricao?: string; dataAgendada?: string;
    }>>({
        dataAgendada: "", // PT-BR no salvar
        motoId: undefined,
        descricao: "",
    });

    // Campo visual para digitação
    const [dataHoraText, setDataHoraText] = useState<string>("");

    const titulo = useMemo(
        () => (isEdit ? "✏️ Editar Agendamento" : "📅 Novo Agendamento"),
        [isEdit]
    );

    // ⬇️ helper: valida data futura
    const isFutureDate = (d: Date) => d.getTime() > Date.now();

    const carregar = async () => {
        setErro(null); setLoading(true);
        setFieldErrors({}); // limpa mensagens inline
        try {
            if (!isEdit) {
                setForm({ dataAgendada: "", motoId: undefined, descricao: "" });
                setDataHoraText("");
            } else {
                // guarda: id inválido (NaN) → volta para lista
                const _id = Number(id);
                if (!Number.isFinite(_id) || _id <= 0) {
                    Alert.alert("Aviso", "Agendamento inválido.");
                    router.replace("/agendamentos/list");
                    return;
                }
                const found = await MotoTrack.getAgendamento(_id);
                // A API retorna dataAgendada (PT-BR). Mantemos como veio.
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
                    ? "Sem conexão. Verifique sua internet."
                    : (e?.message ?? "Falha ao carregar");
            setErro(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregar(); }, [id]);

    // Se dataAgendada mudar (depois de load/put), sincroniza o campo visual
    useEffect(() => {
        if (loading) return;
        setDataHoraText(form?.dataAgendada ?? "");
    }, [loading, form?.dataAgendada]);

    const salvar = async () => {
        // limpa erros inline a cada tentativa
        setFieldErrors({});

        // Garante normalização mesmo sem blur
        const normalized = normalizePtDateTime(dataHoraText);
        if (!normalized) {
            setFieldErrors((e) => ({ ...e, data: "Informe Data/Hora completa (dd/mm/aaaa hh:mm)." }));
            Alert.alert("Validação", "Informe Data/Hora completa (dd/mm/aaaa hh:mm).");
            return;
        }
        const parsed = parsePtToDate(normalized);
        if (!parsed) {
            setFieldErrors((e) => ({ ...e, data: "Data/Hora inválida." }));
            Alert.alert("Validação", "Data/Hora inválida.");
            return;
        }
        if (!isFutureDate(parsed)) {
            setFieldErrors((e) => ({ ...e, data: "Data/Hora deve ser futura." }));
            Alert.alert("Validação", "Data/Hora deve ser futura.");
            return;
        }

        if (!form.motoId) {
            setFieldErrors((e) => ({ ...e, motoId: "Informe o ID da moto." }));
            Alert.alert("Validação", "Informe o ID da moto");
            return;
        }

        const desc = sanitize(form.descricao ?? "");
        if (!desc || desc.length < 5) {
            setFieldErrors((e) => ({ ...e, descricao: "Descrição deve ter ao menos 5 caracteres." }));
            Alert.alert("Validação", "Informe a descrição");
            return;
        }

        setSalvando(true);
        try {
            // ⚠️ API espera dataAgendada em PT-BR (não ISO)
            const payload = {
                dataAgendada: normalized,
                motoId: Number(form.motoId),
                descricao: desc,
            } as any;

            if (!isEdit) {
                const novo = await MotoTrack.createAgendamento(payload);
                Alert.alert("Sucesso", "Agendamento criado.");
                router.replace(`/agendamentos/form?id=${(novo as any).id}`);
            } else {
                await MotoTrack.updateAgendamento(Number(id), payload);
                Alert.alert("Sucesso", "Agendamento atualizado.");
                router.replace("/agendamentos/list");
            }
        } catch (e: any) {
            const msg =
                e?.message?.includes("Network") || e?.name === "TypeError"
                    ? "Sem conexão. Verifique sua internet."
                    : (e?.message ?? "Falha ao salvar");
            Alert.alert("Erro", msg);
        } finally {
            setSalvando(false);
        }
    };

    const excluir = async () => {
        if (!isEdit) return;
        const ok = await new Promise<boolean>((resolve) => {
            Alert.alert("Confirmar exclusão?", "Essa ação não poderá ser desfeita.", [
                { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
                { text: "Excluir", style: "destructive", onPress: () => resolve(true) },
            ]);
        });
        if (!ok) return;
        try {
            await MotoTrack.deleteAgendamento(Number(id));
            Alert.alert("Excluído", "Agendamento removido.");
            router.replace("/agendamentos/list");
        } catch (e: any) {
            const msg =
                e?.message?.includes("Network") || e?.name === "TypeError"
                    ? "Sem conexão. Verifique sua internet."
                    : (e?.message ?? "Não foi possível excluir");
            Alert.alert("Erro", msg);
        }
    };

    return (
        <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView>
                    {/* Título */}
                    <Text style={[globalStyles.title, { color: colors.text }]}>
                        {titulo}
                    </Text>
                    <Text style={[globalStyles.text, { color: colors.mutedText, textAlign: "center" }]}>
                        {isEdit ? "Atualize os campos necessários." : "Preencha os dados para criar um agendamento."}
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
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Data/Hora</Text>
                                    <TextInput
                                        placeholder="dd/mm/aaaa hh:mm:ss"
                                        placeholderTextColor={colors.mutedText}
                                        value={dataHoraText}
                                        onChangeText={(v) => setDataHoraText(maskDateTime(v))} // sem zeros automáticos
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
                                            setDataHoraText(normalized); // exibe já normalizado
                                        }}
                                        inputMode="numeric"
                                        maxLength={19}
                                        autoCorrect={false}
                                        // ⬇️ bloqueia input durante salvando/loading
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
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Moto (ID)</Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        placeholder="ID da moto"
                                        placeholderTextColor={colors.mutedText}
                                        value={form.motoId ? String(form.motoId) : ""}
                                        onChangeText={(v) => {
                                            const n = Number(v.replace(/\D/g, ""));
                                            setForm((s) => ({ ...s, motoId: Number.isFinite(n) && n > 0 ? n : undefined }));
                                        }}
                                        // ⬇️ bloqueia input durante salvando/loading
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
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Descrição</Text>
                                    <TextInput
                                        placeholder="Ex.: Troca de óleo e revisão geral"
                                        placeholderTextColor={colors.mutedText}
                                        value={form.descricao ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, descricao: v }))}
                                        // ⬇️ bloqueia input durante salvando/loading
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
                                        accessibilityLabel={isEdit ? "Atualizar agendamento" : "Salvar agendamento"}
                                        accessibilityHint="Valida os campos e envia os dados do agendamento."
                                        android_ripple={{ color: colors.ripple }}
                                        disabled={salvando}
                                        style={[globalStyles.button, { backgroundColor: colors.button }]}
                                        onPress={salvar}
                                    >
                                        <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                                            {salvando ? "Salvando..." : (isEdit ? "Atualizar" : "Salvar")}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Voltar"
                                        android_ripple={{ color: colors.ripple }}
                                        style={[globalStyles.button, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                                        onPress={() => router.back()}
                                    >
                                        <Text style={[globalStyles.buttonText, { color: colors.text }]}>Voltar</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Excluir (somente no modo edição) */}
                    {isEdit && (
                        <View style={[formStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[globalStyles.text, { color: colors.text }]}>Ações</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Excluir agendamento"
                                accessibilityHint="Ação irreversível"
                                android_ripple={{ color: colors.ripple }}
                                onPress={excluir}
                                style={[formStyles.dangerBtn, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
                            >
                                <Text style={[globalStyles.buttonText, { color: "#fecaca" }]}>Excluir</Text>
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
