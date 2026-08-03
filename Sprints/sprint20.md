# Sprint 20 — Correção dos 4 pontos mais críticos (integridade + funil)

> **Status: implementado e verificado.** Os 4 itens abaixo foram construídos, testados
> (`dotnet test` da suíte unitária completa, `tsc`/`eslint`/`build` do frontend) e estão prontos
> para revisão manual. Os testes de integração (`AppEvents.IntegrationTests`) que exercitam o
> round-trip real de confirmação de e-mail não puderam ser executados localmente — Docker
> continua indisponível nesta máquina nesta sessão — mas foram atualizados/estendidos e ficam
> para a CI confirmar.

## Contexto

A reauditoria pós-Sprint 19 (2 agentes Explore) revalidou 3 itens ainda abertos e achou 1 item
novo (efeito colateral do próprio Sprint 19). O usuário escolheu os 4 mais críticos para esta
sprint — "Integridade + funil" — e pediu para implementar as correções rápidas recomendadas,
deixando claro que sprints futuras vão trazer mais templates por tipo de evento, os checkouts com
upsells/order bumps de cada evento, os pixels de anúncio, e melhorias visuais ("wow") nos
templates — nenhum desses itens maiores entra nesta sprint.

## Item 1 — Corrigir "automático" nas páginas de categoria

