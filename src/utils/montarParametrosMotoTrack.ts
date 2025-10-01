// src/utils/montarParametrosMotoTrack.ts

/**
 * Compacta objeto removendo undefined/null/""
 */
function compact(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
}

/* ============================================================================
   Datas no padrão PT-BR esperado pela API
   - Sempre "dd/MM/yyyy HH:mm:ss" para filtros com hora
   - Se só houver data, use "dd/MM/yyyy"
   ============================================================================ */

const pad2 = (v: number | string) => String(v).padStart(2, "0");
const pad4 = (v: number | string) => String(v).padStart(4, "0");

/** Tenta criar um Date a partir de:
 *  - Date
 *  - "dd/MM/yyyy HH:mm[:ss]"
 *  - "dd/MM/yyyy"
 *  - Qualquer string parseável pelo JS Date (fallback)
 */
function toDateSafe(input?: string | Date): Date | undefined {
    if (!input) return undefined;
    if (input instanceof Date) return isNaN(+input) ? undefined : input;

    const s = String(input).trim();

    // dd/MM/yyyy HH:mm[:ss]
    const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m1) {
        const [, dd, mm, yyyy, HH, MI, SS = "00"] = m1;
        const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(HH), Number(MI), Number(SS));
        return isNaN(+d) ? undefined : d;
    }

    // dd/MM/yyyy
    const m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m2) {
        const [, dd, mm, yyyy] = m2;
        const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 0, 0, 0);
        return isNaN(+d) ? undefined : d;
    }

    // Fallback: deixar o JS tentar
    const d = new Date(s);
    return isNaN(+d) ? undefined : d;
}

/** Formata para "dd/MM/yyyy" */
function toPtBrDate(input?: string | Date): string | undefined {
    const d = toDateSafe(input);
    if (!d) return undefined;
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${pad4(d.getFullYear())}`;
}

/** Formata para "dd/MM/yyyy HH:mm:ss"
 *  (se segundos ausentes, completa com :00)
 */
function toPtBrDateTime(input?: string | Date): string | undefined {
    const d = toDateSafe(input);
    if (!d) return undefined;
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${pad4(d.getFullYear())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
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
   Lista (GET /api/Agendamentos) retorna: id, motoId, dataAgendada, descricao
   Filtros sugeridos: motoId, descricao, dataInicio, dataFim
   (datas em PT-BR "dd/MM/yyyy HH:mm:ss")
   ================================ */
export type FiltroAgendamentos = {
    motoId?: number | string;
    descricao?: string;
    dataInicio?: string | Date; // início do range (PT-BR)
    dataFim?: string | Date;    // fim do range (PT-BR)
    limit?: number;
    offset?: number;
    sort?: string;
};

export function montarParamsAgendamentos(f: FiltroAgendamentos = {}) {
    return compact({
        motoId: f.motoId,
        descricao: f.descricao,
        dataInicio: toPtBrDateTime(f.dataInicio),
        dataFim: toPtBrDateTime(f.dataFim),
        limit: f.limit,
        offset: f.offset,
        sort: f.sort,
    });
}

/* ================================
   Eventos
   fields: tipo, localizacao, dataInicio, dataFim
   (datas em PT-BR "dd/MM/yyyy HH:mm:ss")
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
        dataInicio: toPtBrDateTime(f.dataInicio),
        dataFim: toPtBrDateTime(f.dataFim),
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

// Exports utilitários (se precisar em outros pontos)
export const DateUtilsPtBr = {
    toDateSafe,
    toPtBrDate,
    toPtBrDateTime,
};
