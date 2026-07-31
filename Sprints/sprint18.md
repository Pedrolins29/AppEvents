# Sprint 18 — Integração Vercel: ISR nas páginas públicas, storage R2, CORS multi-origem, deploy de fumaça

## Briefing original (resumo)

O usuário trouxe um briefing externo propondo 4 integrações específicas da Vercel: geração de
imagens OG dinâmicas via `@vercel/og` para o compartilhamento no WhatsApp, ISR (Incremental Static
Regeneration) para a página pública do convite absorver picos de acesso de convidados, geração
estática massiva (~5.000+ páginas) de SEO programático, e Edge Middleware para roteamento de
domínios próprios — além de alertar para dois limites do plano gratuito da Vercel (cota de 1.000
imagens otimizadas/mês via `next/image`, e timeout de 10s em funções serverless).

O briefing usa a marca "VOWLA" / `vowla.app` / rota `/c/[slug]` — nenhum dos quais corresponde a
este app (segue "AppEvents", rota pública é `/e/[slug]`). Tratado como linguagem ilustrativa do
documento externo, não como pedido de rebranding — nada neste sprint mexeu em nome ou rotas.

## O que já estava pronto (não reconstruído)

- **Imagens OG dinâmicas por convite**: `frontend/src/app/e/[slug]/opengraph-image.tsx` já usa
  `next/og`'s `ImageResponse` — isso **é** o `@vercel/og`, incorporado ao core do Next. Busca o
  evento real, renderiza nome/data/tema em Playfair Display real, com fallback gracioso. Existe
  também uma versão estática site-wide em `frontend/src/app/opengraph-image.tsx`.
- **SEO programático**: `frontend/src/app/criar-convite/[categoria]/page.tsx` já usa
  `generateStaticParams()` (5 categorias), totalmente estático, sem dependência de API. O número de
  "5.000+ páginas" do briefing é aspiracional para uma expansão futura (cidade × tema) sem pesquisa
  de palavra-chave ainda feita — sinalizado como iniciativa futura, não reivindicado como pronto.
- **`next/image` não é usado em lugar nenhum do app** (toda imagem é `<img>` simples) — isso já
  contorna inteiramente a cota de 1.000 imagens/mês da Vercel. Decisão: manter assim.

## Confirmado com o usuário antes de implementar

- Edge Middleware de domínio próprio: **adiado**. Não existe recurso de produto para rotear (sem
  campo `Domain` no `Event`, sem fluxo de verificação) — construir o middleware agora seria
  scaffolding sem função real por trás.
- Migração de storage de imagens para Cloudflare R2: **construir agora, só código** — sem bucket
  real para testar, então fica atrás de uma flag de config com fallback para o comportamento local
  de hoje.
- Deploy Vercel: usuário tem CLI/conta autenticada (confirmado — `vercel whoami` retornou
  `pedrohcl29-4702`) e pediu para tentar um deploy real.
- **Pergunta sem resposta, seguindo a opção recomendada por padrão**: estratégia de staleness do
  ISR — revalidação por tempo simples (`revalidate = 60`) em vez de tempo + webhook de invalidação
  sob demanda. Como não há tráfego de produção ainda, até 60s de atraso nas edições do organizador é
  aceitável por ora — mas é uma decisão a revisitar antes do lançamento real, não definitiva.

## O que foi construído

### 1. ISR em `/e/[slug]`
Antes: busca 100% dinâmica (`cache: "no-store"`), até 3 chamadas à API .NET por request (incl. o
prefill de convidado via `?g=token`). Agora:
- `publicEventsApi.get()` usa `next: { revalidate: 60 }`; `page.tsx` declara
  `export const revalidate = 60`.
- O prefill por token (`getGuestPrefill`) **saiu do servidor** — não pode ser embutido numa página
  cacheada e compartilhada entre convidados. Agora `RsvpForm.tsx` busca isso no cliente via
  `useEffect`, preenchendo só os campos ainda vazios (evita sobrescrever o que o convidado já
  digitou durante a espera). Um token inválido/expirado ainda cai silenciosamente no formulário
  aberto, como antes.
