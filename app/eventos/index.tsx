// File: app/eventos/index.tsx
import { Redirect } from "expo-router";

export default function EventosIndex() {
    // redireciona automaticamente para a lista
    return <Redirect href="/eventos/list" />;
}
