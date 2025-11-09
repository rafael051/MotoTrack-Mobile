// File: src/notifications/notificationService.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* =========================
   Tipos genéricos
========================= */
export type Entidade = "MOTO" | "FILIAL" | "AGENDAMENTO" | "EVENTO" | "USUARIO";
export type Acao = "CREATE" | "UPDATE" | "DELETE";

/* =========================
   Inicialização (handler, canal, permissões)
========================= */
export async function initNotifications() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("mototrack-default", {
            name: "MotoTrack",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [250, 250],
            sound: "default",
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
    }

    if (Device.isDevice) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
            await Notifications.requestPermissionsAsync();
        }
    }
}

/* =========================
   Funções universais
========================= */
export async function notifyCRUD(entidade: Entidade, acao: Acao, info?: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: `${entidade} - ${acao}`,
            body: info ?? "Operação concluída com sucesso.",
            data: { type: entidade.toLowerCase(), action: acao.toLowerCase() },
            sound: "default",
        },
        trigger: null, // imediato
    });
}

// salvar/pegar/limpar id de notificação
async function saveNotif(key: string, notifId: string) { await AsyncStorage.setItem(key, notifId); }
async function getNotif(key: string) { return AsyncStorage.getItem(key); }
async function clearNotif(key: string) { await AsyncStorage.removeItem(key); }

/** Agenda lembrete na data, com antecedência (min) */
export async function scheduleReminder(
    keyBase: string, id: number | string, date: Date, minutesBefore = 10,
    titulo = "Lembrete", corpo = "Você tem um compromisso."
) {
    const when = new Date(date.getTime() - minutesBefore * 60 * 1000);
    const triggerDate = when.getTime() > Date.now() ? when : date;

    const notifId = await Notifications.scheduleNotificationAsync({
        content: { title: titulo, body: corpo, data: { type: keyBase, id }, sound: "default" },
        trigger: Platform.OS === "android"
            ? ({ date: triggerDate, channelId: "mototrack-default" } as any)
            : triggerDate,
    });
    await saveNotif(`${keyBase}-${id}`, notifId);
}

export async function cancelReminder(keyBase: string, id: number | string) {
    const key = `${keyBase}-${id}`;
    const prev = await getNotif(key);
    if (prev) {
        await Notifications.cancelScheduledNotificationAsync(prev);
        await clearNotif(key);
    }
}

export async function rescheduleReminder(
    keyBase: string, id: number | string, date: Date, minutesBefore = 10,
    titulo = "Lembrete", corpo = "Você tem um compromisso."
) {
    await cancelReminder(keyBase, id);
    await scheduleReminder(keyBase, id, date, minutesBefore, titulo, corpo);
}

/** Parser tolerante (ISO ou dd/MM/yyyy HH:mm[:ss]) */
export function parsePtOrIso(s: string): Date | null {
    let d = new Date(s);
    if (!isNaN(+d)) return d;
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) return null;
    const [, dd, MM, yyyy, hh = "00", mm = "00", ss = "00"] = m;
    d = new Date(+yyyy, +MM - 1, +dd, +hh, +mm, +ss);
    return isNaN(+d) ? null : d;
}

/** Listener de toque (retorna função de unsubscribe) */
export function addNotificationListener(onNavigate: (data: any) => void) {
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
        onNavigate(resp.notification.request.content.data);
    });
    return () => Notifications.removeNotificationSubscription(sub);
}
