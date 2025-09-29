// File: src/styles/globalStyles.ts
import { StyleSheet, TextStyle, ViewStyle } from "react-native";

/* ============================================================
🎨 Global Styles — MotoTrack Mobile
------------------------------------------------------------
Centraliza estilos reutilizáveis do app.

📌 Seções:
- Containers
- Inputs
- Botões
- Tipografia
- Cards
- Headers
- Auxiliares
- Home (Dashboard)
- Utilitários (listStyles / formStyles)
============================================================ */

// Tipagem explícita dos estilos principais
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

    // 🔹 Home (Dashboard)
    homeContainer: ViewStyle;
    homeHeader: ViewStyle;
    homeStatusRow: ViewStyle;
    homeStatusDot: ViewStyle;
    homeLinkBtn: ViewStyle;
    homeCardsWrap: ViewStyle;
    homeCard: ViewStyle;
    homeFooter: ViewStyle;
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
        minHeight: 48,              // Material: target mínimo 48dp
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "700",          // mais legibilidade
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

    // ============================
    // 🏠 Home (Dashboard)
    // ============================
    homeContainer: { flex: 1, paddingHorizontal: 16, gap: 12 },
    homeHeader: { marginTop: 12, gap: 4 },
    homeStatusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" },
    homeStatusDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1 },
    homeLinkBtn: { paddingHorizontal: 4, paddingVertical: 2 },
    homeCardsWrap: { flexDirection: "row", gap: 12, marginTop: 12, flexWrap: "wrap" },
    homeCard: { flex: 1, minWidth: 150, padding: 12, borderWidth: 1, borderRadius: 12 },
    homeFooter: { paddingBottom: 16, alignItems: "center" },
});

export default globalStyles;

/* ============================================================
🧰 Utilitários para List & Form (append-only)
------------------------------------------------------------
Use para padronizar listas e formulários.
Ex.: style={[listStyles.cardOutlined, { backgroundColor: colors.surface, borderColor: colors.border }]}
============================================================ */

export const listStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    cardOutlined: {
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        // Defina backgroundColor/borderColor via tema no componente
    },
    rowItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderWidth: 1,
        borderRadius: 12,
        // Defina backgroundColor/borderColor via tema no componente
    },
    smallBtn: {
        minHeight: 40,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    smallBtnDanger: {
        minHeight: 40,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export const formStyles = StyleSheet.create({
    card: {
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
    },
    dangerBtn: {
        minHeight: 48,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
    },
});
