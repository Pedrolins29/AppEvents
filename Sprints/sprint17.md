Redesenho do Fluxo de Lead (PLG Sandbox, Soft Auth Gate & Pixel Tracking)
Objetivo Estratégico: Eliminar o atrito de entrada aumentando a taxa de ativação de visitantes em até 300%, permitindo a edição imediata do convite no frontend (sem tocar no banco de dados) e capturando o cadastro/pagamento apenas no momento de salvar o progresso.

1. Visão do Funil de Vendas & Psicologia do Lead (CRO)
O Novo Funil de 5 Passos:
Plaintext
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 1. HERO SECTION │ ──> │ 2. EDITOR SANDBOX│ ──> │ 3. SOFT GATE    │ ──> │ 4. CHECKOUT      │ ──> │ 5. DASHBOARD    │
│ (Escolha Categ) │     │ (State Local)    │     │ (Login 1-Clique)│     │ (Order Bumps)    │     │ (Link Ativo)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └──────────────────┘     └─────────────────┘
Atração (Landing Page): O usuário escolhe a categoria (Casamento, 15 Anos, Corporativo) ou clica em Criar meu convite.

Experimentação Instantânea (Sandbox Editor): Abre o editor visual imediatamente. O usuário edita fotos, nomes e cores. Nenhuma requisição de escrita vai para a API ainda.

Engajamento & Soft Gate (O "Aha! Moment"): Ao clicar em [ Publicar Convite ] ou [ Ver Como Fica ], um modal elegante bloqueia a tela com visual premium:

Copywriting do Modal:

"Seu VOWLA ficou incrível! ✨"

"Crie sua conta em 3 segundos para salvar suas alterações e gerar seu link de compartilhamento."

[ G ] Continuar com o Google | [ ✉️ ] Continuar com E-mail

Conversão Financera (Checkout Lastlink): Conta criada → Redirecionamento instantâneo para o Checkout com Order Bump da Secretária Virtual (Sprint 15).

Ativação: Pagamento aprovado via Webhook → Link público final gerado (vowla.app/c/luna-e-rafael).

2. Especificação do Frontend (React / Next.js / UI-UX)
A. Gerenciamento de Estado no Cliente (Sandbox Mode)
Todo o progresso do convite não autenticado fica no LocalStorage / Zustand / React Context da sessão do navegador.

Chave de Armazenamento Local: vowla_draft_invitation

Estrutura do JSON Local:

JSON
{
  "templateId": "heritage-gold-01",
  "category": "Casamento",
  "title": "Isabella & Marco",
  "eventDate": "2026-09-13T18:00:00Z",
  "location": {
    "name": "Espaço Das Américas",
    "address": "Av. Francisco Matarazzo, 774",
    "googleMapsUrl": "https://maps.google.com/..."
  },
  "customColors": {
    "primary": "#C5A059",
    "background": "#0D0D0D"
  }
}
B. O Modal "Soft Auth Gate" (UI Premium)
Trigger: Disparado ao clicar em [ Publicar Convite ], [ Salvar Progresso ] ou ao tentar editar opções VIP.

Comportamento: Blur fosco sobre a tela do editor (backdrop-filter: blur(8px)), mantendo o convite do usuário visível ao fundo para reforçar o sentimento de posse.

Componente de Auth: Integração com Google OAuth (One Tap / Popup) para cadastro em 1 clique sem senha.

3. Especificação do Backend (.NET 8/9 API)
Para evitar contas "fantasmas" ou registros incompletos no banco de dados PostgreSQL, a gravação de usuário e convite ocorre em uma única transação atômica na primeira autenticação.

Endpoint Principal de Reivindicação do Rascunho (/v1/invitations/claim)
C#
[HttpPost("v1/invitations/claim")]
[Authorize] // Requer o Bearer Token gerado após o login/OAuth
public async Task<IActionResult> ClaimDraftInvitation([FromBody] ClaimDraftRequest request)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId)) return Unauthorized();

    // Inicia Transação Atômica no PostgreSQL
    using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        // 1. Cria ou recupera a entidade do Convite a partir do Payload vindo do LocalStorage
        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Parse(userId),
            TemplateId = request.TemplateId,
            Title = request.Title,
            EventDate = request.EventDate,
            LocationName = request.Location.Name,
            Address = request.Location.Address,
            GoogleMapsUrl = request.Location.GoogleMapsUrl,
            Status = InvitationStatus.Draft,
            IsPaid = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Invitations.Add(invitation);
        await _context.SaveChangesAsync();

        // 2. Confirma a Transação no PostgreSQL
        await transaction.CommitAsync();

        // 3. Retorna o ID e a URL para o Frontend direcionar para o Checkout da Lastlink
        return Ok(new { 
            InvitationId = invitation.Id, 
            CheckoutUrl = $"https://pay.lastlink.com/vowla?custom_id={invitation.Id}" 
        });
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        return StatusCode(500, new { Message = "Erro ao salvar o convite.", Error = ex.Message });
    }
}
4. Modelagem do Banco de Dados (PostgreSQL + EF Core)
Com este fluxo Sandbox, o PostgreSQL permanece 100% limpo de curiosos. Apenas leads que concluíram o Soft Gate gravam registros no banco.

