// app/motos/index.tsx
import { Redirect } from "expo-router";

/**
 * 📂 Index de Motos
 * ------------------------------------------------------------
 * Acessando /motos, redireciona para /motos/list.
 */
export default function MotosIndex() {
    return <Redirect href="/motos/list" />;
}