`Wedding` e `BabyShower` prometiam "lembretes automáticos" em `metaDescription`/`heroSubtitle`/
`solution` — mas o envio do lembrete é manual (o organizador recebe um link `wa.me`/e-mail pronto
e precisa tocar para enviar; só o *rastreamento* do RSVP é de fato automático). Reescrito nas 3
línguas para preservar essa distinção sem perder o apelo comercial ("a lista se atualiza sozinha…
você manda um lembrete pronto com um toque"). 15 edições (5 campos × 3 idiomas) em
`frontend/src/messages/{pt,en,es}.json`. `payments.upsell.body` (já corretamente futuro) não foi
tocado.

## Item 2 — Auto-login ao confirmar e-mail

O penhasco de dupla autenticação (register → confira e-mail → clicar → tela de sucesso → login
manual) foi eliminado para o caminho feliz.

**Backend:**
- `AuthService.ConfirmEmailAsync` agora retorna `(ConfirmEmailResponse Response, AuthResult?
  Session)`. Numa confirmação **nova**, reaproveita o `IssueTokensAsync` privado já usado por
  `LoginAsync` — zero lógica de emissão de token duplicada. Numa confirmação **replay** (link já
  usado), `Session` é `null` — nenhuma sessão é emitida, para que um link antigo/reencaminhado
  clicado depois nunca autentique quem quer que seja.
- `ConfirmEmailResponse` ganhou campos opcionais `AccessToken`/`ExpiresInSeconds`/`User`,
  populados só quando há sessão nova.
- `AuthController.ConfirmEmail` seta o cookie `HttpOnly` de refresh (mesmo `SetRefreshTokenCookie`
  usado por `Login`/`Refresh`) só quando `Session` vem preenchido. O token bruto de refresh nunca
  vai no corpo JSON.
- Testes: `AuthServiceTests` (confirmação nova emite sessão + chama `IssueTokensAsync`; replay não
  emite sessão nem toca `RefreshTokenRepository`) e `AuthEndpointsTests` (confirmação nova retorna
  `AccessToken` + `Set-Cookie`; replay não retorna nem um nem outro). 150/150 testes unitários
  passam; testes de integração não executados localmente (sem Docker), ficam para a CI.

**Frontend:**
- `auth-context.tsx`: a cauda de `login()` (aplicar token+usuário, gravar `SESSION_HINT_KEY`,
  reivindicar rascunho do InstantPreview) foi extraída para `applySessionAndClaimDraft`, agora
  compartilhada por `login()` e pelo novo método público `applyConfirmedSession(accessToken,
  user)`.
- `verify-email/page.tsx`: numa confirmação nova (resposta traz `accessToken`+`user`), chama
  `applyConfirmedSession` e redireciona direto — `/events/{id}/edit` se havia um rascunho
  reivindicado, `/events` caso contrário — pulando a tela de sucesso/login manual inteiramente.
  Numa confirmação replay (`alreadyConfirmed`), mantém o comportamento atual (tela "já confirmado"
  + link para `/login`) — decisão deliberada.
- `register/page.tsx`: a tela "confira seu e-mail" agora tem um formulário de reenvio.
- Novo `components/ResendConfirmationForm.tsx`, extraído do antigo `ResendForm` inline de
  `verify-email/page.tsx`, reutilizado pelas duas páginas.

## Item 3 — `flex-wrap` na lista de eventos

`frontend/src/app/events/page.tsx`: `flex-wrap gap-y-2` na `<li>` da linha do evento e
`flex-wrap` na `<div>` de ações — as 4 ações (Copiar link/Visualizar/Editar/Excluir) agora quebram
para a linha de baixo em telas estreitas em vez de arriscar overflow horizontal.

## Item 4 — `CopyInviteLink` na página de preview

`frontend/src/app/events/[id]/preview/page.tsx`: novo elemento fixo (`fixed right-4 top-4 z-10`,
fundo branco semi-transparente com blur para contraste sobre o convite ao vivo) com
`<CopyInviteLink variant="full" />` (botões de copiar link + WhatsApp), mostrado só quando
`event.isPublished`. Rascunhos não têm link público válido para compartilhar, então não mostram o
elemento.

*Pequeno desvio do plano original*: o plano sugeria `variant="compact"` (só texto sublinhado); na
implementação optei por `variant="full"` (botões com fundo sólido) porque um link de texto sem
fundo não teria contraste garantido sobre o plano de fundo variável do convite ao vivo atrás dele.

## Verificação

- `dotnet build --configuration Release`: sucesso, 0 erros.
- `dotnet test` (suíte unitária completa): **150/150 passam**, incluindo os novos testes de
  auto-login/replay.
- Testes de integração (`AuthEndpointsTests`, incluindo os 2 novos/atualizados de confirm-email):
  **não executados localmente** — Docker indisponível nesta sessão — ficam para a CI confirmar.
- `npx tsc --noEmit`: sem erros.
- `npx eslint .`: sem erros.
- `npm run build`: build de produção limpo, todas as rotas geradas normalmente.
- Verificação manual (pendente do usuário): cadastro → clicar no link do e-mail → confirmar que
  cai direto em `/events` (ou no editor, se havia rascunho do InstantPreview) sem precisar logar de
  novo; clicar num link de confirmação já usado → confirmar que ainda mostra "já confirmado" sem
  autenticar automaticamente; lista de eventos em ~375px com evento publicado de nome longo →
  ações quebram de linha; preview de evento publicado → botão de copiar/compartilhar aparece e
  funciona; preview de rascunho → botão não aparece.

### Arquivos críticos

- `frontend/src/messages/{en,pt,es}.json` (item 1)
- `backend/src/AppEvents.Application/Identity/Services/AuthService.cs`,
  `backend/src/AppEvents.Application/Identity/Services/IAuthService.cs`,
  `backend/src/AppEvents.Application/Identity/Dtos/ConfirmEmailResponse.cs`,
  `backend/src/AppEvents.Api/Controllers/AuthController.cs` (item 2, backend)
- `frontend/src/lib/auth-context.tsx`, `frontend/src/app/verify-email/page.tsx`,
  `frontend/src/app/register/page.tsx`, `frontend/src/components/ResendConfirmationForm.tsx`
  (item 2, frontend)
- `backend/tests/AppEvents.UnitTests/Identity/AuthServiceTests.cs`,
  `backend/tests/AppEvents.IntegrationTests/AuthEndpointsTests.cs` (item 2, testes)
- `frontend/src/app/events/page.tsx` (item 3)
- `frontend/src/app/events/[id]/preview/page.tsx` (item 4)

## Fora de escopo (explicitamente adiado para sprints futuras, por pedido do usuário)

- Novos templates visuais por tipo de evento e melhorias de "wow" nos temas existentes.
- Checkouts individuais por tipo de evento com upsells/order bumps próprios (infra de
  `Lastlink`/`Entitlement` já existe desde a Sprint 14 — falta criar os checkouts reais e o
  `ProductKeyMap`).
- Pixels de anúncio (Meta/Google/TikTok) — infra de `AdPixels`/CSP condicional já existe desde a
  Sprint 14, falta só os IDs reais.
