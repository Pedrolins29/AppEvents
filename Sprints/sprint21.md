# Sprint 21 — Convidados sem contato digital, paginação e QR code

> **Status: implementado e verificado.** `tsc`/`eslint`/`npm run build` limpos. 100% frontend —
> zero mudança de backend (o endpoint de atualização manual de status já existia desde a
> Sprint 15, só nunca tinha sido chamado pela UI).

## Contexto

Revisão do painel de convidados trouxe 3 pedidos: uma estratégia para convidados sem WhatsApp/
e-mail (idosos, crianças pequenas), paginação numerada na lista de convidados (em vez de uma lista
que só cresce), e um QR code para o link do convite. Investigação de código confirmou que o
backend já suportava 100% a confirmação manual de status desde a Sprint 15
(`GuestService.UpdateGuestAsync`, `PUT /api/events/{id}/guests/{guestId}`) — só nunca havia botão
nenhum na tela para isso. Nenhuma paginação existia em lugar nenhum do app, e nenhum código/
biblioteca de QR code existia no projeto.

## Item 1 — Confirmação manual + selo "sem contato digital"

`frontend/src/components/GuestListManager.tsx`: novo `handleUpdateStatus(guest, status)`
reaproveitando o `guestsApi.update()` já existente (e até então nunca chamado). Convidados
`Pending` ganharam botões "Confirmar"/"Recusar" sempre visíveis, independente de ter telefone/
e-mail cadastrado — é exatamente o caminho para quem não tem: o organizador liga ou pergunta
pessoalmente e marca ele mesmo. Convidados `Confirmed`/`Declined` ganharam um link discreto
"Voltar para pendente" para desfazer um engano. Um selo "Sem contato digital" aparece ao lado do
nome de convidados sem e-mail nem telefone, sinalizando ao organizador quem só pode ser movido
manualmente (as ações de lembrete por WhatsApp/e-mail continuam escondidas para esses convidados,
como já era). Zero mudança de backend — só passou a chamar o que já existia.

## Item 2 — Paginação numerada da lista de convidados

Novo `frontend/src/components/Pagination.tsx` — componente genérico (Anterior/Próxima + números
com janela ao redor da página atual, reticências para listas grandes), propositalmente reutilizável
por outras listas do app no futuro. `GuestListManager.tsx` pagina client-side (`PAGE_SIZE = 10`,
constante fácil de ajustar) sobre a lista já buscada de uma vez — proporcional ao tamanho real de
uma lista de convidados (dezenas a poucas centenas, não milhares); paginação no servidor ficaria
desproporcional para esse volume. A página atual é um valor **derivado** (`Math.min(page,
totalPages)`), não reclampada via `setState` num efeito — evita o problema de cascata de renders
que o ESLint (`react-hooks/set-state-in-effect`) pegou na primeira tentativa.

## Item 3 — QR code do link do convite

Nova dependência `qrcode-generator` (síncrona, ~15KB, zero dependências). Novo
`frontend/src/components/QrCode.tsx` — renderiza o QR como `<rect>`s React puros dentro de um
`<svg>` (sem `dangerouslySetInnerHTML`), com fundo branco sólido (mais confiável para escanear
sobre qualquer fundo de página ou impresso — pequeno ajuste em relação ao "fundo transparente" do
plano original, decisão de escaneabilidade). `CopyInviteLink.tsx` ganhou um terceiro botão "Mostrar
QR Code" na variante `full`, que expande o QR do link público (`buildInviteUrl(slug)`) inline. Como
a variante `full` já é a usada tanto na caixa de publicação do editor
(`events/[id]/edit/page.tsx:303`) quanto na página de preview (Sprint 20), o QR passou a aparecer
automaticamente nos dois lugares sem tocar em nenhuma das duas páginas.

## Verificação

- `npx tsc --noEmit`: sem erros.
- `npx eslint .`: sem erros (1 erro `react-hooks/set-state-in-effect` encontrado e corrigido antes
  do commit, ver Item 2).
- `npm run build`: build de produção limpo, todas as rotas geradas normalmente.
- `npm audit`: as 5 vulnerabilidades reportadas são todas pré-existentes em dependências transitivas
  (`next`, `postcss`, `sharp`, `brace-expansion`) — confirmado que nenhuma vem de `qrcode-generator`
  (biblioteca sem dependências próprias).
- Verificação manual (pendente do usuário): lista de convidados com um convidado sem e-mail nem
  telefone → selo aparece, "Confirmar"/"Recusar" funcionam; convidado confirmado por engano →
  "Voltar para pendente" funciona; evento com mais de 10 convidados → paginação aparece e navega
  corretamente, removendo convidados até sobrar menos páginas não quebra a página atual; caixa de
  publicação do editor e página de preview de um evento publicado → "Mostrar QR Code" expande um QR
  válido (testar escaneando com um celular); lista de eventos (`variant="compact"`) → sem QR, como
  esperado. 3 idiomas (pt/en/es) para todas as strings novas.

### Arquivos críticos
- `frontend/src/components/GuestListManager.tsx` (itens 1 e 2)
- `frontend/src/components/Pagination.tsx` (novo, item 2)
- `frontend/src/components/QrCode.tsx` (novo, item 3)
- `frontend/src/components/CopyInviteLink.tsx` (item 3)
- `frontend/src/lib/guestsApi.ts` (já existia, passou a ser chamado — item 1)
- `frontend/package.json` (nova dependência `qrcode-generator`, item 3)
- `frontend/src/messages/{en,pt,es}.json` (`guests.*`, `pagination.*`, `events.shareLink.*`)

## Fora de escopo (deliberado)

- Campo de observação/notas por convidado (opção não escolhida pelo usuário — reduziria a
  confirmação manual, mas exigiria uma coluna nova no banco + migração).
- QR code por convidado (link pessoal) — usuário escolheu só o link principal do convite.
- Paginação no servidor (`Skip`/`Take` no backend) — desproporcional ao volume real de uma lista de
  convidados de evento.
