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

/* ============================================================================
   🧹 Utils
   -------------------------------------------------------------------------- */
const sanitize = (t?: string) => (t ?? "").replace(/[“”"']/g, "").trim();

/** Converte string -> número inteiro (ou undefined) */
const toInt = (v?: string) => {
    if (v == null) return undefined;
    const onlyDigits = String(v).replace(/\D/g, "");
    if (!onlyDigits) return undefined;
    const n = Number(onlyDigits);
    return Number.isFinite(n) ? n : undefined;
};

/** Exibe número em string ou "" */
const intToStr = (n?: number) => (n == null || !Number.isFinite(n) ? "" : String(n));

/** Máscara leve p/ placa (deixa A-Z/0-9 e upper) — aceita AAA0A00 (Mercosul) */
const maskPlaca = (v?: string) => sanitize(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);

/* ============================================================================
   💾 Tipo de formulário (sem nulls)
   -------------------------------------------------------------------------- */
type MotoForm = {
    id?: number;
    placa: string;
    modelo?: string;
    marca?: string;
    ano?: number;      // opcional
    status?: string;   // opcional
};

export default function MotoFormScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEdit = !!id;
    const router = useRouter();
    const { colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const [form, setForm] = useState<MotoForm>({
        placa: "",
        modelo: "",
        marca: "",
        ano: undefined,
        status: "",
    });

    const titulo = useMemo(
        () => (isEdit ? "✏️ Editar Moto" : "🏍️ Nova Moto"),
        [isEdit]
    );

    const carregar = async () => {
        setErro(null);
        setLoading(true);
        try {
            if (!isEdit) {
                setForm({
                    placa: "",
                    modelo: "",
                    marca: "",
                    ano: undefined,
                    status: "",
                });
            } else {
                const m = await MotoTrack.getMoto(Number(id));
                setForm({
                    id: m.id,
                    placa: maskPlaca(m.placa ?? ""),
                    modelo: (m.modelo ?? "") as string,
                    marca: (m.marca ?? "") as string,
                    ano: m.ano ?? undefined,
                    status: (m.status ?? "") as string,
                });
            }
        } catch (e: any) {
            setErro(e?.message ?? "Falha ao carregar");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void carregar(); }, [id]);

    const salvar = async () => {
        // Validações simples
        if (!form.placa?.trim()) return Alert.alert("Validação", "Informe a placa.");
        if (form.placa.length < 7) return Alert.alert("Validação", "Placa deve ter 7 caracteres.");
        if (form.ano != null) {
            if (!Number.isInteger(form.ano) || form.ano < 1900 || form.ano > 2100) {
                return Alert.alert("Validação", "Ano inválido. Use um valor entre 1900 e 2100.");
            }
        }

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
                Alert.alert("Sucesso", "Moto criada.");
                router.replace(`/motos/form?id=${novo.id}`);
            } else {
                await MotoTrack.updateMoto(Number(id), payload as any);
                Alert.alert("Sucesso", "Moto atualizada.");
                router.replace("/motos/list");
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
            await MotoTrack.deleteMoto(Number(id));
            Alert.alert("Excluída", "Moto removida.");
            router.replace("/motos/list");
        } catch (e: any) {
            Alert.alert("Erro", e?.message ?? "Não foi possível excluir");
        }
    };

    return (
        <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView>
                    {/* Título */}
                    <Text style={[globalStyles.title, { color: colors.text }]}>{titulo}</Text>
                    <Text style={[globalStyles.text, { color: colors.mutedText, textAlign: "center" }]}>
                        {isEdit ? "Atualize os campos necessários." : "Preencha os dados para cadastrar uma moto."}
                    </Text>

                    {/* Card do formulário */}
                    <View style={[formStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {loading ? (
                            <ActivityIndicator />
                        ) : (
                            <>
                                {!!erro && (
                                    <Text style={[globalStyles.text, { color: colors.dangerBorder }]}>{erro}</Text>
                                )}

                                {/* Placa (obrigatório) */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Placa *</Text>
                                    <TextInput
                                        placeholder="AAA0A00"
                                        placeholderTextColor={colors.mutedText}
                                        value={form.placa}
                                        onChangeText={(v) => setForm((s) => ({ ...s, placa: maskPlaca(v) }))}
                                        autoCapitalize="characters"
                                        maxLength={7}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, textTransform: "uppercase" },
                                        ]}
                                    />
                                </View>

                                {/* Modelo */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Modelo</Text>
                                    <TextInput
                                        placeholder="Ex.: CG 160 Titan"
                                        placeholderTextColor={colors.mutedText}
                                        value={form.modelo ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, modelo: v }))}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                </View>

                                {/* Marca */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Marca</Text>
                                    <TextInput
                                        placeholder="Ex.: Honda"
                                        placeholderTextColor={colors.mutedText}
                                        value={form.marca ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, marca: v }))}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                </View>

                                {/* Ano */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Ano</Text>
                                    <TextInput
                                        placeholder="Ex.: 2022"
                                        placeholderTextColor={colors.mutedText}
                                        value={intToStr(form.ano)}
                                        onChangeText={(v) => setForm((s) => ({ ...s, ano: toInt(v) }))}
                                        keyboardType="numeric"
                                        maxLength={4}
                                        style={[
                                            globalStyles.input,
                                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                                        ]}
                                    />
                                </View>

                                {/* Status */}
                                <View style={globalStyles.inputContainer}>
                                    <Text style={[globalStyles.inputLabel, { color: colors.mutedText }]}>Status</Text>
                                    <TextInput
                                        placeholder="Ex.: Ativa, Manutenção, Inativa"
                                        placeholderTextColor={colors.mutedText}
                                        value={form.status ?? ""}
                                        onChangeText={(v) => setForm((s) => ({ ...s, status: v }))}
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
                                        accessibilityLabel={isEdit ? "Atualizar moto" : "Salvar moto"}
                                        android_ripple={{ color: colors.ripple }}
                                        disabled={salvando}
                                        style={[globalStyles.button, { backgroundColor: colors.button }]}
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
                                accessibilityLabel="Excluir moto"
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
