// File: app/eventos/index.tsx
import { Redirect } from "expo-router";

/**
 * Alias de rota:
 * Ao acessar /eventos, o usuário é redirecionado automaticamente
 * para /eventos/list, garantindo navegação fluida e evitando tela em branco.
 */
export default function EventosIndex() {
    return <Redirect href="/eventos/list" />;
}
