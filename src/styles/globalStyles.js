import { StyleSheet } from "react-native";

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
============================================================ */

export default StyleSheet.create({
    // ============================
    // 📦 Containers
    // ============================
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#f2f2f2",
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
        color: "#444",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        fontSize: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    // ============================
    // 🔘 Botões
    // ============================
    button: {
        marginVertical: 14,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: "#2563EB", // Azul vibrante
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.5,
    },

    // ============================
    // 🔤 Tipografia
    // ============================
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        color: "#111",
    },
    text: {
        fontSize: 16,
        color: "#333",
        lineHeight: 22,
    },

    // ============================
    // 🃏 Cards
    // ============================
    card: {
        backgroundColor: "#fff",
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
        color: "#111",
    },
    cardModelo: {
        fontSize: 15,
        color: "#555",
        marginBottom: 4,
    },

    // ============================
    // 📑 Headers
    // ============================
    header: {
        backgroundColor: "#2563EB",
    },
    headerTitle: {
        fontWeight: "700",
        fontSize: 20,
        color: "#fff",
    },
});
