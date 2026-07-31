SPRINT 15: Secretária Virtual de RSVP & High-Margin Order Bump
Objetivo Estratégico: Implementar o motor de automação de lembretes e cobrança de presença (WhatsApp + E-mail), integrando a captura de pagamento via Order Bump da Lastlink, execução assíncrona performática no .NET e interface de controle no Dashboard do VOWLA.

1. Visão de Negócio & Growth (Order Bump & ARPU)
O Produto: "Secretária Virtual VOWLA" (Módulo de Automação de RSVP).

Posicionamento de Preço: Vendido como Order Bump no Checkout (R$ 39,00 a R$ 49,00 avulso) ou Incluso no VOWLA Premium/Pro.

Economia da Unidade (Unit Economics): Disparo de e-mails com custo irrisório e WhatsApp estratégico agendado via régua lógica, gerando um aumento imediato de +20% a +25% no Ticket Médio (ARPU) sem aumentar o Custo de Aquisição de Cliente (CAC).

Loop Viral (Aquisição Passiva): Cada mensagem enviada para o WhatsApp do convidado leva a assinatura: “Organizando seu próprio evento? Conheça a Secretária VOWLA.”

2. Modelagem do Banco de Dados (PostgreSQL / Entity Framework Core)
Para suportar resiliência, timezone e idempotência de pagamentos, expandimos as tabelas de convites e convidados e adicionamos a tabela de auditoria de Webhooks.

SQL
-- DDL de Atualização das Tabelas Existentes
ALTER TABLE "Invitations" 
ADD COLUMN IF NOT EXISTS "IsRsvpAutomationEnabled" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "RsvpAutomationFrequencyDays" INT DEFAULT 7,
ADD COLUMN IF NOT EXISTS "LastRsvpReminderSentAt" TIMESTAMP WITH TIME ZONE NULL;

ALTER TABLE "Guests" 
ADD COLUMN IF NOT EXISTS "LastReminderSentAt" TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS "ReminderCount" INT DEFAULT 0;

-- Tabela de Idempotência Crítica para Webhooks Financeiros
CREATE TABLE IF NOT EXISTS "WebhookLogs" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TransactionId" VARCHAR(100) NOT NULL UNIQUE,
    "Provider" VARCHAR(50) DEFAULT 'Lastlink',
    "ProcessedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_Guests_Automation_Pending" 
ON "Guests" ("InvitationId", "Status", "LastReminderSentAt");
3. Engenharia de Backend Otimizada (.NET 8/9 + Quartz.NET)
Refatoramos o Job para rodar em lotes (batching) de até 500 registros, prevenindo estouro de memória RAM do servidor, com persistência atômica por lote e timezone UTC seguro.

C#
using Microsoft.EntityFrameworkCore;
using Quartz;

public class RsvpReminderJob : IJob
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationQueueService _queueService;
    private const int BATCH_SIZE = 500;

    public RsvpReminderJob(IApplicationDbContext context, INotificationQueueService queueService)
    {
        _context = context;
        _queueService = queueService;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        var today = DateTime.UtcNow.Date;

        // Query Eficiente e Paginada: Busca direto os convidados pendentes de convites elegíveis
        var pendingGuests = await _context.Guests
            .Include(g => g.Invitation)
            .Where(g => g.Invitation.IsPaid 
                     && g.Invitation.IsRsvpAutomationEnabled 
                     && g.Invitation.EventDate > today
                     && g.Status == RsvpStatus.Pending
                     && (g.LastReminderSentAt == null || g.LastReminderSentAt < today.AddDays(-5)))
            .Take(BATCH_SIZE)
            .ToListAsync();

        if (!pendingGuests.Any()) return;

        foreach (var guest in pendingGuests)
        {
            var daysUntilEvent = (guest.Invitation.EventDate.Date - today).Days;

            // Régua Estratégica: Gatilhos em 30 dias, 15 dias e 7 dias (ou menos)
            if (daysUntilEvent == 30 || daysUntilEvent == 15 || daysUntilEvent <= 7)
            {
                // Enfileira disparo (WhatsApp / E-mail) via Message Broker ou Background Queue
                await _queueService.EnqueueRsvpReminderAsync(guest.Invitation, guest, daysUntilEvent);

                guest.LastReminderSentAt = DateTime.UtcNow;
                guest.ReminderCount++;
            }
        }

        // Persistência Atômica do Lote
        await _context.SaveChangesAsync();
    }
}
4. Endpoint Idempotente de Webhook da Lastlink (/v1/webhooks/lastlink)
Controller preparado para falhas de rede e retentativas da Lastlink, garantindo que o cliente nunca tenha a funcionalidade ativada em duplicidade ou perdida.

