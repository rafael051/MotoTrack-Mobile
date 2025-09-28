import { StyleSheet, TextStyle, ViewStyle } from "react-native";

/* ============================================================
🎨 Global Styles
------------------------------------------------------------
Centraliza estilos reutilizáveis do app MotoTrack Mobile.

📌 Estrutura organizada por seções:
- Containers
- Inputs
- Botões
- Tipografia
- Cards
- Headers
- Auxiliares
============================================================ */

// Tipagem explícita dos estilos
interface GlobalStyles {
    container: ViewStyle;
    inputContainer: ViewStyle;
    inputLabel: TextStyle;
    input: TextStyle & ViewStyle;
    button: ViewStyle;
    buttonText: TextStyle;
    title: TextStyle;
    text: TextStyle;
    card: ViewStyle;
    cardPlaca: TextStyle;
    cardModelo: TextStyle;
    header: ViewStyle;
    headerTitle: TextStyle;
    rowCenter: ViewStyle;
    link: TextStyle;
    forgotPassword: TextStyle;

    // ➕ novos estilos adicionados
    authContainer: ViewStyle;
    langButton: ViewStyle;
    langText: TextStyle;
}

const globalStyles = StyleSheet.create<GlobalStyles>({
    // ============================
    // 📦 Containers
    // ============================
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center", // Centraliza vertical
    },
    authContainer: {
        width: "100%",
        maxWidth: 380,
        alignSelf: "center",
    },

    // ============================
    // ✏️ Inputs
    // ============================
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        marginBottom: 6,
        fontWeight: "600",
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 14,
    },

    // ============================
    // 🔘 Botões
    // ============================
    button: {
        marginVertical: 14,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.5,
    },

    // 🔘 Botões de idioma
    rowCenter: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15,
        gap: 12,
    },
    langButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 50,
    },
    langText: {
        fontWeight: "700",
        fontSize: 14,
        color: "#fff",
    },

    // ============================
    // 🔤 Tipografia
    // ============================
    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
    },
    text: {
        fontSize: 16,
        lineHeight: 22,
    },

    // ============================
    // 🃏 Cards
    // ============================
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    cardPlaca: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6,
    },
    cardModelo: {
        fontSize: 15,
        marginBottom: 4,
    },

    // ============================
    // 📑 Headers
    // ============================
    header: {
        height: 56,
        justifyContent: "center",
        paddingHorizontal: 16,
        elevation: 4,
    },
    headerTitle: {
        fontWeight: "700",
        fontSize: 20,
    },

    // ============================
    // 🌐 Auxiliares
    // ============================
    link: {
        marginTop: 20,
        alignSelf: "center",
        fontSize: 14,
        textDecorationLine: "underline",
    },
    forgotPassword: {
        marginTop: 20,
        alignSelf: "center",
        fontSize: 14,
    },
});

export default globalStyles;
