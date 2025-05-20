# 🏍️ MotoTrack - Gestão Inteligente e Mapeamento de Motos

---

## 🎯 Descrição do Projeto

**MotoTrack** é um aplicativo móvel desenvolvido com **React Native e Expo**, como parte da disciplina **Mobile Application Development**.

O projeto funciona como um sistema de **mapeamento inteligente e gestão de motos**, com funcionalidades que incluem cadastro, listagem, detalhamento, preferências de usuário, armazenamento local e navegação fluida entre telas.

**Objetivos principais:**

- ✅ Navegação eficiente entre múltiplas telas.
- ✅ Manipulação dinâmica de estados com React Hooks.
- ✅ Persistência local segura utilizando `AsyncStorage`.
- ✅ Código modular e organizado com componentes reutilizáveis.
- ✅ Interface clara e intuitiva.

---

## 👥 Integrantes

- **Nome:** Rafael Rodrigues de Almeida  
- **RM:** 557837

*(Caso haja mais integrantes, adicione aqui.)*

---

## ✅ Funcionalidades Implementadas

- ✅ **Navegação entre telas (React Navigation):**
  - Home (menu principal)
  - Cadastro de Moto
  - Listagem de Motos
  - Detalhes da Moto
  - Preferências do Usuário

- ✅ **Formulário interativo** com manipulação de estado (`useState`).

- ✅ **Armazenamento local** persistente com `AsyncStorage`.

- ✅ **Componentes reutilizáveis** (`FormInput`, `MotoCard`).

- ✅ **Estilos modularizados** usando arquivos separados (`globalStyles.js`).

- ✅ **Validação e tratamento adequado de erros**.

---

## 🗂️ Estrutura do Projeto

```plaintext
mototrack/
├── App.jsx
├── app.json
├── babel.config.js
├── package.json
└── src/
    ├── components/
    │   ├── FormInput.jsx
    │   ├── FormInputStyles.js
    │   ├── MotoCard.jsx
    │   └── MotoCardStyles.js
    ├── routes/
    │   └── AppRoutes.jsx
    ├── screens/
    │   ├── HomeScreen.jsx
    │   ├── CadastroMotoScreen.jsx
    │   ├── ListagemMotosScreen.jsx
    │   ├── DetalheMotoScreen.jsx
    │   └── PreferenciasScreen.jsx
    └── styles/
        └── globalStyles.js