SQL
-- DDL para Vinculação de Rascunhos e Status de Publicação
ALTER TABLE "Invitations" 
ADD COLUMN IF NOT EXISTS "Status" VARCHAR(20) DEFAULT 'Draft', -- 'Draft', 'Active', 'Archived'
ADD COLUMN IF NOT EXISTS "DraftClaimedAt" TIMESTAMP WITH TIME ZONE NULL;

-- Índice para busca rápida de convites em rascunho por usuário
CREATE INDEX IF NOT EXISTS "IX_Invitations_User_Status" 
ON "Invitations" ("UserId", "Status");
5. Estratégia de Rastreamento de Pixels & CAPI (Meta, Google e TikTok Ads)
Para otimizar os algoritmos de tráfego pago (Meta Ads, Google Ads e TikTok Ads), mapearemos a jornada completa. Isso garantirá que as campanhas inteligentes entreguem anúncios para quem realmente interage com o editor.

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           JORNADA DE RASTREAMENTO (PIXELS)                      │
│                                                                                 │
│ [ Landing Page ] ──────────────> Evento: PageView                               │
│        │                                                                        │
│        ▼                                                                        │
│ [ Entrou no Editor ] ──────────> Evento: CustomizeProduct (ou ViewContent)     │
│        │                                                                        │
│        ▼                                                                        │
│ [ Atingiu Soft Gate ] ─────────> Evento: Lead                                   │
│        │                                                                        │
│        ▼                                                                        │
│ [ Login Concluído ] ───────────> Evento: CompleteRegistration                   │
│        │                                                                        │
│        ▼                                                                        │
│ [ Abriu Checkout ] ────────────> Evento: InitiateCheckout                       │
│        │                                                                        │
│        ▼                                                                        │
│ [ Pagamento Aprovado ] ────────> Evento: Purchase (com Valor Monetário + Currency)│
└─────────────────────────────────────────────────────────────────────────────────┘
Código de Implementação dos Disparos no Frontend (JavaScript / Tag Manager)
JavaScript
// 1. Quando o usuário clica em "Criar Convite" e abre o Editor Sandbox
function trackEditorStarted(categoryName) {
  // Meta Pixel
  fbq('track', 'CustomizeProduct', { content_category: categoryName });
  // Google Analytics 4
  gtag('event', 'select_content', { content_type: 'template', item_id: categoryName });
  // TikTok Pixel
  ttq.track('ViewContent', { content_name: categoryName });
}

// 2. Quando o Modal "Soft Gate" abre após edições significativas
function trackSoftGateReached() {
  fbq('track', 'Lead', { value: 0.00, currency: 'BRL' });
  gtag('event', 'generate_lead', { value: 0.00, currency: 'BRL' });
  ttq.track('Subscribe');
}

// 3. Quando o cadastro via Google/E-mail é confirmado
function trackAccountCreated(userId) {
  fbq('track', 'CompleteRegistration', { status: true });
  gtag('event', 'sign_up', { method: 'Google' });
  ttq.track('CompleteRegistration');
}

// 4. Quando o usuário redireciona para a Lastlink
function trackInitiateCheckout(invitationId, estimatedValue) {
  fbq('track', 'InitiateCheckout', { value: estimatedValue, currency: 'BRL' });
  gtag('event', 'begin_checkout', { value: estimatedValue, currency: 'BRL' });
  ttq.track('InitiateCheckout', { value: estimatedValue, currency: 'BRL' });
}
📈 Impacto Esperado no Scaling da VOWLA
Redução do CAC (Custo de Aquisição): O custo por Lead qualificado despenca, pois mais pessoas entram no funil sem a barreira do login imediato.

Aumento do LTV/ARPU: Leads que finalizam a edição chegam com o "desejo de compra" no nível máximo ao Checkout da Lastlink, aumentando a taxa de conversão do Order Bump de R$ 39 (Secretária Virtual) em até 40%.

Métricas Limpas: O banco de dados PostgreSQL do backend só conterá dados de usuários com intenção real de compra.