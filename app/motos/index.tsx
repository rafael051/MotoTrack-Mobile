// File: app/motos/index.tsx
import { Redirect } from "expo-router";

/**
 * Alias de rota:
 * Ao acessar /motos, o usuário é automaticamente redirecionado
 * para /motos/list, mantendo a navegação organizada e fluida.
 */
export default function MotosIndex() {
    return <Redirect href="/motos/list" />;
}
