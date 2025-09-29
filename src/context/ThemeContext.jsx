import React, { createContext, useContext, useState } from "react";
import { Appearance } from "react-native";

/* ============================================================
🎨 ThemeContext
------------------------------------------------------------
Gerencia o tema global da aplicação (claro/escuro).

📌 Estrutura:
- Contexto: ThemeContext
- Hook: useTheme() → acesso prático ao tema
- Provider: ThemeProvider → envolve a aplicação

⚡ Recursos:
- Detecta o tema do dispositivo (Appearance)
- Permite alternar manualmente (toggleTheme)
- Fornece paletas de cores específicas para cada tema
============================================================ */

// 🏗️ Criando o contexto global de tema
// - Armazena estado, função toggle e cores dinâmicas
const ThemeContext = createContext()

/* ============================================================
🧩 Hook customizado: useTheme
------------------------------------------------------------
Facilita o acesso ao contexto em qualquer componente.

Exemplo:
const { theme, colors, toggleTheme } = useTheme();
============================================================ */
export function useTheme() {
    return useContext(ThemeContext);
}

/* ============================================================
🌍 ThemeProvider
------------------------------------------------------------
Componente que envolve toda a aplicação.

- Detecta o tema inicial do dispositivo
- Mantém o estado atual do tema
- Fornece função para alternar (toggleTheme)
- Injeta a paleta de cores correta em children
============================================================ */
export default function ThemeProvider({ children }) {
    // 🎨 Detecta automaticamente o tema do sistema (light/dark)
    const colorScheme = Appearance.getColorScheme();

    // 🗂️ Estado que armazena o tema atual
    // - Usa o tema do sistema como inicial, fallback para 'light'
    const [theme, setTheme] = useState(colorScheme || "light");

    // 🔄 Alterna manualmente entre claro e escuro
    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    /* ============================================================
    🌈 Paletas de cores por tema
    ------------------------------------------------------------
    - Cada tema define cores de fundo, texto e botões
    - Essas cores podem ser consumidas em conjunto com globalStyles
    ============================================================ */
    const themeColors = {
        light: {
            background: "#F9FAFB",
            surface: "#FFFFFF",
            text: "#111827",
            button: "#22C55E",
            buttonText: "#FFFFFF",
            buttonSecondary: "#6D28D9",
            buttonSecondaryText: "#FFFFFF",
            accent: "#9333EA",
            border: "#E5E7EB",
            mutedText: "#6B7280",

            // Botões de idioma
            langEnBg: "#22C55E",
            langEnText: "#FFFFFF",
            langPtBg: "#2563EB",
            langPtText: "#FFFFFF",
            langEsBg: "#9333EA",
            langEsText: "#FFFFFF",

            // 👇 adicionados
            ripple: "rgba(0,0,0,0.08)",
            dangerBg: "#7f1d1d",
            dangerBorder: "#ef4444",
        },
        dark: {
            background: "#0B0B0F",
            surface: "#1E1B29",
            text: "#F3F4F6",
            button: "#9333EA",
            buttonText: "#FFFFFF",
            buttonSecondary: "#22C55E",
            buttonSecondaryText: "#111827",
            accent: "#22C55E",
            border: "#4B5563",
            mutedText: "#9CA3AF",

            // Botões de idioma
            langEnBg: "#22C55E",
            langEnText: "#111827",
            langPtBg: "#9333EA",
            langPtText: "#FFFFFF",
            langEsBg: "#d95d28",
            langEsText: "#FFFFFF",

            // 👇 adicionados
            ripple: "rgba(255,255,255,0.08)",
            dangerBg: "#450a0a",
            dangerBorder: "#ef4444",
        },
    };




    // 🚀 Retorna o Provider com valores disponíveis para toda a aplicação
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors: themeColors[theme] }}>
            {children}
        </ThemeContext.Provider>
    );
}
