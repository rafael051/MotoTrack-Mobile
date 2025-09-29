// src/utils/montarParametrosMotoTrack.ts

/**
 * Normaliza datas para ISO (yyyy-mm-ddTHH:mm:ss.sssZ) ou yyyy-mm-dd quando possível.
 */
function toISO(input?: string | Date): string | undefined {
    if (!input) return undefined;
    const d = input instanceof Date ? input : new Date(String(input).replace(/\//g, "-"));
    return isNaN(+d) ? undefined : d.toISOString();
}

/**
 * Remove chaves com valores undefined/null/"" (útil para limpar params).
 */
function compact(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
}

/* ================================
   Motos
   fields possíveis: placa, modelo, marca, ano, status
   paginação/ordem: limit, offset, sort
   ================================ */
export type FiltroMotos = {
    placa?: string;
    modelo?: string;
    marca?: string;
    ano?: number | string;
    status?: string;
    limit?: number;
    offset?: number;
    sort?: string; // ex: "ano,desc"
};

export function montarParamsMotos(f: FiltroMotos = {}) {
    return compact({
        placa: f.placa,
        modelo: f.modelo,
        marca: f.marca,
        ano: f.ano,
        status: f.status,
        limit: f.limit,
        offset: f.offset,
        sort: f.sort,
    });
}

/* ================================
   Filiais
   fields: nome, cidade, estado
   ================================ */
export type FiltroFiliais = {
    nome?: string;
    cidade?: string;
    estado?: string;
    limit?: number;
    offset?: number;
    sort?: string;
};

export function montarParamsFiliais(f: FiltroFiliais = {}) {
    return compact({
        nome: f.nome,
        cidade: f.cidade,
        estado: f.estado,
        limit: f.limit,
        offset: f.offset,
        sort: f.sort,
    });
}

/* ================================
   Agendamentos
   fields: status, dataInicio, dataFim (range)
   ================================ */
export type FiltroAgendamentos = {
    status?: string;
    dataInicio?: string | Date;
    dataFim?: string | Date;
    limit?: number;
    offset?: number;
    sort?: string;
};

export function montarParamsAgendamentos(f: FiltroAgendamentos = {}) {
    return compact({
        status: f.status,
        dataInicio: toISO(f.dataInicio),
        dataFim: toISO(f.dataFim),
        limit: f.limit,
        offset: f.offset,
        sort: f.sort,
    });
}

/* ================================
   Eventos
   fields: tipo, localizacao, dataInicio, dataFim
   ================================ */
export type FiltroEventos = {
    tipo?: string;
    localizacao?: string;
    dataInicio?: string | Date;
    dataFim?: string | Date;
    limit?: number;
    offset?: number;
    sort?: string;
};

export function montarParamsEventos(f: FiltroEventos = {}) {
    return compact({
        tipo: f.tipo,
        localizacao: f.localizacao,
        dataInicio: toISO(f.dataInicio),
        dataFim: toISO(f.dataFim),
        limit: f.limit,
        offset: f.offset,
        sort: f.sort,
    });
}

/* ================================
   Usuários
   fields: nome, email, perfil
   ================================ */
export type FiltroUsuarios = {
    nome?: string;
    email?: string;
    perfil?: string;
    limit?: number;
    offset?: number;
    sort?: string;
};

export function montarParamsUsuarios(f: FiltroUsuarios = {}) {
    return compact({
        nome: f.nome,
        email: f.email,
        perfil: f.perfil,
        limit: f.limit,
        offset: f.offset,
        sort: f.sort,
    });
}
