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

/** dd/mm/aaaa hh:mm -> ISO */
function parsePtDateTime(input?: string): string | undefined {
    if (!input) return undefined;
    const [dmy, hm] = input.trim().split(" ");
    const [dd, mm, yyyy] = (dmy || "").split("/");
    const [hh = "00", mi = "00"] = (hm || "").split(":");
    if (!dd || !mm || !yyyy) return undefined;
    const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), 0);
    return isNaN(+dt) ? undefined : dt.toISOString();
}
/** ISO -> dd/mm/aaaa hh:mm */
function toPtDateTime(iso?: string): string {
    if (!iso) return "";
    const dt = new Date(iso);
    if (isNaN(+dt)) return "";
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yy = dt.getFullYear();
    const hh = String(dt.getHours()).padStart(2, "0");
    const mi = String(dt.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

export default function AgendamentoForm() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEdit = !!id;
    const router = useRouter();
    const { colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const [form, setForm] = useState<Partial<Agendamento & {
        motoId?: number; descricao?: string; status?: string | null
    }>>({
        dataHora: "",
        motoId: undefined,
        descricao: "",
        status: null,
    });

    const titulo = useMemo(
        () => (isEdit ? "✏️ Editar Agendamento" : "📅 Novo Agendamento"),
        [isEdit]
    );

    const carregar = async () => {
        setErro(null); setLoading(true);
        try {
            if (!isEdit) {
                setForm({ dataHora: "", motoId: undefined, descricao: "", status: null });
            } else {
                const found = await MotoTrack.getAgendamento(Number(id));
                setForm({
                    id: found.id,
                    dataHora: found.dataHora,
                    motoId: (found as any).motoId,
                    descricao: (found as any).descricao,
                    status: found.status ?? null,
                });
            }
        } catch (e: any) {
            setErro(e?.message ?? "Falha ao carregar");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregar(); }, [id]);

    const salvar = async () => {
        if (!form.dataHora) return Alert.alert("Validação", "Informe Data/Hora (dd/mm/aaaa hh:mm)");
        if (!form.motoId) return Alert.alert("Validação", "Informe o ID da moto");
        if (!form.descricao?.trim()) return Alert.alert("Validação", "Informe a descrição");

        setSalvando(true);
        try {
            const payload = {
                dataHora: parsePtDateTime(form.dataHora) || new Date().toISOString(),
                status: form.status ?? null,
                motoId: form.motoId,
                descricao: form.descricao,
            } as any;

            if (!isEdit) {
                const novo = await MotoTrack.createAgendamento(payload);
                Alert.alert("Sucesso", "Agendamento criado.");
                router.replace(`/agendamentos/form?id=${novo.id}`);
            } else {
                await MotoTrack.updateAgendamento(Number(id), payload);
                Alert.alert("Sucesso", "Agendamento atualizado.");
                router.replace("/agendamentos/list");
            }
        } catch (e: any) {
            Alert.alert("Erro", e?.message ?? "Falha ao salvar");
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
            Alert.alert("Erro", e?.message ?? "Não foi possível excluir");
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
                                        placeholder="dd/mm/aaaa hh:mm"
                                        placeholderTextColor={colors.mutedText}
                                        value={toPtDateTime(form.dataHora as string)}
                                        onChangeText={(v) => setForm((s) => ({ ...s, dataHora: v }))}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                        // sem minHeight custom — respeita os padrões globais
                                    />
                                </View>

                                {/* Moto ID */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Moto (ID)</Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        placeholder="ID da moto"
                                        placeholderTextColor={colors.mutedText}
                                        value={form.motoId ? String(form.motoId) : ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, motoId: Number(v) || undefined }))}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                </View>

                                {/* Descrição */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Descrição</Text>
                                    <TextInput
                                        placeholder="Ex.: Troca de óleo e revisão geral"
                                        placeholderTextColor={colors.mutedText}
                                        value={form.descricao ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, descricao: v }))}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                        multiline
                                        numberOfLines={4}  // altura controlada por linhas (sem minHeight avulso)
                                    />
                                </View>

                                {/* Ações */}
                                <View style={listStyles.row}>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={isEdit ? "Atualizar agendamento" : "Salvar agendamento"}
                                        android_ripple={{ color: colors.ripple }}
                                        disabled={salvando}
                                        style={[
                                            globalStyles.button,
                                            { backgroundColor: colors.button },
                                        ]}
                                        onPress={salvar}
                                    >
                                        <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                                            {isEdit ? "Atualizar" : "Salvar"}
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
                                style={[
                                    formStyles.dangerBtn,
                                    { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder },
                                ]}
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
