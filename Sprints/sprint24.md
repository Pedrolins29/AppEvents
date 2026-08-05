# Sprint 24 — PeelBack: convite real com navegação por páginas (arrastar o canto)

> **Status: implementado e verificado (tsc/eslint/build).** Sem checagem visual em navegador
> nesta sessão (sem infraestrutura de browser disponível) — recomendo um teste visual antes de
> considerar isso pronto para todo mundo.

## Contexto

O usuário colou o componente `PeelBack` (arrastar o canto para "descascar" a página, estilo
livro) e pediu para levar esse efeito a alguns templates, "ao invés de só scrola", alcançando
também os convidados que recebem o link do convite — não só a demo de marketing.

Investigação encontrou trabalho em andamento **não commitado** na máquina: `InteractiveInvitation.tsx`
(a demo da home) já tinha sido reescrito para usar um carrossel por swipe (`PageScroll`) + canto
decorativo clicável (`PageFoldCorner`) + capa com selo (`WaxSealCover`) + grade de ações
(`InteractiveActionGrid`) — tudo compilando, mas só ligado na home, nunca na página real do
convite. Confirmado com o usuário (`AskUserQuestion`): `PeelBack` substitui o `PageScroll` como
mecânica definitiva, e o efeito **alcança a página real do convidado** (`/e/[slug]`).

**Achado de integridade durante a investigação**: `InteractiveActionGrid` incluía ações de "Lista
de Presentes" e "Salvar Data" (exportar pro calendário) — nenhuma das duas existe no produto (só
apareciam como stubs `// Will be implemented during integration`). Removidas do conjunto de ações
oferecido, tanto na demo quanto (se algum dia usado) na página real.

## O que foi feito

- **Novo `frontend/src/components/PeelBack.tsx`** — porta tipada do componente colado, física
  original preservada (drag por pointer events + easing manual via `requestAnimationFrame`,
  recorte por `clip-path`). Ganhou um modo `reduceMotion` (pula direto pra página seguinte/anterior
  sem animação, um único toque no canto já avança).
- **Novo `frontend/src/components/InvitationPeelBook.tsx`** — camada acima do `PeelBack`: recebe
  um array de páginas (`ReactNode[]`), controla o índice atual, deriva front/next/prev sem dar a
  volta (não é carrossel, é livro — para no início/fim), indicador de posição (bolinhas), setas de
  teclado, e usa `useReducedMotion()` do framer-motion (mesmo padrão já usado em
  `EnvelopeReveal.tsx`/`DateReveal.tsx`) para decidir o modo `reduceMotion`.
- **`InvitationBody.tsx`** (a página real do convite, `/e/[slug]`): as mesmas seções de sempre
  (Hero+Countdown, História, Cronograma, Galeria, Local+Traje, RSVP, Foto destaque) continuam
  renderizadas no servidor, empilhadas, exatamente como hoje — **isso não muda**, é a fonte de
  verdade indexável/sem-JS/leitor-de-tela. Só depois de montado (via `requestAnimationFrame` dentro
  de um `useEffect`, mesmo truque já usado em `DateReveal.tsx` para evitar o erro de lint
  `set-state-in-effect`), quando o tema do evento é Floral **e** o visitante não pediu movimento
  reduzido, a apresentação troca para `InvitationPeelBook` com as mesmas seções — nenhum conteúdo é
  buscado ou renderizado duas vezes, é só uma reapresentação client-side.
- **`InteractiveInvitation.tsx`** (demo da home): migrada do `PageScroll` para o mesmo
  `InvitationPeelBook` — demo e experiência real do convidado agora usam o mesmo motor de virar
  página. Removida a capa com selo (`CoverPageWithSeal`, já era código morto) e todo uso de
  `PageFoldCorner` (o próprio `PeelBack` já mostra "PUXE AQUI" na dobra).
- **Limpeza**: removidas as ações fabricadas (`createRegistryAction`, `createCalendarAction`) de
  `InteractiveActionGrid.tsx`; deletados os 3 componentes obsoletos —
  `PageScroll.tsx`, `PageFoldCorner.tsx`, `WaxSealCover.tsx` (nada mais os referenciava).
- **6 chaves de i18n novas** (`invitation.openInMaps`/`message`/`contactViaWhatsApp`/
  `viewDressCode`/`confirmAttendance`/`interactWithUs`, pt/en/es) — a grade de ações já usava essas
  chaves no código herdado, mas elas nunca tinham sido adicionadas às mensagens; sem isso, a demo
  mostraria o nome bruto da chave em vez de texto traduzido.

## Verificação

- `npx tsc --noEmit`: sem erros.
- `npx eslint .`: sem erros (2 erros de `react-hooks/set-state-in-effect` e 2 avisos de
  `no-unused-expressions` encontrados e corrigidos durante o desenvolvimento).
- `npm run build`: build de produção limpo.
- Grep final por "Registry"/"registry" — só sobram os comentários que documentam a exclusão, nenhum
  texto de UI alcançável.
- **Pendente (não executado nesta sessão)**: checagem visual em navegador — publicar um evento com
  tema Floral, abrir `/e/{slug}`, arrastar o canto pra frente/trás por todas as páginas, confirmar
  que o RSVP dentro do livro ainda envia; testar `prefers-reduced-motion` ligado (troca instantânea
  de página); confirmar que um evento com outro tema (ex. Elegante) continua no scroll de hoje;
  "ver código-fonte"/inspecionar com JS desligado para confirmar que o HTML inicial ainda tem todo
  o conteúdo linear (nada escondido atrás de client-side).

## Fora de escopo (deliberado)
- Os outros 3 temas visuais (Elegante, Minimalista, Moderno) continuam no scroll de sempre — só
  Floral foi ligado ao livro nesta sprint, por recomendação (pergunta sem resposta, mas fácil de
  ajustar depois).
- Feature real de lista de presentes / exportar para calendário — as ações correspondentes foram
  removidas por não existirem no produto, não construídas.

### Arquivos críticos
- `frontend/src/components/PeelBack.tsx` (novo)
- `frontend/src/components/InvitationPeelBook.tsx` (novo)
- `frontend/src/components/InvitationBody.tsx`
- `frontend/src/components/InteractiveInvitation.tsx`
- `frontend/src/components/InteractiveActionGrid.tsx`
- `frontend/src/messages/{en,pt,es}.json` (`invitation.*`)
- Removidos: `frontend/src/components/{PageScroll,PageFoldCorner,WaxSealCover}.tsx`
