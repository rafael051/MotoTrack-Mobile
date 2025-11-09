# 🏍️ MotoTrack Mobile — Gestão Inteligente e Mapeamento de Motos

Aplicativo desenvolvido em **React Native + Expo Router** para a disciplina **Mobile Application Development (FIAP 2025)**.  
O app oferece **mapeamento inteligente e gestão de motos em pátios**, com controle de **Motos, Filiais, Agendamentos, Eventos e Usuários**, além de **tema claro/escuro**, **autenticação Firebase**, **i18n (PT/ES)** e **notificações**.

---

## ✨ Principais Destaques

- **Dashboard (Home)** com *tiles* padronizados e contadores dinâmicos por módulo.
- **CRUD completo** para **Motos, Filiais, Agendamentos, Eventos e Usuários** (Create/Read/Update/Delete).
- **Tela Sobre** com detalhes do projeto, tecnologias e **hash do commit de referência**.
- **Tema claro/escuro** via `ThemeContext` e estilos centralizados (`globalStyles` + `themedStyles`).
- **Autenticação** via **Firebase Auth**, com persistência local usando **AsyncStorage**.
- **Internacionalização (i18n)** com **Português** e **Espanhol**, com *placeholders* consistentes.
- **Push Notifications** (cenários de criação/alteração/exclusão) e **notificações locais** (lembrete de agendamento).
- **Integração com API** (.NET/Java) com utilitários para base dinâmica, tratamento de erros e *loading states*.

---

## 👥 Integrantes

- **Rafael Rodrigues de Almeida** — RM 557837 — GitHub: [link]
- **Lucas Kenji Miyahira** — RM 555368 — GitHub: [link]

> Preencha os links de GitHub conforme necessário.

---

## ✅ Funcionalidades Entregues (Resumo)

### Home (Dashboard)
- Grade responsiva de módulos com ícones e *badges* de contagem.
- Acesso rápido a Motos, Filiais, Agendamentos, Eventos, Usuários e Sobre.

### CRUDs
- Formulários com **validações** (placa, UF, CEP, e-mail, etc.).
- Feedback de **erro/sucesso** e **indicadores de carregamento**.
- Ações de **inclusão, edição, exclusão** e **listagens paginadas** (quando aplicável).

### Usuários
- Perfis de acesso (Operador, Gestor, Administrador).
- Alterar senha, logoff e exclusão de conta.

### Sobre
- Tecnologias usadas, créditos e **hash do commit atual** (para auditoria de publicação).

### Notificações
- **Push**: cenários realistas, ex.: criação de moto, atualização de filial, exclusão de usuário.
- **Locais (agendamento)**: lembrete próximo à data/hora do compromisso.

---

## 🗂️ Estrutura de Pastas

```plaintext
app/
├── home/
│   └── index.tsx          # Dashboard (grid/tiles)
├── sobre/
│   └── index.tsx          # Tela Sobre (exibe hash de commit e infos do app)
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
│   └── mototrack.ts       # Axios + utils (datas, aborts, formatadores, base dinâmica)
├── styles/
│   └── globalStyles.ts    # Estilos globais e variantes por tema
└── locales/
    ├── pt.json            # Traduções PT-BR
    └── es.json            # Traduções ES
```

---

## ⚙️ Configuração & Execução

### Pré-requisitos
- **Node.js (LTS)** e **npm** ou **yarn**
- **Expo CLI**
- App **Expo Go** (Android/iOS)

### Variáveis de ambiente
Crie um arquivo `.env` (ou use variáveis no shell):
```
EXPO_PUBLIC_API_BASE=http://192.168.18.205:5267
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_APP_ID=...
```
> `EXPO_PUBLIC_API_BASE` pode ser trocada em tempo de execução via utilitário do serviço `mototrack.ts`.

### Endereços úteis por ambiente
- **Android Emulador**: `http://10.0.2.2:5267`
- **iOS/Web**: `http://SEU_IP_LAN:5267` (ou `localhost` quando aplicável)
- **Dispositivo físico**: `http://SEU_IP_LAN:5267` (mesma rede)

### Instalação e execução
```bash
# Clonar
git clone <URL_REPO>
cd MotoTrack-Mobile

# Instalar dependências
npm install

# Rodar
npx expo start
```

> Para apontar a outra API diretamente no comando:
```bash
EXPO_PUBLIC_API_BASE=http://10.0.2.2:5267 npx expo start
```

---

## 🔌 Integração com API (CRUDs)

- Serviço central em `src/services/mototrack.ts` com:
    - **Base dinâmico-configurável** (`setApiBase`, `getApiBase`)
    - **Montagem de parâmetros** (filtros e paginação)
    - **Tratamento de erros** + **abort controllers**
    - **Formatadores de data/hora** (`fmtDateTime`, etc.)

- **Estados de carregamento** e **mensagens de erro** nos formulários e listas.
- **Validações** de entrada (regex/formatos) com feedback visual e textual.

---

## 🔔 Notificações (Push e Locais)

### Push (Firebase Cloud Messaging / Expo Notifications)
- Cenários implementados para **CREATE/UPDATE/DELETE** (ex.: `notifyCRUD("MOTO", "CREATE", "Moto cadastrada.")`).
- Demonstração no vídeo: envio e recepção das notificações no app.

