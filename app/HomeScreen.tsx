// File: app/home/index.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    View,
    Text,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    RefreshControl,
    Pressable,
    Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteUser } from "firebase/auth";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useTranslation } from "react-i18next";

import {
    initNotifications,
    addNotificationListener,
    notifyCRUD,
    scheduleReminder,
} from "../src/notifications/notificationsService";

import { auth } from "../src/services/firebaseConfig";
import globalStyles, { themedStyles } from "../src/styles/globalStyles";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";
import {
    MotoTrack,
    type Moto,
    type Filial,
    type Agendamento,
    type Evento,
    type Usuario, setApiBase,
} from "../src/services/mototrack";


/* =========================
   Config / Utils
========================= */
const API_BASE = process.env.EXPO_PUBLIC_API_BASE?.trim() ?? "http://10.0.2.2:5267";
setApiBase(API_BASE);



/* =========================
   Utils de data
========================= */
// Aceita ISO e "dd/MM/yyyy HH:mm[:ss]"
const fmtDateTime = (s?: string | null) => {
    if (!s) return "—";
    let d = new Date(s);
    if (!isNaN(d.getTime())) return d.toLocaleString();

    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (m) {
        const [, dd, MM, yyyy, hh = "00", mm = "00", ss = "00"] = m;
        d = new Date(+yyyy, +MM - 1, +dd, +hh, +mm, +ss);
        if (!isNaN(d.getTime())) return d.toLocaleString();
    }
    return s;
};

const pickAgendamentoDate = (a: Agendamento): string | null => {
    // @ts-expect-error — permite chaves opcionais sem quebrar
    return a?.dataHora ?? a?.dataAgendada ?? a?.data ?? a?.inicio ?? null;
};
const pickEventoDate = (e: Evento): string | null => {
    // @ts-expect-error — idem
    return e?.dataHora ?? e?.data ?? e?.quando ?? null;
};

