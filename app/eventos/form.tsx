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

/* ============================================================================
   🕒 Data/Hora (PT-BR)
   - Digitação suave: apenas insere separadores (sem zeros automáticos).
   - No onBlur/salvar: normaliza p/ dd/MM/yyyy HH:mm:ss (com :00 se faltar).
   - API: envia/recebe `dataHora` como string PT-BR (NÃO ISO).
   ============================================================================ */

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
    // mínimo: dd mm aaaa hh mm => 12 dígitos
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
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEdit = !!id;
    const router = useRouter();
    const { colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    // ⬇️ NOVO: erros por campo
    const [fieldErrors, setFieldErrors] = useState<{
        data?: string; motoId?: string; tipo?: string; motivo?: string;
    }>({});

    const [form, setForm] = useState<Partial<Evento & {
        motoId?: number; tipo?: string; motivo?: string; localizacao?: string | null; dataHora?: string;
    }>>({
        dataHora: "",   // PT-BR no salvar
        motoId: undefined,
        tipo: "",
        motivo: "",
        localizacao: "",
    });

    // Campo visual
    const [dataHoraText, setDataHoraText] = useState<string>("");

    const titulo = useMemo(
        () => (isEdit ? "✏️ Editar Evento" : "📌 Novo Evento"),
        [isEdit]
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
                    Alert.alert("Aviso", "Evento inválido.");
                    router.replace("/eventos/list");
                    return;
                }
                const found = await MotoTrack.getEvento(_id);
                setForm({
                    id: found.id,
                    dataHora: (found as any).dataHora,    // PT-BR vindo da API
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
                    ? "Sem conexão. Verifique sua internet."
                    : (e?.message ?? "Falha ao carregar");
            setErro(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregar(); }, [id]);

    // Re-sincroniza quando form.dataHora mudar
    useEffect(() => {
        if (loading) return;
        setDataHoraText(form?.dataHora ?? "");
    }, [loading, form?.dataHora]);

    const salvar = async () => {
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

        if (!form.motoId) {
            setFieldErrors((e) => ({ ...e, motoId: "Informe o ID da moto." }));
            Alert.alert("Validação", "Informe o ID da moto");
            return;
        }

        const tipo = sanitize(form.tipo ?? "");
        if (!tipo) {
            setFieldErrors((e) => ({ ...e, tipo: "Informe o tipo do evento." }));
            Alert.alert("Validação", "Informe o tipo do evento");
            return;
        }

        const motivo = sanitize(form.motivo ?? "");
        if (!motivo || motivo.length < 3) {
            setFieldErrors((e) => ({ ...e, motivo: "Motivo deve ter ao menos 3 caracteres." }));
            Alert.alert("Validação", "Informe o motivo");
            return;
        }

        setSalvando(true);
        try {
            // ⚠️ API espera dataHora em PT-BR (não ISO)
            const payload = {
                dataHora: normalized,
                motoId: Number(form.motoId),
                tipo,
                motivo,
                localizacao: sanitize(form.localizacao ?? ""),
            } as any;

            if (!isEdit) {
                const novo = await MotoTrack.createEvento(payload);
                Alert.alert("Sucesso", "Evento criado.");
                router.replace(`/eventos/form?id=${(novo as any).id}`);
            } else {
                await MotoTrack.updateEvento(Number(id), payload);
                Alert.alert("Sucesso", "Evento atualizado.");
                router.replace("/eventos/list");
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
            await MotoTrack.deleteEvento(Number(id));
            Alert.alert("Excluído", "Evento removido.");
            router.replace("/eventos/list");
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
                    <Text style={[globalStyles.title, { color: colors.text }]}>{titulo}</Text>
                    <Text style={[globalStyles.text, { color: colors.mutedText, textAlign: "center" }]}>
                        {isEdit ? "Atualize os campos necessários." : "Preencha os dados para criar um evento."}
                    </Text>

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
                                        editable={!salvando && !loading} // ⬅️ bloqueio durante salvar/loading
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
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Tipo</Text>
                                    <TextInput
                                        placeholder="Ex.: MANUTENCAO, SINISTRO, DEVOLUCAO"
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
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Motivo</Text>
                                    <TextInput
                                        placeholder="Descreva brevemente"
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
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Localização</Text>
                                    <TextInput
                                        placeholder="Ex.: Filial Vila Mariana - Box 3"
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
                                        accessibilityLabel={isEdit ? "Atualizar evento" : "Salvar evento"}
                                        accessibilityHint="Valida os campos e envia os dados do evento."
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
                                        style={[
                                            globalStyles.button,
                                            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                                        ]}
                                        onPress={() => router.back()}
                                    >
                                        <Text style={[globalStyles.buttonText, { color: colors.text }]}>Voltar</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>

                    {isEdit && (
                        <View style={[formStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[globalStyles.text, { color: colors.text }]}>Ações</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Excluir evento"
                                accessibilityHint="Ação irreversível"
                                android_ripple={{ color: colors.ripple }}
                                onPress={excluir}
                                style={[formStyles.dangerBtn, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
                            >
                                <Text style={[globalStyles.buttonText, { color: "#fecaca" }]}>Excluir</Text>
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