C#
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("v1/webhooks")]
public class LastlinkWebhookController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IInvitationService _invitationService;

    public LastlinkWebhookController(IApplicationDbContext context, IInvitationService invitationService)
    {
        _context = context;
        _invitationService = invitationService;
    }

    [HttpPost("lastlink")]
    public async Task<IActionResult> HandleLastlinkWebhook([FromBody] LastlinkPayload payload)
    {
        // 1. Validação de Status do Pagamento
        if (payload.Status != "approved") return Ok();

        // 2. Trava de Idempotência: Verifica se a transação já foi processada
        var isProcessed = await _context.WebhookLogs
            .AnyAsync(w => w.TransactionId == payload.TransactionId);

        if (isProcessed) return Ok();

        var invitationId = payload.CustomId;
        var purchasedSkus = payload.Items.Select(i => i.Sku).ToList();

        // 3. Ativação do Convite Principal
        await _invitationService.ActivateInvitationAsync(invitationId);

        // 4. Verificação e Ativação do Order Bump de Automação de RSVP
        if (purchasedSkus.Contains("SKU_ORDERBUMP_RSVP_AUTOMATION"))
        {
            await _invitationService.EnableRsvpAutomationAsync(invitationId);
        }

        // 5. Registro do Log de Auditoria
        _context.WebhookLogs.Add(new WebhookLog 
        { 
            TransactionId = payload.TransactionId,
            Provider = "Lastlink",
            ProcessedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return Ok();
    }
}
5. UI/UX e Engenharia de Conversão (Frontend)
A. O Order Bump no Checkout (Geração de Caixa Imediato)
Caixa de seleção visualmente destacada na tela de pagamento (Checkout Lastlink / Custom):

┌───────────────────────────────────────────────────────────────────┐
│ ⚡ OFERTA VIP: EVITE A CHATEAÇÃO DE COBRAR CONVIDADOS            │
│                                                                   │
│ [X] SIM! Quero ativar a Secretária Virtual VOWLA (+R$ 39,00)      │
│                                                                   │
│ Economize horas de estresse. A VOWLA envia lembretes automáticos  │
│ e elegantes via WhatsApp e E-mail para os convidados que          │
│ esquecerem de confirmar presença.                                 │
└───────────────────────────────────────────────────────────────────┘
B. Painel de Gestão no Dashboard (Transparência & Valor)
No painel do anfitrião, exibimos o status claro da automação e o fallback manual de 1-Clique:

Badge Status: 🟢 Secretária Virtual Ativa (ou CTA "Ativar Secretária" caso não tenha comprado o Order Bump).

Card de Métricas de RSVP:

"Confirmados: 82 | Pendentes: 28 | Recusados: 4"

"Próximo disparo automático em: 15 dias para o evento"

Fallback Manual (Disparo 1-Clique): Ao lado de cada convidado com status Pendente, existe o botão [ Cobrar via WhatsApp ]. Ao clicar, ele gera um link [https://wa.me/PHONE?text=](https://wa.me/PHONE?text=)... com a mensagem pré-formatada para o anfitrião disparar do próprio aparelho se desejar.

6. Régua Persuasiva de Copywriting para WhatsApp
As mensagens são desenhadas com tom de assistência profissional, removendo o peso de "cobrança" dos noivos ou organizadores.

📩 Disparo 1 (D-30 antes do evento) — Cortesia & Primeiro Alerta
"Olá, [NomeConvidado]! Sou a assistente virtual dos noivos [Noiva] & [Noivo] 💍.

Passando para lembrar que o grande dia está chegando! Para nos ajudar a organizar o buffet e a acomodação de todos com carinho, confirme sua presença em 5 segundos no link abaixo:

🔗 [LinkDoConvite]"

📩 Disparo 2 (D-15 antes do evento) — Chamada Direta à Ação
"Olá, [NomeConvidado]! Tudo bem?

Faltam apenas 15 dias para o evento de [Noiva] & [Noivo]! Precisamos fechar a lista oficial até o final desta semana.

Clique no link para confirmar (ou avisar que não poderá ir):

🔗 [LinkDoConvite]"

📩 Disparo 3 (D-7 antes do evento) — Urgência Elegante & Encerramento
"Olá, [NomeConvidado]! Último aviso:

A lista de convidados do evento de [Noiva] & [Noivo] será encerrada em breve. Para não ficar de fora da lista de entrada, confirme sua presença agora mesmo:

🔗 [LinkDoConvite]

---

## Implementação — Parte A (o que foi feito)

O brief pressupõe tabelas `Invitations`/`Guests` com status "Pendente" e uma lista de convidados
prévia — **nada disso existia**: o app só guardava uma resposta de RSVP *depois* que o convidado
confirmava (status só `Confirmed`/`Declined`, sem `Pending`), sem nenhum conceito de lista de
convidados, sem agendador de jobs e sem integração de WhatsApp. Ou seja, "lembrar quem ainda não
respondeu" era impossível sem antes construir a **fundação de lista de convidados**. Foi isso que
esta sprint entregou (Parte A); o **motor automático** (job diário 30/15/7 dias, atrás da
entitlement paga) ficou especificado como **Parte B**, para uma sprint seguinte — construir tudo
junto seria 2–3× uma sprint normal, e o WhatsApp **automático** é impossível sem uma Business API
(que não existe aqui).

### Fundação: RsvpResponse → Guest (fonte única de verdade)
- `RsvpResponse` virou **`Guest`**; `RsvpStatus` ganhou **`Pending`** (novo padrão). Cada guest tem
  um **`InviteToken`** único (link pessoal `/e/{slug}?g={token}`), `RespondedAtUtc`, `ReminderCount`,
  `LastReminderSentAtUtc`. Migração `AddGuestList` escrita à mão como **rename preservando dados**
  (não o drop+create que o EF gera): as respostas existentes viram guests já respondidos, com token
  gerado e `RespondedAtUtc = CreatedAtUtc`.
- **`GuestService`** unifica os dois caminhos: submissão pública (com token → atualiza aquele guest
  pendente; sem token → cria um "walk-in") e a gestão do organizador (adicionar/editar/remover,
  listar, lembrete por e-mail). Endpoints novos em `EventsController` (`/guests` CRUD +
  `/guests/{id}/remind-email`) e `PublicEventsController` (`/{slug}/guest/{token}` para prefill).

### Lembretes manuais (grátis, sem depender de pagamento)
- **WhatsApp = link `wa.me` manual**: o organizador clica "Cobrar no WhatsApp", abre o WhatsApp com a
  mensagem já pronta (incluindo o link pessoal do convidado) e envia do próprio aparelho. Zero
  dependência externa, funciona de verdade hoje. (`lib/whatsappLink.ts`)
- **E-mail**: botão "Lembrar por e-mail" dispara um e-mail real (infra `IEmailSender` já existente)
  com o link pessoal, e incrementa o contador de lembretes.
- **UI**: o bloco de presença read-only virou um **gerenciador de lista de convidados**
  (`GuestListManager`) na página de edição — adicionar convidado, badges de status (Pendente/
  Confirmado/Recusado), copiar link pessoal, cobrar via WhatsApp, lembrar por e-mail, remover.
  Página pública lê `?g=token` e pré-preenche o formulário, amarrando a submissão àquele convidado.
- i18n `guests.*` + `rsvpStatus.Pending` em pt/en/es (PT como voz principal).

### Melhoria da Sprint 14 (feita)
O webhook concedia entitlements no `Paid` mas **não revogava no `Refunded`/chargeback** (os campos
`Entitlement.RevokedAtUtc`/`IsActive()` existiam sem uso nesse caminho). Adicionado: um reembolso
com referência resolvível revoga as entitlements ativas correspondentes do usuário (+ log de
auditoria + testes).

### Escopo confirmado / decisões
- **Parte B adiada** (motor automático, atrás da entitlement `wedding.rsvp-whatsapp-reminders` da
  Sprint 14 + toggle por evento). O webhook da Sprint 14 já concede essa entitlement quando o SKU do
  order bump for mapeado — nenhum código novo de webhook necessário.
- Publicar o convite continua **grátis** (modelo das sprints 13/14); o `Invitation.IsPaid` do brief
  não se aplica. Só a automação (Parte B) será paga.

### Verificação
`dotnet test`: **145 unitários + 84 integração, todos passando** (incluindo `GuestServiceTests`,
`GuestEndpointsTests` cobrindo lista de convidados, link pessoal, prefill por token, lembrete por
e-mail, e toda a regressão do rename RSVP→Guest). `tsc`/`eslint`/`build` do frontend limpos.
Endpoints verificados ao vivo (guests sem auth → 401; prefill desconhecido → 404; submit com
`Pending` → 400).