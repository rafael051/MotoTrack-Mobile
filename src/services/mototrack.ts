// src/services/mototrack.ts
import axios, { AxiosRequestConfig } from "axios";
import {
    montarParamsMotos, type FiltroMotos,
    montarParamsFiliais, type FiltroFiliais,
    montarParamsAgendamentos, type FiltroAgendamentos,
    montarParamsEventos, type FiltroEventos,
    montarParamsUsuarios, type FiltroUsuarios,
} from "../utils/montarParametrosMotoTrack";

/**
 * 🌐 Base da API
 * - iOS/Web:        http://localhost:5267
 * - Android Emul.:  http://10.0.2.2:5267
 * - Dispositivo:    http://SEU_IP_LAN:5267
 * EXPO_PUBLIC_API_BASE tem prioridade.
 */
let API_BASE = (process.env.EXPO_PUBLIC_API_BASE?.trim() || "http://localhost:5267");

/** Permite trocar a base em runtime */
export function setApiBase(url: string) {
    API_BASE = url;
    api.defaults.baseURL = url;
}

/** Cliente axios */
export const api = axios.create({
    baseURL: API_BASE,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    // timeout: 10000,
});

/** Aceitar AbortController.signal sem quebrar spread */
type Cfg = { signal?: AbortSignal };
const withSignal = (c?: Cfg): AxiosRequestConfig => (c?.signal ? { signal: c.signal as any } : {});

/** Helpers HTTP enxutos */
const get = async <T>(url: string, params?: any, c?: Cfg): Promise<T> =>
    api.get<T>(url, { ...withSignal(c), params }).then(r => r.data);

const post = async <T>(url: string, data?: any, c?: Cfg): Promise<T> =>
    api.post<T>(url, data, withSignal(c)).then(r => r.data);

const put = async (url: string, data?: any, c?: Cfg): Promise<void> =>
    api.put(url, data, withSignal(c)).then(() => { /* sem body */ });

const del = async (url: string, c?: Cfg): Promise<void> =>
    api.delete(url, withSignal(c)).then(() => { /* sem body */ });

/* ============================
   Tipos principais (OpenAPI)
   ============================ */
export type Agendamento = { id: number; dataHora: string; status?: string | null };
export type Evento = { id: number; tipo?: string | null; dataHora: string; motivo?: string | null; localizacao?: string | null };
export type Filial = { id: number; nome?: string | null; endereco?: string | null; bairro?: string | null; cidade?: string | null; estado?: string | null; cep?: string | null; latitude?: number; longitude?: number };
export type Moto = { id: number; placa?: string | null; modelo?: string | null; marca?: string | null; ano?: number; status?: string | null };
export type Usuario = { id: number; nome?: string | null; email?: string | null; perfil?: string | null };

/** Payloads (POST/PUT) */
export type AgendamentoCreate = Omit<Agendamento, "id">;
export type AgendamentoUpdate = Partial<Omit<Agendamento, "id">>;
export type EventoCreate = Omit<Evento, "id">;
export type EventoUpdate = Partial<Omit<Evento, "id">>;
export type FilialCreate = Omit<Filial, "id">;
export type FilialUpdate = Partial<Omit<Filial, "id">>;
export type MotoCreate = Omit<Moto, "id">;
export type MotoUpdate = Partial<Omit<Moto, "id">>;
export type UsuarioCreate = Omit<Usuario, "id">;
export type UsuarioUpdate = Partial<Omit<Usuario, "id">>;

/* ============================================================
 * Utils de formatação
 * ============================================================ */
