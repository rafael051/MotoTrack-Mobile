import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";
import globalStyles from "../styles/globalStyles";

/* ============================================================
🔘 ThemeToggleButton
------------------------------------------------------------
Botão para alternar entre temas (claro/escuro).

- Estilos fixos → definidos em globalStyles (padding, borda, fonte)
- Estilos dinâmicos → fornecidos pelo ThemeContext (cores)

📌 Uso:
<ThemeToggleButton />
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
