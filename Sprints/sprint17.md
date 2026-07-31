Esta refatoração une o melhor dos dois mundos: Velocidade Lean de Lançamento (utilizando o InvitationPhoneMockup para a pré-visualização instantânea sem sobrecarregar a engenharia) e uma Estratégia Agressiva de Retargeting Multi-Channel (Pixel do Meta, Google e TikTok) para transformar todo visitante indeciso que experimentou o mockup, mas não concluiu o cadastro, em um cliente de alto valor.Abaixo está o documento oficial e completo da Sprint 17 (Revisada & Lean).🚀 SPRINT 17 (REVISADA & LEAN): Experimento de Pré-Visualização, Soft Gate & Pixel Retargeting de AbandonoObjetivo Estratégico: Maximizar a taxa de ativação no topo/meio de funil permitindo que o visitante personalize o convite em tempo real na página de modelos (InvitationPhoneMockup) sem criar conta ou fazer uploads pesados. Caso o usuário não conclua o cadastro no Soft Gate, ele será marcado por Pixels de Rastreamento para campanhas de retargeting de alto ROI.1. Mapeamento do Funil Lean & Psicologia de ConversãoPlaintext┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   JORNADA LEAN DE ALTA CONVERSÃO VOWLA                                  │
│                                                                                                        │
│ [ 1. LANDING/SEO ] ──> [ 2. PREVIEW NO MOCKUP ] ──> [ 3. SOFT GATE EMAIL ] ──> [ 4. CHECKOUT LASTLINK ] │
│  Ex: /convite-casamento   Digitou Nome/Data (Sem DB)    Formulário Simples          Order Bump R$ 39 (RSVP) │
│                                  │                                                                     │
│                                  └────── (Se fechar sem cadastrar) ──> [ 🔥 PIXEL DE RETARGETING ]       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
Entrada por SEO Programático / Ads: O visitante chega via Landing Page de Categoria (ex: /criar-convite-de-casamento)."Efeito IKEA" Instantâneo (Preview no Mockup): Na própria vitrine de temas, o visitante digita Nome do Evento + Data diretamente no componente InvitationPhoneMockup. O convite se atualiza visualmente em tempo real. Zero chamadas de escrita no PostgreSQL.Soft Gate de Cadastro (E-mail/Senha Tradicional): Ao clicar em [ Salvar e Continuar ], abre-se o modal solicitando apenas E-mail + Senha. (Observação: O Google OAuth/One Tap está mapeado e adia-se para a Sprint 17B após configuração do Google Cloud Console).Rede de Segurança (Pixel Tracking de Abandono): Se o usuário digitar os dados no mockup mas fechar a aba sem se cadastrar, o evento CustomizeProduct com os parâmetros do convite já foi disparado. Ele entrará em um público customizado de Retargeting de Alta Intenção.2. Especificação do Frontend (React / Next.js)A. Componente de Pré-Visualização Dinâmica (InvitationPhoneMockup.jsx)O estado da pré-visualização fica isolado na memória do componente (React.useState) ou no LocalStorage leve.JavaScriptimport { useState } from 'react';
import SoftGateModal from './SoftGateModal';
import { trackPreviewInteraction, trackSoftGateTriggered } from '@/lib/pixelEvents';