### Lembretes Locais (Agendamentos)
- Agendamento de notificação local (ex.: 10 minutos antes do compromisso):
```ts
await scheduleReminder("agendamento", novo.id, data, 10,
  "Lembrete de Agendamento",
  `Agendamento #${novo.id} às ${data.toLocaleString()}.`
);
```

> Os cenários foram pensados para **não poluir a Home**: as notificações foram encapsuladas e chamadas **apenas em fluxos de sucesso** de inclusão/edição/exclusão ou no **salvamento de agendamentos**, sem interferir em contadores/tiles.

---

## 🌍 Localização & Internacionalização (PT/ES)

- `i18n` configurado com **PT-BR** e **ES**, usando `react-i18next` e `AsyncStorage` para lembrar a escolha.
- **Placeholders e rótulos** seguem padrão consistente entre telas (mesma semântica e chaves).
- Botão de **alternância de idioma** presente onde faz sentido (ex.: Sobre, Login).

---

## 🎨 Tema (Claro/Escuro)

- `ThemeContext` com paleta para **light** e **dark**.
- Estilos **centralizados** em `globalStyles.ts` e derivados via `themedStyles(colors)`.
- Componentes reutilizáveis (ex.: `ThemeToggleButton`).

---

## 🧱 Arquitetura & Boas Práticas

- Separação clara entre **telas**, **serviços**, **contextos** e **estilos**.
- **Nomeação padronizada** e **código limpo** (lint/format).
- **Hooks**: `useState`, `useEffect`, `useCallback`, `useMemo` em pontos chave.
- **Reutilização** de blocos de UI e utilitários.
- **Padronização de validações** e de mensagens de erro/sucesso.

---

## 🧩 Dependências Principais

```json
{
  "@react-native-async-storage/async-storage": "^1.x",
  "@react-navigation/native": "^7.x",
  "@react-navigation/native-stack": "^7.x",
  "axios": "^1.x",
  "dayjs": "^1.x",
  "expo": "~52.x",
  "expo-constants": "~17.x",
  "expo-device": "~7.x",
  "expo-linking": "~7.x",
  "expo-localization": "~16.x",
  "expo-notifications": "~0.29.x",
  "expo-router": "~4.x",
  "firebase": "^10.x",
  "react": "18.x",
  "react-native": "0.7x.x"
}
```
> Versões exatas podem variar conforme *lockfile* do repositório.

---

## 🚀 Publicação (Firebase App Distribution)

1. **Gerar build** (EAS ou `expo build`/`gradle` conforme o fluxo escolhido).
2. **Cadastrar o app** no Firebase e habilitar **App Distribution**.
3. **Upload** do artefato (APK/AAB/IPA) para App Distribution.
4. **Adicionar o e-mail do professor** como *tester*.
5. Garantir que a **tela Sobre exiba o hash do commit** do build publicado.
6. Validar que a versão publicada **corresponde exatamente** ao código deste repositório.

> O vídeo de entrega deve demonstrar **instalação** e **execução** da versão publicada.

---

## 🧪 Testes (quando aplicável)

- **Fluxos principais manuais**: CRUDs e navegação end-to-end.
- **Snapshot/Unit (Jest)**: componentes e utils (opcional, recomendável).
- **Checklist de validação**:
    - [ ] Todas as telas planejadas presentes e funcionais
    - [ ] Navegação fluida entre módulos
    - [ ] Formulários com validações, mensagens de erro e *loaders*
    - [ ] Chamadas de API com *loading* e *error handling*
    - [ ] Push notifications funcionando e demonstradas
    - [ ] i18n (PT/ES) consistente e alternância de idioma presente
    - [ ] Tema claro/escuro aplicado em todas as telas
    - [ ] Tela Sobre com hash do commit e créditos
    - [ ] Publicação no Firebase App Distribution com tester adicionado
    - [ ] README completo com instruções

---

## 🎥 Vídeo de Demonstração

Inclua aqui o link do vídeo (YouTube/Drive) demonstrando:
- Instalação via Firebase App Distribution
- Execução real (emulador ou dispositivo)
- Fluxos principais (CRUDs, navegação, i18n, tema, notificações)

---

## 🛠️ Solução de Problemas (FAQ rápido)

- **API não responde**: verifique `EXPO_PUBLIC_API_BASE` e conectividade LAN/emulador.
- **Android emulador**: use `10.0.2.2` para acessar `localhost` do host.
- **Push não chega**: confirme permissões, token de dispositivo e canal de notificação.
- **Tradução não muda**: limpe o cache do app / reinstale (checar `AsyncStorage`).
- **Tema não altera**: verifique o provedor de contexto e re-render dos componentes.

---

## 📜 Licença / Escopo Acadêmico

Este aplicativo foi desenvolvido **exclusivamente para fins acadêmicos** na disciplina **Mobile Application Development (FIAP 2025)**, como entrega final da unidade.

---

## 📌 Notas de Implementação Recentes

- Padronização de grid/tiles da Home em `globalStyles` (`homeGrid`, `homeTile*`).
- Ícones específicos por módulo (Motos, Filiais, Agendamentos, Eventos, Usuários, Sobre).
- Novos utilitários em `mototrack.ts`: `fmtDateTime`, `pickAgendamentoDate`, `pickEventoDate`,
  `getApiBase`, `newAbort`.
- Tela **Sobre** refeita com `globalStyles/themedStyles` e **exibição do hash do commit**.
