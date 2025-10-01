// app/agendamentos/index.tsx
import { Redirect } from "expo-router";

/**
 * Quando acessar /agendamentos, redireciona para /agendamentos/list.
 */
export default function AgendamentosIndex() {
    return <Redirect href="/agendamentos/list" />;
}