export default function InvitationPhoneMockup({ selectedTemplate }) {
  const [guestName, setGuestName] = useState('Isabella & Marco');
  const [eventDate, setEventDate] = useState('2026-09-13');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (field, value) => {
    if (field === 'name') setGuestName(value);
    if (field === 'date') setEventDate(value);

    // Dispara disparo leve do Pixel no primeiro caractere digitado (Engajamento do Lead)
    trackPreviewInteraction(selectedTemplate.category, selectedTemplate.id);
  };

  const handleOpenSoftGate = () => {
    // Dispara o Pixel de Intenção de Compra (Lead Frio -> Lead Morno)
    trackSoftGateTriggered(selectedTemplate.id);
    setIsModalOpen(true);
  };

  return (
    <div className="phone-mockup-wrapper">
      {/* Controles do Sandbox Simplificado */}
      <div className="preview-controls bg-[#1A1A1A] p-4 rounded-t-xl space-y-3">
        <input 
          type="text" 
          value={guestName} 
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Nome do Evento / Casal"
          className="w-full bg-[#0D0D0D] border border-gray-700 text-white p-2 rounded"
        />
        <input 
          type="date" 
          value={eventDate} 
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-full bg-[#0D0D0D] border border-gray-700 text-white p-2 rounded"
        />
      </div>

      {/* Renderização do Convite no Mockup Existente */}
      <div className="phone-screen">
        <h2 className="template-title">{guestName}</h2>
        <p className="template-date">{eventDate}</p>
      </div>

      <button 
        onClick={handleOpenSoftGate}
        className="w-full bg-[#C5A059] hover:bg-[#b08d48] text-black font-bold py-3 rounded-b-xl transition-all"
      >
        Salvar meu VOWLA e Continuar →
      </button>

      {/* Modal Soft Gate (E-mail e Senha) */}
      <SoftGateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        draftData={{ templateId: selectedTemplate.id, guestName, eventDate }}
      />
    </div>
  );
}
3. Rastreamento de Pixels & Estratégia de Retargeting (A "Rede de Segurança")Como não exigimos login imediato, os Pixels do Meta Ads, Google Ads e TikTok Ads atuam como nosso imã de captura secundário.Plaintext┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          MAQUINA DE RETARGETING DE VISITANTES                          │
│                                                                                        │
│  [ Visitante digita Nome no Mockup ] ──> Dispara Pixel: 'CustomizeProduct'             │
│  [ Abandona a página sem cadastrar ] ──> Cai no Público Personalizado (3 dias)        │
│                                                                                        │
│  🔥 CAMPANHA DE ADS NO INSTAGRAM / TIKTOK:                                            │
│  Copy: "Seu convite VOWLA está te esperando. Clique para concluir em 1 minuto."        │
└────────────────────────────────────────────────────────────────────────────────────────┘
A. Mapeamento de Eventos no Frontend (/lib/pixelEvents.js)JavaScript// 1. Disparado quando o usuário altera o Nome ou Data no Mockup (Interação Real)
export function trackPreviewInteraction(category, templateId) {
  // Meta Pixel (Facebook)
  if (typeof window.fbq !== 'undefined') {
    window.fbq('trackCustom', 'InteractedWithPreview', {
      content_category: category,
      content_ids: [templateId]
    });
  }
  // Google Analytics 4 / Google Ads
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'select_content', {
      content_type: 'template_preview',
      item_id: templateId
    });
  }
}

// 2. Disparado quando clica em "Salvar meu VOWLA" (Abertura do Modal Soft Gate)
export function trackSoftGateTriggered(templateId) {
  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', 'Lead', { content_ids: [templateId] });
  }
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'generate_lead');
  }
}

// 3. Disparado quando conclui o cadastro no Soft Gate
export function trackRegistrationComplete(userId) {
  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', 'CompleteRegistration');
  }
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'sign_up', { method: 'Email' });
  }
}
B. Copywriting das Campanhas de Retargeting (Ads)Para os usuários que dispararam InteractedWithPreview mas NÃO dispararam CompleteRegistration:Anúncio no Instagram Stories / Reels (Vídeo/Carrossel):Criativo: Mockup do celular rodando a animação do selo de cera abrindo o convite.Headline: "Não deixe seu convite no rascunho."Primary Text: "Você começou a personalizar o seu VOWLA. Finalize agora para garantir seu link com confirmação de presença (RSVP) e mapa integrado."CTA: "Concluir meu Convite"4. Especificação do Backend (.NET 8/9) & Banco de DadosA. Controller de Cadastro Unificado + Reivindicação do Rascunho (/v1/auth/register-draft)C#[ApiController]
[Route("v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(IApplicationDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register-draft")]
    public async Task<IActionResult> RegisterWithDraft([FromBody] RegisterWithDraftRequest request)
    {
        // 1. Verifica se o e-mail já está cadastrado
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { Message = "Este e-mail já possui conta. Faça login para continuar." });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 2. Cria o Usuário com PasswordHash (Fluxo E-mail/Senha Tradicional)
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);

            // 3. Grava o Convite criado na pré-visualização
            var invitation = new Invitation
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TemplateId = request.DraftData.TemplateId,
                Title = request.DraftData.GuestName,
                EventDate = DateTime.SpecifyKind(request.DraftData.EventDate, DateTimeKind.Utc),
                Status = InvitationStatus.Draft,
                IsPaid = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Invitations.Add(invitation);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // 4. Gera JWT de sessão
            var token = _tokenService.GenerateJwtToken(user);

            return Ok(new
            {
                vowlaAuthToken = token,
                invitationId = invitation.Id,
                checkoutUrl = $"https://pay.lastlink.com/vowla?custom_id={invitation.Id}"
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { Message = "Erro ao processar cadastro.", Error = ex.Message });
        }
    }
}
B. Schema do PostgreSQL (Mantido Limpo)SQL-- Estrutura de Suporte aos Convites e Usuários
ALTER TABLE "Invitations" 
ADD COLUMN IF NOT EXISTS "Status" VARCHAR(20) DEFAULT 'Draft';