- `InvitationBody.tsx` perdeu a prop `guestPrefill` (não é mais passada por nenhum componente).
- **Limitação aceita, não escondida**: o ISR também cacheia respostas `notFound()` — um convidado
  que tenta o link pouco antes da publicação pode ver um 404 em cache por até 60s. Aceitável
  pré-lançamento.

### 2. `R2ImageStorageService` (só código, atrás de flag)
- Extraída a validação compartilhada (tamanho, extensão, assinatura de bytes) de
  `LocalImageStorageService` para uma classe interna `ImageValidation`, reutilizada por ambas as
  implementações — evita que as duas divirjam silenciosamente.
- Nova `R2ImageStorageService.cs` usando `AWSSDK.S3` (R2 é compatível com a API S3), registrada
  condicionalmente em `DependencyInjection.cs` via `Storage:Provider` ("Local" padrão | "R2").
- `appsettings.json`: nova seção `Storage:R2:*` com placeholders em branco (mesmo padrão já usado
  para `Lastlink:` desde a Sprint 14).
- **Correção necessária, não mencionada no briefing original**: a CSP `img-src` do
  `next.config.ts` só permitia a origem da API .NET — uma URL do R2 seria bloqueada silenciosamente
  pelo navegador. Adicionada via nova env var `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`.
- Testes unitários com `IAmazonS3` mockado (NSubstitute) — cobre upload válido, extensão/tamanho/
  conteúdo inválidos (e confirma que `PutObjectAsync` nunca é chamado nesses casos). Sem bucket real
  para testar contra, então essa é a extensão possível de verificação por enquanto.

### 3. CORS multi-origem
`Program.cs` agora lê `Cors:AllowedOrigins` (plural, separado por vírgula), com fallback para o
antigo `Cors:AllowedOrigin` (singular) e depois para `http://localhost:3000` — para permitir
adicionar um domínio Vercel futuro sem mudança de código. Testes de integração cobrindo os 3
caminhos em `CorsEndpointsTests.cs` (não executados localmente nesta sessão — Docker Desktop
indisponível; rodarão no CI, que já sobe um Postgres real).

### 4. Deploy de fumaça na Vercel
`vercel link` + `vercel deploy` a partir de `frontend/`. Como era o primeiro deploy do projeto, a
própria Vercel promoveu automaticamente para produção (comportamento da plataforma, não escolha
deste sprint) — URL: `https://frontend-ochre-eight.vercel.app`. Confirmado: `/`, `/criar-convite`,
`/criar-convite/casamento` e `/templates` respondem 200 com CSP ativa; `/login` e `/events`
respondem 200 (não tentam alcançar a API no carregamento inicial). **Achado**: `/e/[slug]` retorna
500 quando a API é inalcançável — `publicEventsApi.get()` só trata `404` como caso especial; uma
falha de rede (não uma resposta HTTP) não é capturada e vira uma exceção não tratada. Isso já
existia antes deste sprint (não é regressão da mudança de ISR) — sinalizado como um follow-up de
resiliência, não corrigido aqui (fora do escopo combinado).

## Verificação
- Backend: `dotnet build` limpo, `dotnet test` (150/150 testes unitários passando, incluindo os 5
  novos de R2). Testes de integração (incl. `CorsEndpointsTests`) não executados localmente por
  falta de Postgres/Docker nesta sessão — validação fica para o CI.
- Frontend: `tsc --noEmit`, `eslint`, `npm run build` — todos limpos.
- Deploy Vercel: verificado manualmente conforme acima.

### Adiado / fora de escopo
- Edge Middleware de domínio próprio (depende de um recurso de produto ainda não desenhado).
- Expansão de SEO programático além das 5 categorias atuais.
- Hospedagem real do backend .NET + Postgres (nenhuma decisão de infra tomada — Render/Fly.io/
  Hetzner + Supabase/Neon continuam apenas opções do material de referência do usuário).
- Correção da degradação graciosa de `/e/[slug]` quando a API está fora do ar (achado do deploy,
  não pedido original).
