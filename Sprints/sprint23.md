# Sprint 23 — Modal de Soft Gate & Seleção de Planos (Casamento primeiro)

> **Status: implementado e verificado (tsc/eslint/build).** Fica **inerte por padrão** — o modal só
> aparece quando pelo menos um dos dois links de checkout do Casamento estiver configurado
> (`NEXT_PUBLIC_LASTLINK_CHECKOUT_WEDDING_ESSENCIAL`/`_PREMIUM`, ambos em branco por padrão). Sem
> checagem manual em navegador nesta sessão (sem infraestrutura de browser disponível) — recomendo
> um teste visual antes de configurar os links reais.

## Contexto

O usuário colou um brief de agência pedindo um "Modal de Soft Gate & Seleção de Planos da VOWLA":
dois planos pagos (Essencial R$49,90 / Premium R$89,90, efeito chamariz de ancoragem), acionado por
um botão "Salvar meu VOWLA" no `InvitationPhoneMockup`, com URLs de checkout do Lastlink já prontas.

Reconciliação com o produto real, via `brainstorming` skill + 4 rodadas de `AskUserQuestion`:

1. **Sem rebranding** — confirmado que "VOWLA" era linguagem ilustrativa do brief; o produto
   continua AppEvents.
2. **Upsell opcional, não paywall** — criar/publicar convite continua gratuito (modelo já
   documentado nas Sprints 14/15/19); os planos pagos ficam ao lado de um link "Continuar grátis"
   visível, nunca bloqueando o caminho gratuito.
3. **Gatilho real = CTA do `InstantPreview`** — `InvitationPhoneMockup` é só decorativo (mockups de
   outros casais), sem botão nem estado do visitante. Quem tem o rascunho real (nome, tipo, tema,
   data, endereço) e já vai para `/register` é o `InstantPreview`, embutido em
   `/criar-convite/[categoria]` com `defaultEventType={eventType}` já disponível.
4. **Casamento primeiro** (pedido nesta sprint) — a interceptação do CTA só ativa quando
   `eventType === "Wedding"`; os outros 5 tipos mantêm o link direto para `/register`, sem nenhuma
   mudança de comportamento.
5. **Sem feature-gating fabricado** — nenhuma funcionalidade do produto é hoje travada por plano.
   Confirmado com o usuário: Essencial e Premium entregam o mesmo produto; o Premium se diferencia
   por posicionamento de "apoiador fundador" (acesso antecipado às features já sinalizadas como "em
   breve" em `payments.upsell.body` + suporte prioritário), não por um recurso trancado inexistente.

**Ajuste técnico ao brief**: o formulário original só pedia e-mail+senha, mas
`RegisterRequestValidator.cs` exige `FullName` (`NotEmpty`) — o soft gate ganhou um terceiro campo
(Nome completo).

## O que foi feito

- **`frontend/src/components/SoftGateModal.tsx`** (novo): formulário (nome/e-mail/senha + honeypot,
  checklist de senha reaproveitado do padrão de `register/page.tsx`) + dois cards de plano
  (Essencial âncora, Premium dourado com glow e badge "Recomendado" — não "Mais vendido", já que não
  há dado de vendas real para sustentar essa alegação) + link "Continuar grátis" + rodapé de
  confiança (garantia, acesso imediato, checkout SSL). No clique de um plano, chama
  `authApi.register()` diretamente (mesmo endpoint que `/register` usa, zero mudança de backend) e
  redireciona para o checkout — sem esperar confirmação de e-mail (fricção zero); o e-mail de
  confirmação sai em background como sempre.
- **`frontend/src/lib/checkoutUrls.ts`**: novas `getWeddingPlanCheckoutUrl(tier, userId)`,
  `isWeddingPlanConfigured(tier)` e `hasWeddingPlansConfigured()` — mesmo padrão de blank-slot já
  usado para os outros tipos de evento. Sem `eventId` na correlação (o rascunho só vira `Event` de
  verdade no primeiro login — padrão da Sprint 17): só `?appeventsRef={userId}`, reaproveitando
  `Order.EventId` (`Guid?`, já nullable).
- **`frontend/.env.example`**: novas `NEXT_PUBLIC_LASTLINK_CHECKOUT_WEDDING_ESSENCIAL`/`_PREMIUM`,
  em branco.
- **`frontend/src/components/InstantPreview.tsx`**: CTA condicional —
  `eventType === "Wedding" && hasWeddingPlansConfigured()` abre o `SoftGateModal`; qualquer outro
  caso (outro tipo, ou Wedding sem nenhum link configurado ainda) mantém o `<a href="/register">`
  de sempre, sem nenhuma mudança visível.
- **i18n**: novo `criarConvite.categories.Wedding.plans.*` (pt/en/es), reaproveitando a moldura de
  dor já validada em `Wedding.painPoint`/`solution` ("lista de convidados bagunçada no WhatsApp").

## Verificação

- `npx tsc --noEmit`: sem erros.
- `npx eslint .`: sem erros.
- `npm run build`: build de produção limpo.
- Grep na copy nova do plano Premium por linguagem de exclusividade fabricada (`exclusiv`,
  "só no Premium" etc.) — nenhuma ocorrência na copy nova (as ocorrências pré-existentes no arquivo
  são de outro contexto, já revisadas em sprints anteriores).
- **Pendente (não executado nesta sessão)**: checagem visual em navegador — abrir
  `/criar-convite/casamento` com `NEXT_PUBLIC_LASTLINK_CHECKOUT_WEDDING_ESSENCIAL`/`_PREMIUM`
  configurados (mesmo que com URLs de teste) e confirmar visualmente os dois cards, o registro real
  via Mailpit, e o redirecionamento; depois conferir que `/criar-convite/aniversario` (ou qualquer
  outro tipo) continua indo direto para `/register`, sem modal.

## Fora de escopo (deliberado)
- Os outros 5 tipos de evento — cada um ganha seu próprio funil/oferta numa sprint futura, quando
  for modelado (a arquitetura já está pronta para isso: só falta copy + env vars por tipo).
- Feature-gating real por plano (ex. limite de fotos, expiração) — decisão explícita do usuário de
  não fazer isso agora; ficaria para uma sprint à parte se algum dia for decidido.
- Configuração real dos produtos no painel do Lastlink e do `Lastlink:ProductKeyMap` no backend —
  ação do usuário, não código.

### Arquivos críticos
- `frontend/src/components/SoftGateModal.tsx` (novo)
- `frontend/src/components/InstantPreview.tsx`
- `frontend/src/lib/checkoutUrls.ts`
- `frontend/.env.example`
- `frontend/src/messages/{en,pt,es}.json` (`criarConvite.categories.Wedding.plans.*`)
