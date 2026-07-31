Arquitetura de Funil, Multi-Checkouts & Order Bumps (CRO + AOV)
Objetivo: Maximizar o Ticket Médio (AOV) integrando checkouts contextualizados na Lastlink com ofertas de 1 clique de alto valor percebido.

                    [ Editor Next.js: Clique em "Publicar" ]
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     (Contexto: Casamento)                       (Contexto: Chá Revelação)
   Lastlink Checkout #1                         Lastlink Checkout #2
 ┌───────────────────────────┐                ┌───────────────────────────┐
 │ Base: Convite  R$ 89,00   │                │ Base: Convite  R$ 69,00   │
 │ Bump 1: Manual Padrinhos  │                │ Bump 1: Game Chutômetro   │
 │ Bump 2: Lembretes RSVP    │                │ Bump 2: Calculadora Fralda│
 └───────────────────────────┘                └───────────────────────────┘
1. Criação da Matriz de Checkouts Segmentados na Lastlink
Não utilizar checkout único. Criar 4 URLs de Checkout isoladas no painel da Lastlink:

checkout-casamento: Focado em noivos.

checkout-cha-bebe: Focado em pais/mães.

checkout-aniversario-formatura: Focado em festas sociais.

checkout-corporativo: Focado em empresas e eventos comerciais.

2. Configuração do Copy dos Order Bumps por Niches
Checkout Casamento:

🟩 Order Bump #1 (+ R$ 29,90): Manual dos Padrinhos VIP & Trajes

"Ative uma página exclusiva com a paleta de cores dos vestidos, trajes dos padrinhos, dicas de etiqueta e cronograma do grande dia."

🟩 Order Bump #2 (+ R$ 29,90): Secretária Virtual: Cobrador de RSVP no WhatsApp

"Não passe a vergonha de cobrar convidados um por um! O sistema envia lembretes educados e automáticos no WhatsApp apenas para quem não confirmou."

Checkout Chá Revelação / Bebê:

🟩 Order Bump #1 (+ R$ 24,90): Game do Chutômetro: Votação "Menino ou Menina"

"Permita que seus convidados dêem palpites com placar ao vivo para exibir no dia do chá!"

🟩 Order Bump #2 (+ R$ 14,90): Atribuição Inteligente de Fraldas & Enxoval

Checkout Corporativo:

🟩 Order Bump #1 (+ R$ 49,90): Sistema de Passaporte QR Code para Portaria

🟩 Order Bump #2 (+ R$ 39,90): Remoção Completa da Marca "AppEvents" (White-Label)

---

## Implementação (o que foi feito)

Escopo desta sprint: **apenas a infraestrutura de comércio** — modelo de Order/Entitlement, endpoint
de webhook, gate de features reutilizável, espaços de configuração para os links de checkout reais
e para os pixels de anúncio. Os 5 recursos premium do brief (Manual dos Padrinhos, Secretária de
RSVP no WhatsApp, Chutômetro, Calculadora de Enxoval, Passaporte QR, White-Label) **não foram
construídos** — cada um vira sua própria sprint depois, já desbloqueada pelo gate criado aqui.

Não existia nenhuma documentação real da API/webhook da Lastlink disponível, e o usuário ainda vai
criar os 4 links de checkout no painel da Lastlink manualmente. Por isso:

- **Nenhuma chamada de saída para a Lastlink existe** — a criação dos checkouts é 100% manual, no
  painel deles. O código só **recebe** a notificação de compra (webhook) e **linka** para os URLs
  configurados.
- **Formato do payload do webhook é uma suposição documentada, não verificada.** `LastlinkWebhookPayloadParser`
  tenta várias variações de nome de campo comuns (`order_id`/`id`, `amount_cents`/`amount`,
  `products`/`items`/`bumps`) e está marcado em comentário como "confirmar contra doc real". A
  assinatura HMAC-SHA256 (header `X-Lastlink-Signature`) segue o padrão mais comum do mercado
  (estilo Stripe/Hotmart), igualmente não verificado.
- **Correlação pedido→usuário via query param**: o link de checkout recebe
  `?appeventsRef={userId}.{eventId}`; se a Lastlink ecoar esse parâmetro de volta no webhook (comum,
  mas não confirmado), o pedido é associado automaticamente. Caso contrário, o pedido é salvo como
  `Unmatched` (não descartado) para reconciliação manual futura.

### Backend

- `Domain/Payments/`: `Order`, `Entitlement`, `OrderStatus`, `PremiumFeatureKeys` (as 6 chaves dos
  recursos premium, incluindo `wedding.rsvp-whatsapp-reminders` — mesma feature da sprint 15).
- `Application/Payments/`: `IEntitlementService` (o gate reutilizável — `HasEntitlementAsync`),
  `IPaymentWebhookProcessor` (verifica assinatura → parseia → grava Order idempotente → concede
  Entitlements pelos produtos mapeados).
- `Infrastructure/Payments/`: `HmacWebhookSignatureVerifier`, `LastlinkWebhookPayloadParser`,
  `PremiumProductCatalog` (lê `Lastlink:ProductKeyMap` da configuração).
- `Api/Controllers/PaymentsController.cs`: `POST /api/webhooks/lastlink` (público, novo
  `WebhookPolicy` de rate limit) e `GET /api/payments/entitlements` (autenticado).
- `appsettings.json`: nova seção `Lastlink: { WebhookSecret, ProductKeyMap }` — em branco, para
  preencher quando os checkouts reais existirem, sem precisar mexer em código.
- Migração `AddPaymentsAndEntitlements` (tabelas `Orders`/`Entitlements`) gerada e aplicada.

### Frontend

- `components/UpsellBanner.tsx`: banner opcional de upgrade ao lado do botão "Publicar" — **nunca
  bloqueia a publicação**. Só aparece com `NEXT_PUBLIC_PREMIUM_UPSELL=true` **e** um link de
  checkout configurado para o tipo do evento.
- `lib/checkoutUrls.ts`: mapeia `EventType` → `NEXT_PUBLIC_LASTLINK_CHECKOUT_*`. **Gap conhecido**:
  não existe `EventType.Corporate` hoje, então o slot `_CORPORATE` fica reservado, sem uso.
- `components/AdPixels.tsx`: pixels do Meta/Google/TikTok, cada um independente — sem o ID
  configurado, nada carrega (nenhuma tag de script, nenhuma requisição). `next.config.ts` só
  relaxa a CSP para os domínios de cada pixel quando o ID correspondente está definido.
  `/obrigado`: página de agradecimento pronta para dispar o evento de "Compra", contingente a a
  Lastlink suportar redirecionamento pós-pagamento configurável (não verificado).

### Verificação

`dotnet test`: **140 testes unitários + 79 de integração, todos passando** (incluindo
`EntitlementServiceTests`, `PaymentWebhookProcessorServiceTests`, `PaymentsEndpointsTests`).
`tsc`/`eslint`/`build` do frontend limpos. Testado manualmente contra o backend real: assinatura
ausente/incorreta → 401; payload corrompido → 400; payload válido com produto mapeado → 200 +
entitlement concedido; replay do mesmo `order_id` → idempotente. CSP e bundle do cliente verificados
nos dois estados (pixels ausentes = comportamento de hoje inalterado; pixels configurados = CSP
relaxada exatamente para os domínios necessários, IDs corretamente inseridos no bundle).