export function formatarData(data?: string | Date): string {
    if (!data) return "Não informado";
    try {
        const raw = typeof data === "string" ? data : data.toISOString();
        const date = new Date(String(raw).replace(/\//g, "-"));
        if (isNaN(+date)) return "Data inválida";
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    } catch {
        return "Data inválida";
    }
}
export function formatarHora(data?: string | Date): string {
    if (!data) return "Não informado";
    const date = new Date(data);
    if (isNaN(+date)) return "Hora inválida";
    const h = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${mi}`;
}
export function formatarDataHora(data?: string | Date): string {
    return `${formatarData(data)} às ${formatarHora(data)}`;
}
export function formatarAnoMes(data?: string | Date): string {
    if (!data) return "Não informado";
    const date = new Date(data);
    if (isNaN(+date)) return "Data inválida";
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${y}/${m}`;
}
export function capitalizarTexto(texto?: string): string {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}
export function formatarValor(valor?: number | string | null): string {
    if (valor === null || valor === undefined || isNaN(Number(valor))) return "N/A";
    return Number(valor).toFixed(2).replace(".", ",");
}

/* ============================================================
 * Serviço MotoTrack — buscarX + CRUD
 * ============================================================ */
export const MotoTrack = {
    // ------------ Motos ------------
    buscarMotos(filtros: FiltroMotos = {}, c?: Cfg): Promise<Moto[]> {
        return get<Moto[]>("/api/Motos", montarParamsMotos(filtros), c);
    },
    getMoto(id: number, c?: Cfg) {
        return get<Moto>(`/api/Motos/${id}`, undefined, c);
    },
    createMoto(data: MotoCreate, c?: Cfg) {
        return post<Moto>("/api/Motos", data, c);
    },
    updateMoto(id: number, data: MotoUpdate | Moto, c?: Cfg) {
        return put(`/api/Motos/${id}`, data, c);
    },
    deleteMoto(id: number, c?: Cfg) {
        return del(`/api/Motos/${id}`, c);
    },

    // ------------ Filiais ------------
    buscarFiliais(filtros: FiltroFiliais = {}, c?: Cfg): Promise<Filial[]> {
        return get<Filial[]>("/api/Filiais", montarParamsFiliais(filtros), c);
    },
    getFilial(id: number, c?: Cfg) {
        return get<Filial>(`/api/Filiais/${id}`, undefined, c);
    },
    createFilial(data: FilialCreate, c?: Cfg) {
        return post<Filial>("/api/Filiais", data, c);
    },
    updateFilial(id: number, data: FilialUpdate | Filial, c?: Cfg) {
        return put(`/api/Filiais/${id}`, data, c);
    },
    deleteFilial(id: number, c?: Cfg) {
        return del(`/api/Filiais/${id}`, c);
    },

    // -------- Agendamentos ----------
    buscarAgendamentos(filtros: FiltroAgendamentos = {}, c?: Cfg): Promise<Agendamento[]> {
        return get<Agendamento[]>("/api/Agendamentos", montarParamsAgendamentos(filtros), c);
    },
    /** Alias para compatibilizar com a tela */
    getAgendamentos(c?: Cfg): Promise<Agendamento[]> {
        return MotoTrack.buscarAgendamentos({}, c);
    },
    getAgendamento(id: number, c?: Cfg) {
        return get<Agendamento>(`/api/Agendamentos/${id}`, undefined, c);
    },
    createAgendamento(data: AgendamentoCreate, c?: Cfg) {
        return post<Agendamento>("/api/Agendamentos", data, c);
    },
    updateAgendamento(id: number, data: AgendamentoUpdate | Agendamento, c?: Cfg) {
        return put(`/api/Agendamentos/${id}`, data, c);
    },
    deleteAgendamento(id: number, c?: Cfg) {
        return del(`/api/Agendamentos/${id}`, c);
    },

    // ------------- Eventos -----------
    buscarEventos(filtros: FiltroEventos = {}, c?: Cfg): Promise<Evento[]> {
        return get<Evento[]>("/api/Eventos", montarParamsEventos(filtros), c);
    },
    getEvento(id: number, c?: Cfg) {
        return get<Evento>(`/api/Eventos/${id}`, undefined, c);
    },
    createEvento(data: EventoCreate, c?: Cfg) {
        return post<Evento>("/api/Eventos", data, c);
    },
    updateEvento(id: number, data: EventoUpdate | Evento, c?: Cfg) {
        return put(`/api/Eventos/${id}`, data, c);
    },
    deleteEvento(id: number, c?: Cfg) {
        return del(`/api/Eventos/${id}`, c);
    },

    // ------------- Usuários ----------
    buscarUsuarios(filtros: FiltroUsuarios = {}, c?: Cfg): Promise<Usuario[]> {
        return get<Usuario[]>("/api/Usuarios", montarParamsUsuarios(filtros), c);
    },
    getUsuario(id: number, c?: Cfg) {
        return get<Usuario>(`/api/Usuarios/${id}`, undefined, c);
    },
    createUsuario(data: UsuarioCreate, c?: Cfg) {
        return post<Usuario>("/api/Usuarios", data, c);
    },
    updateUsuario(id: number, data: UsuarioUpdate | Usuario, c?: Cfg) {
        return put(`/api/Usuarios/${id}`, data, c);
    },
    deleteUsuario(id: number, c?: Cfg) {
        return del(`/api/Usuarios/${id}`, c);
    },
};
