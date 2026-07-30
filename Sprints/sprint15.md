Engenharia da Secretária Virtual de RSVP (.NET + PostgreSQL)
Objetivo: Implementar o motor de automação em .NET / C# com tarefas agendadas (CronJob) para disparar réguas de lembrete de confirmação de presença via WhatsApp e E-mail.

1. Modelagem do Banco de Dados (PostgreSQL / Entity Framework)
Expandir a entidade Invitation e criar a estrutura de controle de disparos:

SQL
ALTER TABLE "Invitations" 
ADD COLUMN "IsRsvpAutomationEnabled" BOOLEAN DEFAULT FALSE,
ADD COLUMN "RsvpAutomationFrequencyDays" INT DEFAULT 7,
ADD COLUMN "LastRsvpReminderSentAt" TIMESTAMP WITH TIME ZONE NULL;

ALTER TABLE "Guests" 
ADD COLUMN "LastReminderSentAt" TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN "ReminderCount" INT DEFAULT 0;
2. Arquitetura do Job Diário (.NET / Quartz.NET ou Hangfire)
Criar um serviço em segundo plano no .NET que executa uma vez ao dia (ex: 09:00 AM) com a Régua de Countdown Triggers (30 dias, 15 dias e 7 dias antes do evento):

C#
public class RsvpReminderJob : IJob
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationQueueService _queueService;

    public RsvpReminderJob(IApplicationDbContext context, INotificationQueueService queueService)
    {
        _context = context;
        _queueService = queueService;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        var today = DateTime.UtcNow.Date;

        // Busca convites ativos que compraram o Order Bump de Automação
        var activeInvitations = await _context.Invitations
            .Where(i => i.IsPaid && i.IsRsvpAutomationEnabled && i.EventDate > today)
            .ToListAsync();

        foreach (var invitation in activeInvitations)
        {
            var daysUntilEvent = (invitation.EventDate - today).Days;

            // Gatilhos de disparo: 30, 15 ou 7 dias antes do evento
            if (daysUntilEvent == 30 || daysUntilEvent == 15 || daysUntilEvent <= 7)
            {
                var pendingGuests = await _context.Guests
                    .Where(g => g.InvitationId == invitation.Id 
                             && g.Status == RsvpStatus.Pending
                             && (g.LastReminderSentAt == null || g.LastReminderSentAt < today.AddDays(-5)))
                    .ToListAsync();

                foreach (var guest in pendingGuests)
                {
                    await _queueService.EnqueueRsvpReminderAsync(invitation, guest, daysUntilEvent);
                    guest.LastReminderSentAt = DateTime.UtcNow;
                    guest.ReminderCount++;
                }
            }
        }

        await _context.SaveChangesAsync();
    }
}
3. Endpoint de Webhook da Lastlink (/v1/webhooks/lastlink)
Criar o controller idempotente em .NET que escuta a aprovação do pagamento, extrai o custom_id (ID do convite) e ativa as Features e Order Bumps comprados:

C#
[HttpPost("lastlink")]
public async Task<IActionResult> HandleLastlinkWebhook([FromBody] LastlinkPayload payload)
{
    if (payload.Status != "approved") return Ok();

    var invitationId = payload.CustomId;
    var purchasedSkus = payload.Items.Select(i => i.Sku).ToList();

    await _invitationService.ActivateInvitationAsync(invitationId);

    // Se o SKU do Order Bump de Automação de RSVP foi comprado:
    if (purchasedSkus.Contains("SKU_ORDERBUMP_RSVP_AUTOMATION"))
    {
        await _invitationService.EnableRsvpAutomationAsync(invitationId);
    }

    return Ok();
}