CREATE INDEX IF NOT EXISTS "IX_Invitations_Status_User" 
ON "Invitations" ("UserId", "Status");
5. Integração com SEO ProgramáticoAs landing pages de categoria construídas com base no Sprint 13 (/criar-convite-de-casamento, /criar-convite-de-15-anos, etc.) alimentarão este funil diretamente:Ao acessar /criar-convite-de-casamento, o InvitationPhoneMockup da primeira dobra da página já carrega automaticamente com um template pré-selecionado de Casamento e o título fictício "Sofia & Gabriel".O visitante altera os dados no mockup em 5 segundos, dispara os Pixels de Engajamento e entra na esteira de conversão da VOWLA.🎯 Resumo de Execução do Sprint 17 (Revisada)FuncionalidadeStatus / AçãoPreview no MockupAtivo (Fase 1 Lean) — Usa InvitationPhoneMockup com inputs de Nome e Data.Google OAuth / One TapAdiado (Sprint 17B) — Mantido Soft Gate via E-mail e Senha tradicional por enquanto.Pixel TrackingAtivo — Mapeamento de interações para campanhas de Retargeting de visitantes indecisos.SEO ProgramáticoAtivo — Landing pages de categoria alimentando o mockup da Hero Section.

---

## Implementação (o que foi feito)

Este brief ("Revisada & Lean") já reflete a reconciliação feita anteriormente com o brief original
de sandbox completo (editor sem login + OAuth do Google + endpoint de claim atômico) — aquele brief
assumia capacidades que não existiam no código (OAuth, editor visual pré-auth, biblioteca de estado
client-side, upload de fotos sem `eventId`). O que segue é exatamente o que foi construído, mapeado
contra este documento.

### Piece A — Páginas de SEO programático por categoria (Ativo, como descrito)
- Hub `/criar-convite` + rota parametrizada `/criar-convite/[categoria]` (um arquivo só, não 6/5
  páginas separadas — evita duplicação e o risco de "doorway pages" apontado na skill de pSEO).
  Slugs: `casamento`, `aniversario`, `formatura`, `debutantes`, `cha-de-bebe` — mapeados 1:1 para os
  `EventType` reais (`frontend/src/lib/inviteCategories.ts`).
- **`GenderReveal` foi propositalmente deixado de fora**: `SHOWCASE_ENTRIES` não tem nenhuma entrada
  para esse tipo e não existe foto correspondente em `public/showcase/` — lançar essa página com uma
  vitrine vazia/placeholder seria pior que não lançá-la. Fica como fast-follow quando existir um
  showcase real.
- Cada página tem copy própria (não é texto genérico com a categoria trocada), reaproveita
  `SHOWCASE_ENTRIES`/`InvitationPhoneMockup` (Sprint 13) para a vitrine "veja ao vivo", FAQ real
  (vira `FAQPage` JSON-LD) e `BreadcrumbList` JSON-LD — sem schema `Event` (não há
  `startDate`/local reais nessas páginas).
