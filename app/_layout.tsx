import { Stack } from "expo-router";
import ThemeProvider from "../src/context/ThemeContext";
import i18n from "../src/services/i18n";
import { I18nextProvider } from "react-i18next";

/* ============================================================
🗂️ Arquivo: Layout (app/_layout.tsx)
------------------------------------------------------------
Este arquivo define a estrutura global do app utilizando o
Expo Router. Ele envolve todas as telas com provedores
(contextos) necessários para manter:

1. 🌍 Internacionalização (i18n)
   - Fornecida pelo `react-i18next`
   - Permite trocar idioma dinamicamente
   - Todas as telas têm acesso às traduções

2. 🎨 Tema (ThemeProvider)
   - Contexto customizado para alternar entre
     tema claro e escuro
   - Garantia de consistência visual em todas as telas

3. 📱 Navegação (Stack do Expo Router)
   - Estrutura de pilha para navegação
   - `headerShown: false` → remove cabeçalho padrão
   - Cada tela define seu próprio header se necessário
============================================================ */

export default function Layout() {
    return (
        // 🌍 Provedor de internacionalização
        <I18nextProvider i18n={i18n}>

            {/* 🎨 Provedor de tema (claro/escuro) */}
            <ThemeProvider>

                {/* 📱 Stack de navegação sem cabeçalho */}
                <Stack screenOptions={{ headerShown: false }} />

            </ThemeProvider>
        </I18nextProvider>
    );
}