/* =========================
   Screen
========================= */
export default function HomeScreen(): JSX.Element {
    const { colors } = useTheme();
    const t = themedStyles(colors);

    // 🌍 i18n
    const { t: i18nT, i18n } = useTranslation();
    const mudarIdioma = (lang: string) => i18n.changeLanguage(lang);

    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const [motos, setMotos] = useState<Moto[]>([]);
    const [filiais, setFiliais] = useState<Filial[]>([]);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    const [refreshing, setRefreshing] = useState(false);

    const totals = useMemo(
        () => ({
            motos: motos.length,
            filiais: filiais.length,
            agendamentos: agendamentos.length,
            eventos: eventos.length,
            usuarios: usuarios.length,
        }),
        [motos, filiais, agendamentos, eventos, usuarios]
    );

    const carregar = useCallback(async () => {
        setErro(null);
        setLoading(true);
        try {
            const [m, f, a, e, u] = await Promise.all([
                MotoTrack.buscarMotos(),
                MotoTrack.buscarFiliais(),
                MotoTrack.buscarAgendamentos(),
                MotoTrack.buscarEventos(),
                MotoTrack.buscarUsuarios(),
            ]);

            a?.forEach((ag) => fmtDateTime(pickAgendamentoDate(ag) ?? undefined));
            e?.forEach((ev) => fmtDateTime(pickEventoDate(ev) ?? undefined));

            setMotos(m);
            setFiliais(f);
            setAgendamentos(a);
            setEventos(e);
            setUsuarios(u);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : i18nT("common.genericLoadError", "Falha ao carregar dados");
            setErro(msg);
        } finally {
            setLoading(false);
        }
    }, [i18nT]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    // 🔔 Inicialização + listener (abre lista de Agendamentos ao tocar)
    useEffect(() => {
        initNotifications();
        const unsub = addNotificationListener((data) => {
            if (data?.type === "agendamento" && data?.id) {
                router.push({ pathname: "/agendamentos/list", params: { highlightId: String(data.id) } });
            } else {
                router.push("/agendamentos/list");
            }
        });
        return unsub;
    }, []);

    // 🔔 Handler + canal Android (mantido, só i18n no nome do canal se quiser)
    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });

        const ensureChannel = async () => {
            if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync("default", {
                    name: i18nT("notifications.channelGeneral", "Geral"),
                    importance: Notifications.AndroidImportance.HIGH,
                    sound: "notify.wav", // opcional
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#0EA5E9",
                    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
                });
            }
        };

        ensureChannel().catch(() => {});
    }, [i18nT]);

    // 🔔 Limpeza de notificações entregues ao focar (mantido)
    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                    await Notifications.dismissAllNotificationsAsync();
                    await Notifications.setBadgeCountAsync(0);
                } catch {}
            })();
            return () => {};
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await carregar();
        setRefreshing(false);
    }, [carregar]);

    const realizarLogoff = async () => {
        await AsyncStorage.removeItem("@user");
        router.replace("/");
    };

    const excluirConta = () => {
        Alert.alert(
            i18nT("home.deleteConfirmTitle", "Confirmar Exclusão"),
            i18nT(
                "home.deleteConfirmMessage",
                "Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita."
            ),
            [
                { text: i18nT("common.cancel", "Cancelar"), style: "cancel" },
                {
                    text: i18nT("home.deleteConfirmYes", "Excluir"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const user = auth.currentUser;
                            if (!user) {
                                Alert.alert(i18nT("common.error"), i18nT("home.noUserLogged", "Nenhum usuário logado."));
                                return;
                            }
                            await deleteUser(user);
                            await AsyncStorage.removeItem("@user");
                            Alert.alert(
                                i18nT("home.accountDeleted", "Conta Excluída"),
                                i18nT("home.accountDeletedMsg", "Sua conta foi excluída com sucesso.")
                            );
                            router.replace("/");
                        } catch (error) {
                            console.log("Erro ao excluir conta", error);
                            Alert.alert(i18nT("common.error"), i18nT("home.couldNotDelete", "Não foi possível excluir a conta."));
                        }
                    },
                },
            ]
        );
    };

    // 🔔 Botões de teste (mantidos)
    const notificarAgora = async () => {
        await notifyCRUD("AGENDAMENTO", "CREATE", i18nT("home.notifyNowBody", "Notificação local imediata — toque para abrir."));
    };

    const notificarEm10s = async () => {
        const d = new Date(Date.now() + 10_000);
        await scheduleReminder(
            "agendamento",
            "demo-10s",
            d,
            0,
            i18nT("home.reminderTitle", "Lembrete de Agendamento"),
            i18nT("home.reminderBody10s", "Vou te lembrar em ~10 segundos ({time}).").replace("{time}", d.toLocaleTimeString())
        );
        Alert.alert(i18nT("home.scheduled", "Agendado"), i18nT("home.notifyIn10sScheduled", "Uma notificação será disparada em ~10 segundos."));
    };

    return (
        <SafeAreaView
            style={[
                globalStyles.container,
                globalStyles.homeContainer,
                { backgroundColor: colors.background },
            ]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={20}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 24 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Cabeçalho */}
                    <View style={[globalStyles.homeHeader, { marginBottom: 8 }]}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Ionicons name="speedometer-outline" size={26} color={colors.text} />
                            <Text style={[globalStyles.title, { color: colors.text }]}>
                                {i18nT("app.name", "MotoTrack")}
                            </Text>
                        </View>
                    </View>

                    {/* Grid de Módulos */}
                    <View style={globalStyles.homeGrid}>
                        <Tile
                            label={i18nT("home.modules.motos", "Motos")}
                            count={totals.motos}
                            onPress={() => router.push("/motos")}
                            Icon={() => <MaterialCommunityIcons name="motorbike" size={28} color={colors.buttonText} />}
                            t={t}
                        />
                        <Tile
                            label={i18nT("home.modules.filiais", "Filiais")}
                            count={totals.filiais}
                            onPress={() => router.push("/filiais")}
                            Icon={() => <Feather name="map-pin" size={28} color={colors.buttonText} />}
                            t={t}
                        />
                        <Tile
                            label={i18nT("home.modules.agendamentos", "Agendamentos")}
                            count={totals.agendamentos}
                            onPress={() => router.push("/agendamentos/list")}
                            Icon={() => <MaterialCommunityIcons name="calendar-clock" size={28} color={colors.buttonText} />}
                            t={t}
                        />
                        <Tile
                            label={i18nT("home.modules.eventos", "Eventos")}
                            count={totals.eventos}
                            onPress={() => router.push("/eventos")}
                            Icon={() => <Feather name="activity" size={28} color={colors.buttonText} />}
                            t={t}
                        />
                        <Tile
                            label={i18nT("home.modules.usuarios", "Usuários")}
                            count={totals.usuarios}
                            onPress={() => router.push("/usuarios")}
                            Icon={() => <Feather name="users" size={28} color={colors.buttonText} />}
                            t={t}
                        />
                        <Tile
                            label={i18nT("home.modules.sobre", "Sobre")}
                            onPress={() => router.push("/sobre")}
                            Icon={() => <MaterialCommunityIcons name="information-outline" size={28} color={colors.buttonText} />}
                            t={t}
                        />
                    </View>

                    {/* Loading/Erro */}
                    {loading && (
                        <View style={{ paddingVertical: 8 }}>
                            <ActivityIndicator />
                        </View>
                    )}
                    {!!erro && <Text style={[globalStyles.text, t.errorText]}>{erro}</Text>}

                    {/* Conta */}
                    <View style={[t.accountSection, { marginTop: 12 }]}>
                        <Text style={[globalStyles.text, t.centeredParagraph]}>
                            {i18nT("home.loggedIn", "Você está logado.")}
                        </Text>

                        <Pressable onPress={realizarLogoff} style={[globalStyles.button, t.btnPrimary]}>
                            <Text style={[globalStyles.buttonText, t.btnPrimaryText]}>
                                {i18nT("home.logout", "Realizar logoff")}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => router.push("/AlterarSenhaScreen")}
                            style={[globalStyles.button, t.btnWarning]}
                        >
                            <Text style={[globalStyles.buttonText, t.btnWarningText]}>
                                {i18nT("auth.changePassword", "Alterar senha")}
                            </Text>
                        </Pressable>

                        <Pressable onPress={excluirConta} style={[globalStyles.button, t.btnDangerOutline]}>
                            <Text style={[globalStyles.buttonText, t.btnDangerOutlineText]}>
                                {i18nT("home.deleteAccount", "Excluir Conta")}
                            </Text>
                        </Pressable>

                        {/* 🔔 Notificações - teste (mantidos) */}
                        <Pressable onPress={notificarAgora} style={[globalStyles.button, t.btnPrimary]}>
                            <Text style={[globalStyles.buttonText, t.btnPrimaryText]}>
                                {i18nT("home.notifyNow", "Notificação (agora)")}
                            </Text>
                        </Pressable>

                        <Pressable onPress={notificarEm10s} style={[globalStyles.button, t.btnWarning]}>
                            <Text style={[globalStyles.buttonText, t.btnWarningText]}>
                                {i18nT("home.notifyIn10s", "Notificação em 10s")}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Botões de idioma (iguais ao index.tsx / cadastro / alterar senha) */}
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

                    {/* Rodapé */}
                    <View style={globalStyles.homeFooter}>
                        <ThemeToggleButton />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/* =========================
   Componentes
========================= */
type TileProps = {
    label: string;
    onPress: () => void;
    Icon: React.ComponentType;
    count?: number;
    t: ReturnType<typeof themedStyles>;
};

function Tile({ label, count, onPress, Icon, t }: TileProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [globalStyles.homeTile, t.homeTileSurface, pressed && t.homeTilePressed]}
        >
            <View style={globalStyles.homeTileIconWrap}>
                <Icon />
            </View>
            {Number.isFinite(count as number) && (
                <Text style={[globalStyles.homeTileCount, t.homeTileText]}>{count}</Text>
            )}
            <Text style={[globalStyles.homeTileLabel, t.homeTileText]}>{label}</Text>
        </Pressable>
    );
}
