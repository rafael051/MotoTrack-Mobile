import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";
import globalStyles from "../styles/globalStyles";

/* ============================================================
🎨 ThemeToggleButton
------------------------------------------------------------
Botão responsável por alternar entre tema claro/escuro.

- Usa `useTheme()` para acessar:
  • toggleTheme → função que alterna o tema
  • colors      → paleta dinâmica do tema atual

- Estilos visuais fixos (padding, borda, fonte)
  ficam centralizados em `globalStyles`
- Estilos de cor (fundo e texto) vêm do ThemeContext
============================================================ */

export default function ThemeToggleButton() {
    const { toggleTheme, colors } = useTheme();

    return (
        <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: colors.button }]}
            onPress={toggleTheme}
        >
            <Text style={[globalStyles.buttonText, { color: colors.buttonText }]}>
                Alternar Tema
            </Text>
        </TouchableOpacity>
    );
}
