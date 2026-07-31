# Sprint 19 — Melhorias de funil (marketing + UX)

> **Status: pacote de ativação P0 implementado + ajuste de hero (parte do P1).** O escopo P0 abaixo
> (o "pacote de ativação") já foi construído e verificado — ver
> [Implementação do pacote P0](#implementação-do-pacote-p0-concluída) ao final. Um recorte do item
> P1 "reescrever hero" também foi implementado a pedido do usuário — ver
> [Ajuste de hero (parte do P1)](#ajuste-de-hero-parte-do-p1) — mas o restante de P1/P2 continua como
> brief para sprints futuras, aguardando decisão de escopo (a versão verdadeira da SalesLanding e a
> instrumentação de pixels/checkout dependem de links do Lastlink e IDs de pixel que o usuário ainda
> vai criar — propositalmente não tocados).

## Contexto

O usuário pediu uma avaliação completa do fluxo dos usuários — pontos fortes, serviços e pontos de
melhoria — via agentes relacionados a marketing e experiência do usuário. Método: 2 agentes Explore
(surface de aquisição + fluxo pós-cadastro), leitura direta do "penhasco de ativação" (register →
confirmar e-mail → login → primeiro evento), a skill `marketing-ideas` (framework AARRR) e a skill
`ui-ux-pro-max` (heurísticas de formulário, empty state, onboarding, padrões de landing de
conversão).

**Produto pré-lançamento, sem tráfego/métricas reais** — esta avaliação é heurística, baseada em
boas práticas de marketing/UX e na leitura do código real, não em dados medidos deste público. Por
isso a recomendação P0 nº 5 (instrumentar o funil) é a base de tudo: sem ela, todo o resto continua
hipótese.

## Sumário executivo

O **artesanato do produto é excelente** — design editorial, demo interativa do envelope (diferencial
real), cluster de SEO programático competente, motor de RSVP/lista de convidados completo. Mas o
**funil vaza em 3 juntas específicas**, todas de alta alavancagem:

1. **Ativação (a mais crítica e a mais barata de corrigir):** depois de se cadastrar, o usuário
   atravessa um caminho longo e sem direção — tela passiva de "confira seu e-mail" → clicar no link
   → "agora faça login de novo" → cai numa lista com um rascunho silencioso → e **não existe botão
   de copiar o link** do convite (a única ação que importa). O "momento aha" (um link no WhatsApp)
   está a ~8 passos e sem sinalização.
2. **Aquisição (landing ao vivo sub-persuadida):** headline é "clima", não promessa; "grátis" está
   escondido no FAQ; zero prova social; sem reversão de risco. A variante `SalesLanding` (mais
   forte) está corretamente desligada porque vende features que ainda não existem.
3. **Teto estrutural de SEO:** locale só por cookie, sem prefixo de URL nem hreflang — só o
   português é realmente indexável, apesar de existirem traduções en/es.

## 1. Avaliação da página (surface de marketing)

**Pontos fortes:** demo interativa do envelope (`EnvelopeReveal`/`InteractiveInvitation`, o maior
ativo de conversão); design editorial coeso (tokens porcelain/ink/pinewood/gold, Cormorant + Inter);
SEO programático genuíno — hub `/criar-convite` + 5 spokes de categoria com copy única por intenção,
showcase real filtrado, `InstantPreview` semeado por tipo, e JSON-LD `FAQPage` + `BreadcrumbList`
elegível a rich result; CTA consistente (botão dourado animado "Criar Agora" em toda página).

**Pontos de melhoria:**
- Hero é "clima", não promessa — "Um convite que vale a pena abrir" não diz benefício, público nem
  diferencial.
- "Grátis" só aparece no FAQ #1, nunca acima da dobra; falta "sem cartão de crédito".
- Zero prova social — nenhum depoimento, contador, avaliação ou logo (o `hero.proof` é lista de
  features rotulada como prova).
- Sem reversão de risco nem urgência.
- A melhor página (`SalesLanding`: personas + tabela comparativa + reversão de risco) está desligada
  porque ~5 alegações são vaporware (Pix 0%, WhatsApp automático, música, QR check-in).
- Risco de integridade nas páginas de categoria **ao vivo**: copy promete "lembretes automáticos /
  cobrança fácil via WhatsApp", mas o lembrete é manual (link `wa.me`).
- Teto estrutural de SEO: locale só por cookie (`i18n/request.ts`), sem prefixo de URL nem hreflang
  → só pt indexa, apesar de en/es existirem.
- Sem página de preço/ancoragem.

## 2. Avaliação do fluxo (jornada / ativação)

**Caminho hoje (~8 passos, 3 navegações):** Landing → `/criar-convite` → InstantPreview → cadastro →
"confira seu e-mail" → clicar no link → "faça login de novo" → lista com rascunho silencioso →
Editar → Publicar → copiar o link na unha → WhatsApp.

**Pontos fortes:** `InstantPreview` permite personalizar antes de criar conta (efeito IKEA, zero
escrita no banco); o rascunho do preview vira evento real automaticamente no primeiro login (Sprint
17); botão de publicar é proeminente no topo do editor.

**Pontos de melhoria (maior vazamento do funil):**
- 🔴 **Não existe botão "Copiar link"** do convite publicado (lista nem editor) — a única ação que
  importa não tem afordância, mesmo os links *pessoais* de convidado já tendo "Copiar" no
  `GuestListManager`.
- 🔴 **Publicar não dá feedback** — `handleTogglePublish` só troca o rótulo; sem toast, sem copiar
  automático, sem CTA "compartilhe agora".
- 🔴 **Penhasco de dupla autenticação** — tela "confira seu e-mail" passiva (sem reenviar, sem "abrir
  Gmail"); tela de sucesso do `verify-email` oferece só um link de texto `/login` — o usuário
  redigita e-mail+senha.
- 🟠 **E-mail de confirmação é `<p>` cru + link de texto** — sem marca, sem botão estilizado.
- 🟠 **Slug é o maior atrito do formulário** — obrigatório, digitado à mão, sem autogeração a partir
  do nome (já existe `buildDraftSlug()` em `lib/instantPreviewDraft.ts` para reaproveitar), sem
  validação inline, erros voltam como string única concatenada.
- 🟠 **Criar evento larga o usuário na lista como rascunho silencioso** — deveria ir ao editor.
- 🟡 Preview é ilha (só acessível pela lista; sem botão de publicar).
- 🟡 Fotos são só no editor — o primeiro convite nasce visualmente vazio.
- 🟡 Páginas de auth usam a paleta legada hardcoded, não os tokens de marketing.

## 3. Avaliação dos serviços

| Serviço | Estado | Avaliação |
|---|---|---|
| Criação de convite (grátis) | ✅ | Sólido, mas com atrito no formulário (slug) |
| 4 temas autorais | ✅ | Bem executados; poucos, mas bonitos |
| Página pública `/e/[slug]` (contagem, galeria, capa/destaque, mapa, cronograma, dress code) | ✅ | O ponto mais forte do produto |
| RSVP web + e-mail | ✅ | Completo |
| Lista de convidados + links pessoais + lembrete WhatsApp/e-mail (manual) | ✅ | Diferencial de retenção real, mas escondido no editor e nunca ressurgido após publicar |
| InstantPreview sem login | ✅ | Ótimo gancho de topo de funil |
| OG images dinâmicas | ✅ | Compartilhamento no WhatsApp já mostra imagem de marca |
| 3 idiomas | ✅ produto / ❌ SEO | Traduzido, mas só pt indexa |
| Lista de presentes Pix, RSVP automático no WhatsApp, música, QR check-in, checkout pago | ❌ | Vaporware — infra Lastlink existe atrás de flag; risco de integridade onde já é anunciado |
| Analytics de funil | 🟡 | Eventos de cadastro/publicação/compartilhamento agora disparam (via `AdPixels`), mas só valem algo quando um pixel real for configurado — nenhum dashboard de produto próprio existe |

## Roadmap priorizado (impacto × esforço)

| Prio | Item | Impacto | Esforço | Status |
|------|------|---------|---------|--------|
| P0 | Botão "Copiar link" + "Compartilhar no WhatsApp" no convite publicado (lista + editor) | Alto | Baixo | ✅ Feito |
| P0 | Feedback pós-publicação (toast + copiar automático + CTA compartilhar) | Alto | Baixo | ✅ Feito |
| P0 | Autogerar slug do nome + validação inline + `min` na data | Alto | Baixo-Médio | ✅ Feito |
| P0 | Criar-evento → ir ao editor/próximo passo (não largar como rascunho) | Médio | Baixo | ✅ Feito |
| P0 | Instrumentar funil (eventos de analytics nos passos-chave) | Alto (habilitador) | Médio | ✅ Feito |
| P1 | Auto-login ao confirmar e-mail (ou tela "confira seu e-mail" acionável + prefill do login) | Alto | Médio | Planejado |
| P1 | Reescrever hero (benefício) + "grátis"/"sem cartão" acima da dobra | Alto | Baixo (copy) | 🟡 Parcial |
| P1 | Versão *verdadeira* da SalesLanding no ar (personas + comparação, sem vaporware) | Alto | Médio | Planejado |
| P1 | Migrar auth + e-mail de confirmação para tokens de marca + estilizar o e-mail | Médio | Baixo-Médio | Planejado |
| P1 | Corrigir "automático" nas páginas de categoria (integridade) | Médio | Baixo | Planejado |
| P2 | Nudge pós-publicação para lista de convidados (retenção) | Médio | Baixo | Planejado |
| P2 | Capa/fotos na criação ou checklist de onboarding | Médio | Médio | Planejado |
| P2 | Sequência de e-mail de ciclo de vida (onboarding/win-back) | Médio | Médio | Planejado |
| P2 | Prefixo de locale + hreflang (SEO internacional) | Alto (longo prazo) | Alto | Planejado |
| Dep | Página de preço / ancoragem | Alto | Bloqueado por features pagas | Bloqueado |

## Implementação do pacote P0 (concluída)

Escopo confirmado com o usuário: só o pacote P0 nesta rodada. Instrumentação de funil
deliberadamente **não** usa nem cria os slots de checkout Lastlink (`NEXT_PUBLIC_LASTLINK_CHECKOUT_*`)
nem os IDs de pixel (`NEXT_PUBLIC_META_PIXEL_ID`/`GOOGLE_ADS_ID`/`TIKTOK_PIXEL_ID`) — o usuário vai
preenchê-los depois; os novos eventos disparam pelos mesmos hooks opcionais e não-bloqueantes
(`window.fbq?./gtag?./ttq?.track?.`) já usados em `InstantPreview.tsx`/`UpsellBanner.tsx`, ficando
inertes até esses pixels serem configurados.

- **Botão "Copiar link" + "Compartilhar no WhatsApp"**: novo `components/CopyInviteLink.tsx`
  (variantes `compact`/`full`), usado em `app/events/page.tsx` (linha da lista, só para publicados)
  e `app/events/[id]/edit/page.tsx` (caixa de publicação). Reaproveita o padrão de clipboard do
  `GuestListManager.tsx`. Novo `lib/inviteUrl.ts` (URL do convite) e `buildWhatsappShareLink()` em
  `lib/whatsappLink.ts` (compartilhamento genérico, sem telefone-alvo, ao contrário do nudge por
  convidado que já existia).
- **Feedback pós-publicação**: `handleTogglePublish` em `edit/page.tsx` agora detecta uma
  publicação nova (transição rascunho→publicado), copia o link automaticamente para a área de
  transferência, mostra `justPublished` ("Convite publicado! Link copiado — compartilhe agora.") e
  dispara o evento de funil `InvitationPublished`.
- **Slug automático + validação inline**: `EventForm.tsx` sincroniza o slug a partir do nome
  (`lib/slugify.ts`, extraído e reaproveitado por `buildDraftSlug()` em `instantPreviewDraft.ts`)
  até o usuário editar o campo manualmente (`slugTouched`); nunca reescreve o slug de um evento já
  existente. Validação inline (mesma regex do backend) no blur e antes do submit; campo de data
  ganhou `min` = hoje.
- **Criar evento → editor**: `app/events/new/page.tsx` redireciona para `/events/{id}/edit` em vez
  de `/events` após criar.
- **Eventos de funil**: cadastro concluído (`app/register/page.tsx`, `CompleteRegistration`/
  `sign_up`), publicação (`InvitationPublished`) e cópia/compartilhamento do link
  (`InvitationShared`, com `method: copy_link | whatsapp`).

### Verificação executada
- `npx tsc --noEmit`, `npx eslint src --max-warnings 0`, `npm run build` — todos limpos.
- JSON das 3 mensagens (pt/en/es) validado (parse + chaves novas presentes).
- **Não verificado nesta sessão**: fluxo end-to-end ao vivo (criar → publicar → copiar → colar no
  WhatsApp) — Docker/Postgres indisponíveis no ambiente desta sessão, então o backend não pôde ser
  levantado. Revisão de código feita linha a linha; recomenda-se um passe manual assim que o
  ambiente local estiver disponível.

### Arquivos alterados
- `frontend/src/lib/slugify.ts`, `inviteUrl.ts` (novos); `whatsappLink.ts`,
  `instantPreviewDraft.ts` (estendidos)
- `frontend/src/components/CopyInviteLink.tsx` (novo)
- `frontend/src/components/EventForm.tsx`
- `frontend/src/app/events/page.tsx`, `events/[id]/edit/page.tsx`, `events/new/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/messages/{en,pt,es}.json` (`events.form.slugInvalid`, `events.edit.justPublished`,
  `events.shareLink.*`)

### Próximos passos (P1, aguardando decisão de escopo)
- `frontend/src/app/register/page.tsx`, `frontend/src/app/verify-email/page.tsx`,
  `frontend/src/lib/auth-context.tsx` (penhasco de dupla autenticação)
- `backend/src/AppEvents.Application/Identity/Emails/ConfirmationEmailTemplates.cs` (e-mail de marca)
- "Grátis" / "sem cartão" acima da dobra na hero (não incluído neste ajuste — ver abaixo)

## Ajuste de hero (parte do P1)

A pedido do usuário, um recorte específico do item "reescrever hero" foi implementado nesta rodada,
com base num diagnóstico próprio do usuário:

1. **"3 idiomas" saiu da hero** — o badge foi removido de `hero.proof`; a informação foi realocada
   para uma nova 6ª pergunta no FAQ ("O convite fica disponível em outros idiomas?"), como pedido
   (mover para uma seção mais abaixo em vez de simplesmente apagar).
2. **"RSVP" traduzido de forma didática** — badge e subtítulo agora dizem "Confirmação de Presença
   (RSVP)" em vez de só "RSVP integrado".
3. **WhatsApp + Google Maps/Waze em destaque na hero** — novos badges "Lembretes no WhatsApp" e
   "Mapa Waze/Google Integrado", e o subtítulo menciona ambos.
4. **Pílulas de categoria reorganizadas** — novo array `landing.hero.pills` (decorativo, dissociado
   de `EVENT_TYPES`): Chá de Bebê + Revelação de Sexo viraram uma pílula única ("Chá de Bebê /
   Revelação"), e uma nova pílula "Eventos Corporativos" foi adicionada.

**Duas ressalvas sinalizadas ao usuário, não escondidas silenciosamente:**
- O texto original pedido dizia "lembretes **automáticos** no WhatsApp" — mas o lembrete por
  WhatsApp já existente (Sprint 15) é **manual**: o organizador toca um link `wa.me` pré-preenchido,
  o app não envia nada sozinho. Implementado como "lembretes rápidos por WhatsApp" (verdadeiro) em
  vez do texto literal pedido, para não introduzir a mesma inconsistência já sinalizada nas páginas
  de categoria do `/criar-convite`.
- A pílula "Eventos Corporativos" foi adicionada como pedido, mas **não existe um `EventType`
  "Corporate" no backend hoje** — é só um sinal de mercado na hero por enquanto; quem tentar criar
  um evento corporativo ainda vai precisar escolher outro tipo no formulário. Adicionar um `EventType`
  real é uma decisão de domínio maior, fora do escopo desta mudança de copy.
- O restante do item P1 (subir "grátis"/"sem cartão" para acima da dobra) **não foi feito** — segue
  como próximo passo em aberto.

### Arquivos alterados (hero)
- `frontend/src/components/landing/HomeLanding.tsx` (pílulas via `hero.pills` em vez de `EVENT_TYPES`)
- `frontend/src/messages/{en,pt,es}.json` (`landing.hero.eyebrow/subtitle/proof/pills`,
  novo item em `landing.faq.items`)
