 Posicionamento, Copywriting & Redesign da Landing Page (UI/UX & CRO)Objetivo: Transformar a landing page atual de um "portfólio institucional" para uma Página de Vendas SaaS de Alta Conversão focada no modelo PLG (Product-Led Growth).1. Mapeamento de Personas & Dores PrincipaisPersona A (Noivos): Dor de pagar comissões abusivas em listas de presentes (3.69%+ no iCasei/Casar.com) e falta de confirmações de presença precisas.Persona B (Mães/Pais - Chá Revelação e Bebê): Dor de gerenciar tamanho de fraldas e palpites de convidados manualmente.Persona C (Organizadores de Formatura/Corporativo): Dor de credenciamento na porta e falta de profissionalismo nos convites em PDF.2. Reestruturação da Dobra 1 (Hero Section)Badge Superior (Proposta de Valor): ⚡ Sem taxas na Lista Pix · RSVP Automático no WhatsApp · Pronto em 3 minHeadline Persuasiva: "O site e convite digital interativo que seus convidados vão amar. Sem mensalidades, sem comissão no seu Pix."Subheadline: "Escolha um design elegante, adicione sua história, fotos e música. Receba confirmações de presença direto no WhatsApp e presentes 100% na sua conta bancária."Call to Actions (CTAs):Botão Primário (Ouro): 🚀 Criar Meu Convite Grátis (Sem cartão de crédito · Veja pronto antes de pagar)Botão Secundário: 📱 Ver Exemplo Ao Vivo (Envelope 3D)Micro-Prova Social: ⭐⭐⭐⭐⭐ 4.9/5 (Mais de 1.400 festas criadas este mês)3. Novas Seções Críticas na Landing PageBarra de Prova Social & Confiança: Contador dinâmico de eventos ativos, R$ 0 em taxas Pix, selo de conformidade com LGPD e zero necessidade de baixar apps.Tabela Comparativa Matadora:FuncionalidadeAppEvents 💎Concorrentes (iCasei/Casar.com)PDF EstáticoTaxa na Lista Pix0% (Dinheiro direto na sua conta)3.69% a 4.19% de taxaNão possui listaAbertura InterativaEnvelope 3D com Música e AnimaçãoLink de site comumPDF pesado sem graçaRSVP no WhatsAppAutomático + Planilha organizadaApenas painel internoMensagens soltas no chatMódulos VIPManual de Padrinhos + Game ChutômetroNão possuiNão possuiNacionalização Visual: Substituir 100% dos textos em inglês dos mockups ("Forever & Always") por amostras em Português do Brasil ("Gabriel & Mariana", "Meu Chá Revelação").

---

## Implementação (o que foi feito)

A nova página de vendas foi construída **atrás de uma feature flag** (`SALES_LANDING`), porque
grande parte do copy vende recursos que ainda não existem no produto (Lista Pix sem taxa, RSVP
automático no WhatsApp, música no convite, Módulos VIP "Manual de Padrinhos"/"Chutômetro" — previstos
para as sprints 14/15). Enquanto esses recursos não forem entregues, o padrão (`/`) continua a
landing atual, 100% verdadeira. Para pré-visualizar a página de vendas: `SALES_LANDING=true`.

- **`app/page.tsx`** — server component que alterna: flag ligada → `SalesLanding`; desligada (padrão)
  → `HomeLanding` (a landing atual, extraída sem alterações).
- **`components/landing/HomeLanding.tsx`** — a landing verdadeira de hoje, isolada e exportando
  `SHOWCASE_ENTRIES` para reuso.
- **`components/landing/SalesLanding.tsx`** — página de conversão PLG: Hero com badge/headline/CTAs
  (CTA primário → `/register`; CTA secundário → o **envelope 3D interativo real**), seção de
  **personas** (Noivos / Chá / Formatura·Corporativo), **tabela comparativa**, e o reuso das seções
  reais que já convertem (showcase, como funciona, FAQ, CTA final).
- **`landing.sales.*`** — todo o copy em pt/en/es (PT como voz principal).

### Decisões de integridade (divergências conscientes do brief acima)

Estes itens do brief **não** foram publicados, para não veicular informação falsa a usuários reais
(além de violarem políticas do Google e o CDC/CONAR sobre publicidade comparativa):

- **Sem prova social fabricada**: removidos o "⭐ 4.9/5 · 1.400 festas criadas este mês", o contador
  dinâmico de eventos ativos e o selo de LGPD. Nada de `aggregateRating`/schema de avaliação.
- **Coluna do concorrente genérica** ("outras plataformas"): os números específicos (3.69–4.19%) e
  nomes (iCasei/Casar.com) só entram com fonte datada e verificável. A tabela leva um rodapé honesto
  ("Comparativo geral… confirme antes de decidir").
- **Copy aspiracional (Pix/WhatsApp/música) mantido no texto, mas contido pela flag** até os recursos
  existirem — foi exatamente a razão de a página nascer atrás da flag.
- **Nacionalização dos nomes de amostra** ("Gabriel & Mariana", "Meu Chá Revelação") ficou pendente:
  os `SHOWCASE_ENTRIES` são compartilhados com a landing atual em produção, então a troca é uma
  decisão de produto a confirmar (nomes internacionais são defensáveis para uma marca trilíngue).

### Também incluído neste commit (demo interativa da home — sprints anteriores, ainda não commitadas)

- **`EnvelopeReveal.tsx`** — envelope com selo de cera "toque para abrir" (tap-to-open, acessível por
  teclado, seguro a `prefers-reduced-motion`).
- **`InteractiveInvitation.tsx`** — convite rolável dentro do telefone (carta, contagem regressiva,
  dois endereços cerimônia+recepção, timeline, tira horizontal de fotos, dress code, RSVP).
- **`DateReveal.tsx`** — data revelada por progressive-enhancement (visível sem JS).
- **`Reveal.tsx`** — ilha de scroll-reveal (framer-motion `whileInView`).
- **`InvitationBody.tsx`** — galeria pública convertida em tira horizontal com scroll-snap.
- `globals.css` / `layout.tsx` — paleta e fonte Cormorant Garamond dos tokens de design.

### Verificação

`tsc --noEmit`, `eslint`, `npm run build` limpos. Flag on→página de vendas / off→landing atual
(confirmado por marcadores estruturais). Sem overflow horizontal em 390/768/1440. Três locales sem
chave faltando. Ausência de schema de avaliação confirmada no HTML renderizado.