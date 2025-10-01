# 🏍️ MotoTrack Mobile - Gestão Inteligente e Mapeamento de Motos

---

## 🎯 Descrição do Projeto

O **MotoTrack Mobile** é um aplicativo desenvolvido em **React Native + Expo Router**, como parte da disciplina **Mobile Application Development (FIAP 2025)**.  
O sistema tem como objetivo oferecer um **mapeamento inteligente e gestão de motos em pátios**, permitindo o controle completo de ativos, filiais, agendamentos, eventos e usuários.

### ✨ Destaques do Projeto
- Dashboard (Home) moderno com **tiles padronizados** para cada módulo.
- CRUD completo para **Motos, Filiais, Agendamentos, Eventos e Usuários**.
- Tela **Sobre**, apresentando informações do projeto, tecnologias e desenvolvedores.
- Suporte a **tema claro/escuro** via `ThemeContext`.
- Integração com **Firebase Auth** para autenticação.
- **AsyncStorage** para persistência local de preferências.
- **Estilos centralizados** com `globalStyles` e variantes de tema em `themedStyles`.

---

## 👥 Desenvolvedores

- 👨‍💻 **Rafael Rodrigues de Almeida** — RM: 557837
- 👨‍💻 **Lucas Kenji Miyahira** — RM: 555368

---

## ✅ Funcionalidades Implementadas

- **Home (Dashboard):**
    - Grid responsivo de módulos com ícones e contadores dinâmicos.
    - Acesso rápido a Motos, Filiais, Agendamentos, Eventos, Usuários e Sobre.

- **CRUD Completo:**
    - Cadastro, listagem, atualização e exclusão de entidades.
    - Validações robustas (placa, UF, CEP, e-mail).

- **Gestão de Usuários:**
    - Cadastro com perfis (Operador, Gestor, Administrador).
    - Alteração de senha, logoff e exclusão de conta.

- **Tela Sobre:**
    - Informações institucionais do projeto.
    - Lista de tecnologias utilizadas.
    - Créditos dos desenvolvedores.

---

## 🆕 Últimas Atualizações

**Commit:** `feat(mobile): nova tela Sobre e grid padronizado na Home`  
**Data:** 2025-10-01

- Tela **Sobre** refeita com uso de `globalStyles/themedStyles`.
- Grid/tiles da Home movidos para `globalStyles` (`homeGrid`, `homeTile*`).
- Ícones específicos por módulo (Motos, Filiais, Agendamentos, Eventos, Usuários, Sobre).
- Novos utilitários adicionados em `mototrack.ts`:
    - `fmtDateTime()`
    - `pickAgendamentoDate()`
    - `pickEventoDate()`
    - `getApiBase()`
    - `newAbort(ms)`

---

## 🗂️ Estrutura do Projeto

```plaintext
app/
├── home/
│   └── index.tsx          # Dashboard (grid/tiles)
├── sobre/
│   └── index.tsx          # Tela Sobre
├── motos/                 # CRUD de motos
├── filiais/               # CRUD de filiais
├── agendamentos/          # CRUD de agendamentos
├── eventos/               # CRUD de eventos
└── usuarios/              # CRUD de usuários

src/
├── components/
│   └── ThemeToggleButton.tsx
├── context/
│   └── ThemeContext.tsx
├── services/
│   └── mototrack.ts       # Cliente Axios + utils (datas, aborts, formatadores)
└── styles/
    └── globalStyles.ts    # Estilos globais e temáticos
```

---

## 🚀 Como Executar o Projeto

### 📌 Pré-requisitos
- Node.js (LTS)
- npm ou yarn
- Expo CLI
- Aplicativo **Expo Go** (Android/iOS)

### 🛠️ Passos
```bash
# Clonar o repositório
git clone <URL_REPO>
cd mototrack

# Instalar dependências
npm install

# Executar
npx expo start
```

Se quiser apontar para outra API:
```bash
EXPO_PUBLIC_API_BASE=http://10.0.2.2:5267 npx expo start
```

---

## ⚙️ Tecnologias Utilizadas

- **React Native** — base para apps móveis.
- **Expo Router** — navegação moderna.
- **TypeScript** — tipagem estática.
- **Axios** — cliente HTTP.
- **Firebase Auth** — autenticação.
- **AsyncStorage** — armazenamento local.
- **ThemeContext** — tema claro/escuro.
- **Vector Icons (Feather/MaterialCommunityIcons)** — ícones nos módulos.

---

## 🔧 Arquitetura & Boas Práticas

- Separação entre **telas, serviços, contextos e estilos**.
- Estilos globais (`globalStyles.ts`) com variantes dependentes de tema (`themedStyles`).
- Reutilização de componentes (ex.: `ThemeToggleButton`).
- `mototrack.ts` centraliza todos os **CRUDs e utilitários** (datas, abort, formatadores).
- Uso extensivo de **hooks** (`useState`, `useEffect`, `useCallback`, `useMemo`).

---

## 📦 Dependências Principais

```json
"dependencies": {
  "@expo/vector-icons": "^13.x.x",
  "@react-navigation/native": "^6.x.x",
  "@react-native-async-storage/async-storage": "^1.x.x",
  "axios": "^1.x.x",
  "expo": "^52.x.x",
  "expo-router": "^3.x.x",
  "firebase": "^10.x.x",
  "react": "18.x.x",
  "react-native": "0.73.x"
}
```

*(Versões podem variar)*

---

## 🚩 Melhorias Futuras

- Geolocalização em tempo real (`expo-location`).
- Push notifications.
- Autenticação avançada (roles, permissões).
- Testes automatizados (Jest).
- Deploy contínuo com CI/CD (GitHub Actions).

---

## 📜 Licença

Este aplicativo foi desenvolvido exclusivamente para fins acadêmicos na disciplina **Mobile Application Development – FIAP 2025**.
