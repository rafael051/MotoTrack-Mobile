// ============================================================
// 🌐 Firebase Configuration
// ------------------------------------------------------------
// Este arquivo centraliza a configuração e inicialização do
// Firebase para o projeto MotoTrack Mobile.
//
// 📌 Escopo atual: Apenas o módulo de Autenticação (Auth)
// - Não estamos utilizando Firestore (banco de dados)
// - Não estamos utilizando Storage (armazenamento)
// - Fácil de expandir futuramente, se necessário
//
// 🔐 Dica de segurança:
// Nunca exponha sua apiKey em código público sem restrições
// adicionais. Se este projeto for publicado no GitHub,
// considere usar variáveis de ambiente com o dotenv ou
// secrets do Expo.
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ============================================================
// 🔧 Configuração do Firebase
// ------------------------------------------------------------
// Estes valores são fornecidos pelo Console do Firebase.
// Caminho: Configurações do Projeto > Suas Apps > SDK da Web
//
// ⚠️ ATENÇÃO: Estes dados são sensíveis.
// Em produção, prefira armazenar em variáveis de ambiente.
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyAuocPYATKDjLBaTfpHH-1PgtHcfWnfom8",
    authDomain: "mototrack-8e525.firebaseapp.com",
    projectId: "mototrack-8e525",
    storageBucket: "mototrack-8e525.firebasestorage.app",
    messagingSenderId: "252774218339",
    appId: "1:252774218339:web:b99ddd00bfe9a9ed86d656"
};

// ============================================================
// 🚀 Inicialização do App Firebase
// ------------------------------------------------------------
// - `initializeApp()` conecta o app ao backend do Firebase.
// - Cada projeto deve inicializar apenas UMA vez.
// ============================================================
const app = initializeApp(firebaseConfig);

// ============================================================
// 🔑 Exportando o serviço de Autenticação
// ------------------------------------------------------------
// - O `getAuth(app)` cria uma instância vinculada ao app
// - Usado para Login, Registro, Logout, etc.
// - Exemplo de uso:
//   import { auth } from "@/services/firebaseConfig";
//   signInWithEmailAndPassword(auth, email, senha)
// ============================================================
export const auth = getAuth(app);
