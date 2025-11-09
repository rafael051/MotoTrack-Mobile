// app/agendamentos/index.tsx
import { Redirect } from "expo-router";

/**
 * Alias de rota:
 * Ao acessar /agendamentos, redireciona imediatamente para /agendamentos/list
 * usando replace (sem poluir o histórico).
 */
export default function AgendamentosIndex() {
    return <Redirect href="/agendamentos/list" />;
}