- Copy revisada para citar **só recursos que já existem de verdade**: RSVP, contagem regressiva,
  cronograma, dress code, galeria de fotos, e — graças à Sprint 15 — lista de convidados com
  lembrete automático por e-mail e cobrança fácil via WhatsApp. Nada de check-in por QR code ou jogo
  de palpites (esses já apareciam em `landing.sales.*` como aspiracionais e não foram propagados
  para as páginas novas).

### Piece B — Preview instantâneo no InvitationPhoneMockup (Ativo, como descrito)
Exatamente o "Preview no Mockup" da Fase 1 Lean deste documento: **zero requisições de escrita**, só
`React.useState` no cliente. Para reaproveitar a renderização real do `InvitationPhoneMockup`
(Sprint 13) em vez de duplicá-la, ele foi dividido em:
- `InvitationPhoneMockupView.tsx` (novo) — o núcleo apresentacional puro, sem hooks, importável
  tanto de um Server Component quanto de um Client Component.
- `InvitationPhoneMockup.tsx` — vira um wrapper fino que resolve os labels de i18n no servidor e
  delega para a view. Zero mudança na sua única outra chamadora (`HomeLanding.tsx`).
- `InstantPreview.tsx` (novo, `"use client"`) — nome + data + tema (os 4 temas reais, seletor
  reaproveitando `TemplateCard`) atualizam o mockup ao vivo. Só a tela de contagem regressiva é
  renderizada (a única realmente derivada do que a pessoa digitou — as outras mostrariam texto de
  exemplo desconectado do que foi preenchido). Embutido em cada página de categoria
  (`defaultEventType` já travado na categoria).

### Pixels — reaproveitados da Sprint 14, sem infraestrutura nova
Segue o padrão já existente (`UpsellBanner.tsx`): chamadas `window.fbq?.(...)`/`gtag?.(...)`/
`ttq?.track?.(...)` protegidas por `?.` — sem pixel configurado, é um no-op silencioso. Disparado:
`ViewContent`-equivalente na chegada da página de categoria, `Lead`-equivalente quando nome+data
estão preenchidos no preview, `CompleteRegistration`-equivalente (status pendente) no clique do CTA.

### O que este brief pede e ainda **não** foi construído
- **`POST /v1/auth/register-draft`** (endpoint atômico que cria usuário + convite numa transação só)
  — deliberadamente adiado. Construir esse endpoint antes de medir se o preview em si já aumenta a
  ativação seria repetir o mesmo erro do brief original (investir em infraestrutura sem dados que a
  justifiquem). Hoje o CTA do preview leva para `/register`, o fluxo de cadastro já existente.
- **Preview embutido em `/templates`** (a "vitrine de temas") — só foi embutido nas páginas de
  categoria por enquanto; adicionar em `/templates` é uma extensão barata quando fizer sentido.
- **Campanhas de retargeting reais** (Meta/Google/TikTok Ads) — configuração de contas de anúncio e
  criação de campanhas é trabalho de marketing/mídia paga, fora do escopo de engenharia.
- **Google OAuth** — confirmado adiado também por este documento ("Sprint 17B"), mesmo padrão do
  Lastlink/WhatsApp: precisa de credenciais reais do Google Cloud Console antes de integrar de
  verdade.

### Verificação
`npx tsc --noEmit` / `npx eslint` / `npm run build` limpos (build lista as 7 páginas novas: hub +
5 categorias). `dotnet test`: 145/145 testes unitários passando (zero arquivos de backend tocados
por esta sprint); os 84 testes de integração não rodaram nesta sessão por falta de conexão com o
Postgres do WSL2 (ambiente, não regressão). Testado ao vivo: as 5 categorias respondem 200, slugs
desconhecidos e `cha-revelacao` (adiado) respondem 404, JSON-LD (`BreadcrumbList`+`FAQPage`)
presente no HTML renderizado no servidor, sitemap com as 6 URLs novas, sem overflow horizontal em
390/768/1440, digitar no preview atualiza o mockup com **zero** chamadas de rede novas, e as 3
línguas (incluindo acentuação correta em espanhol) renderizam sem chave faltando.