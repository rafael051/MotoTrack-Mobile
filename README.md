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

## 🗂️ Estrutura de Diretórios

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
```

---

## 🚀 Como Executar o Projeto

### 📌 Pré-requisitos

- **Node.js** (versão LTS)
- **npm** ou **yarn**
- **Expo CLI** instalado globalmente:

```bash
npm install -g expo-cli
```

- Aplicativo **Expo Go** no smartphone (iOS ou Android).

---

### 🛠️ Execução Passo a Passo

1. **Clone o repositório:**

```bash
git clone <URL do repositório>
cd mototrack
```

2. **Instale as dependências:**

**Usando npm:**

```bash
npm install
```

**Ou usando yarn:**

```bash
yarn install
```

3. **Execute o projeto:**

**Usando npx:**

```bash
npx expo start
```

**Ou diretamente com Expo CLI:**

```bash
expo start
```

4. **Abra no dispositivo móvel:**

- Abra o aplicativo **Expo Go** no smartphone.
- Escaneie o QR Code exibido no terminal.

---

## ⚙️ Tecnologias Utilizadas

| Tecnologia       | Descrição                                     |
| ---------------- | --------------------------------------------- |
| React Native     | Desenvolvimento de aplicativos móveis         |
| Expo             | Plataforma para criação rápida de apps        |
| React Navigation | Gerenciamento da navegação entre telas        |
| AsyncStorage     | Armazenamento persistente local de dados      |

---

## 🔧 Decisões de Arquitetura

- Separação clara entre lógica (**componentes e telas**) e **estilos**.
- Utilização do **Stack Navigator** para navegação eficiente.
- Componentização para reuso e manutenção facilitada.
- Estilização modular com `StyleSheet`.
- Persistência de dados com `AsyncStorage`.

---

## 📦 Dependências Principais

```json
"dependencies": {
  "@react-navigation/native": "^6.x.x",
  "@react-navigation/native-stack": "^6.x.x",
  "@react-native-async-storage/async-storage": "^1.x.x",
  "react-native-screens": "~3.x.x",
  "react-native-safe-area-context": "4.x.x",
  "react": "18.x.x",
  "react-native": "0.73.x",
  "expo": "^50.x.x"
}
```

*(Versões podem variar.)*

---

## ✅ Boas Práticas Adotadas

- Uso extensivo de **hooks** (`useState`, `useEffect`) para gerenciamento de estado.
- **Validação de formulários** antes do armazenamento.
- **Centralização de estilos** (`globalStyles.js`) para padronização.
- Componentização para reuso e clareza.
- Tratamento robusto e preventivo de **erros**.

---

## 🚩 Possíveis Melhorias Futuras

- Integração com serviços em nuvem (**Firebase**, **Supabase**).
- Implementação de **geolocalização** com `expo-location`.
- Autenticação e controle de acesso.
- Validação avançada com **Yup** e **React Hook Form**.
- Testes automatizados com **Jest**.

---
