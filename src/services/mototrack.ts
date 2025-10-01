// File: src/services/mototrack.ts
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

/** Consultar a base atual (útil para logs/diagnóstico) */
export function getApiBase() {
    return API_BASE;
}

/** Cliente axios */
export const api = axios.create({
    baseURL: API_BASE,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
});

/** Aceitar AbortController.signal sem quebrar spread */
type Cfg = { signal?: AbortSignal };
const withSignal = (c?: Cfg): AxiosRequestConfig => (c?.signal ? { signal: c.signal as any } : {});

/** Helpers HTTP */
const get = async <T>(url: string, params?: any, c?: Cfg): Promise<T> =>
    api.get<T>(url, { ...withSignal(c), params }).then(r => r.data);

const post = async <T>(url: string, data?: any, c?: Cfg): Promise<T> =>
    api.post<T>(url, data, withSignal(c)).then(r => r.data);

const put = async (url: string, data?: any, c?: Cfg): Promise<void> =>
    api.put(url, data, withSignal(c)).then(() => {});

const del = async (url: string, c?: Cfg): Promise<void> =>
    api.delete(url, withSignal(c)).then(() => {});

/* ============================
   Tipos principais (ALINHADOS AO OpenAPI)
   ============================ */

/** Agendamentos */
export type Agendamento = {
    status: string;
    id: number;
    motoId: number;
    dataAgendada: string;  // "dd/MM/yyyy HH:mm:ss"
    descricao?: string | null;
    dataCriacao?: string | null;
};
export type AgendamentoCreate = {
    motoId: number;
    dataAgendada: string;  // "dd/MM/yyyy HH:mm:ss"
    descricao: string;
};
export type AgendamentoUpdate = {
    dataAgendada: string;  // "dd/MM/yyyy HH:mm:ss"
    descricao: string;
};

/** Eventos */
export type Evento = {
    id: number;
    motoId: number;
    tipo?: string | null;
    motivo?: string | null;
    dataHora: string;      // "dd/MM/yyyy HH:mm:ss"
    localizacao?: string | null;
};
export type EventoCreate = {
    motoId: number;
    tipo: string;
    motivo: string;
    dataHora: string;      // "dd/MM/yyyy HH:mm:ss"
    localizacao?: string | null;
};
export type EventoUpdate = {
    tipo: string;
    motivo: string;
    dataHora: string;      // "dd/MM/yyyy HH:mm:ss"
    localizacao?: string | null;
};

/** Filiais */
export type Filial = {
    id: number;
    nome?: string | null;
    endereco?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null; // UF
    cep?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    raioGeofenceMetros?: number | null;
    /** só em algumas respostas (ex.: GET by id) */
    motoCount?: number | null;
};
export type FilialCreate = {
    nome: string;
    endereco?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    raioGeofenceMetros?: number | null;
};
export type FilialUpdate = FilialCreate;

/** Motos */
export type Moto = {
    id: number;
    placa?: string | null;
    modelo?: string | null;
    marca?: string | null;
    ano?: number | null;
    status?: string | null; // DISPONIVEL | LOCADA | MANUTENCAO
    filialId?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    dataCriacao?: string | null;
};
export type MotoCreate = {
    placa: string;
    modelo: string;
    marca: string;
    ano?: number;
    status: string;
    filialId?: number | null;
    latitude?: number | null;
    longitude?: number | null;
};
export type MotoUpdate = MotoCreate;

/** Usuários */
export type PerfilUsuario = "OPERADOR" | "GESTOR" | "ADMINISTRADOR";
export type Usuario = {
    id: number;
    nome?: string | null;
    email?: string | null;
    perfil?: PerfilUsuario | null;
    filialId?: number | null;
};
export type UsuarioCreate = {
    nome: string;
    email: string;
    senha: string; // apenas no create
    perfil: PerfilUsuario;
    filialId?: number | null;
};
export type UsuarioUpdate = {
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    filialId?: number | null;
};

/* ============================================================
 * Utils de data/hora tolerantes a PT-BR
 * ============================================================ */
const sanitize = (t?: string) => (t ?? "").replace(/[“”"']/g, "").trim();

const tryParsePt = (s: string): Date | null => {
    // dd/MM/yyyy HH:mm[:ss]
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) return null;
    const [, dd, mm, yyyy, HH = "00", MI = "00", SS = "00"] = m;
    const d = new Date(+yyyy, +mm - 1, +dd, +HH, +MI, +SS);
    return isNaN(+d) ? null : d;
};

const asDate = (value?: string | Date | null): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(+value) ? null : value;
    const raw = sanitize(String(value));
    return tryParsePt(raw) ?? (isNaN(+new Date(raw)) ? null : new Date(raw));
};

const pad2 = (n: number) => String(n).padStart(2, "0");
export function formatarData(data?: string | Date): string {
    const d = asDate(data);
    if (!d) return "Não informado";
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}
export function formatarHora(data?: string | Date): string {
    const d = asDate(data);
    if (!d) return "Não informado";
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
export function formatarDataHora(data?: string | Date): string {
    const d = asDate(data);
    if (!d) return "Não informado";
    return `${formatarData(d)} às ${formatarHora(d)}`;
}
export function formatarAnoMes(data?: string | Date): string {
    const d = asDate(data);
    if (!d) return "Não informado";
    return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}`;
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

/** ✅ Aceita ISO e "dd/MM/yyyy HH:mm[:ss]" e devolve `toLocaleString()` ou o original */
export function fmtDateTime(s?: string | null): string {
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
}

/** 🔎 Tolerância a campos de data com nomes diferentes no DTO */
export const pickAgendamentoDate = (a: Agendamento): string | null => {
    // @ts-expect-error — permite chaves opcionais sem quebrar
    return a?.dataHora ?? a?.dataAgendada ?? a?.data ?? a?.inicio ?? null;
};
export const pickEventoDate = (e: Evento): string | null => {
    // @ts-expect-error — idem
    return e?.dataHora ?? e?.data ?? e?.quando ?? null;
};

/** ⏱️ AbortController com timeout embutido (opcional) */
export function newAbort(ms?: number): AbortController {
    const controller = new AbortController();
    if (ms && ms > 0) {
        const t = setTimeout(() => controller.abort(), ms);
        // @ts-ignore – attach para GC se necessário
        controller.__timeout = t;
    }
    return controller;
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
    /** Alias p/ telas (consistência com agendamentos) */
    getFiliais(c?: Cfg): Promise<Filial[]> {
        return this.buscarFiliais({}, c);
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
    /** Alias p/ telas */
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
    /** ✅ Alias para a tela de lista de eventos */
    getEventos(c?: Cfg): Promise<Evento[]> {
        return MotoTrack.buscarEventos({}, c);
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
