# Sprint 22 — Localizar os e-mails de RSVP (confirmação, aviso ao organizador, lembrete)

> **Status: implementado e verificado.** `dotnet test` (160/160 unitários) e `tsc`/`eslint`/
> `npm run build` limpos. Testes de integração não executados localmente (Docker indisponível
> nesta sessão), ficam para a CI confirmar.

## Contexto

Bug reportado: os e-mails de RSVP (confirmação ao convidado, aviso ao organizador quando alguém
responde, e o lembrete manual) sempre saíam em inglês, ignorando o idioma preferido de quem
recebe — diferente do e-mail de confirmação de conta, que já respeita `User.PreferredLocale`
desde uma sprint anterior. Investigação encontrou o `GuestService.cs` com 3 métodos de montagem
de e-mail (`Build*EmailBody`) inteiramente em inglês fixo no código, sem nenhum parâmetro de
locale.

## O que foi feito

- **Novo `backend/src/AppEvents.Application/Rsvp/Emails/RsvpEmailTemplates.cs`** — mesmo padrão de
  `Identity/Emails/ConfirmationEmailTemplates.cs` (dicionário de labels por locale + fallback para
  inglês em locale desconhecido). Três métodos (`BuildGuestConfirmation`, `BuildOrganizerNotification`,
  `BuildReminder`), cada um recebendo o locale como parâmetro. Inclui também um mapa de rótulos de
  `EventType` (os 6 valores reais) e de `RsvpStatus` por idioma — antes vazavam em inglês cru
  mesmo dentro de um e-mail pt/es (ex.: "Wedding", "Confirmed" apareciam sem tradução).
- **Datas também localizadas de verdade**: além dos rótulos de texto, a formatação da data
  (`dddd, MMMM d, yyyy`) agora usa `CultureInfo` explícita por idioma (`pt-BR`/`es-ES`/`en-US`) em
  vez da cultura padrão da thread do servidor — sem isso, mesmo com o resto do e-mail traduzido, a
  data continuaria saindo como "Monday, March 5" dentro de um e-mail em português. Esse detalhe não
  estava no plano original por extenso, mas é a mesma classe de bug sendo corrigida — sinalizando
  aqui a decisão.
- **`GuestService.cs`**: os 3 métodos antigos de montagem de HTML foram removidos, substituídos por
  chamadas ao novo `RsvpEmailTemplates`. Cada e-mail usa a fonte de locale certa:
  - Confirmação ao convidado → `request.Locale` (o idioma da página `/e/[slug]` no momento da
    submissão, validado contra `SupportedLocales.IsSupported` com fallback para inglês).
  - Aviso ao organizador → `organizer.PreferredLocale` (já carregado em `SubmitAsync`).
  - Lembrete manual → `organizer.PreferredLocale`, buscado via uma nova chamada a
    `_userRepository.GetByIdAsync(userId, ...)` dentro de `SendReminderEmailAsync` (esse método não
    carregava nenhum `User` antes — o convidado ainda não respondeu, então não há locale dele para
    usar; o organizador que disparou o lembrete é o único sinal disponível).
- **`CreateRsvpRequest`** ganhou um campo opcional `Locale` (mesmo padrão de `RegisterRequest.Locale`
  — nullable, default null), com a mesma regra de validação (`SupportedLocales.IsSupported`) em
  `CreateRsvpRequestValidator`.
- **Frontend**: `RsvpForm.tsx` agora captura `useLocale()` do next-intl (mesma receita já usada em
  `register/page.tsx`) e manda no `CreateRsvpRequest.locale` — cobre tanto o formulário aberto
  (link público) quanto o formulário pré-preenchido pelo link pessoal, já que os dois passam pelo
  mesmo componente.
- **Testes novos em `GuestServiceTests.cs`**: confirmação ao convidado localizada por
  `request.Locale` (pt/es/en + fallback quando ausente/desconhecido); aviso ao organizador
  localizado por `organizer.PreferredLocale` (com o locale do convidado deliberadamente diferente
  no mesmo teste, provando que cada e-mail usa a fonte certa); lembrete localizado pelo organizador
  buscado via `userId`. 160/160 testes unitários passam.

## Verificação

- `dotnet build --configuration Release`: sucesso, 0 erros.
- `dotnet test` (suíte unitária completa): **160/160 passam** (150 anteriores + 10 novos).
- Testes de integração (`GuestEndpointsTests.cs`): compilam sem alteração (os 5 call sites
  posicionais de `CreateRsvpRequest` continuam válidos, `Locale` é o último parâmetro opcional) —
  **não executados localmente**, Docker indisponível nesta sessão, ficam para a CI.
- `npx tsc --noEmit`: sem erros.
- `npx eslint .`: sem erros.
- `npm run build`: build de produção limpo.
- Verificação manual (pendente do usuário): criar evento com organizador de `PreferredLocale =
  "pt"`, abrir `/e/{slug}` com o seletor de idioma em "es", confirmar presença → e-mail de
  confirmação chega em espanhol (Mailpit), e-mail de aviso ao organizador chega em português; usar
  "Lembrar por e-mail" num convidado pendente → lembrete chega em português (idioma do
  organizador).

### Arquivos críticos
- Novo `backend/src/AppEvents.Application/Rsvp/Emails/RsvpEmailTemplates.cs`
- `backend/src/AppEvents.Application/Rsvp/Services/GuestService.cs`
- `backend/src/AppEvents.Application/Rsvp/Dtos/CreateRsvpRequest.cs`,
  `backend/src/AppEvents.Application/Rsvp/Validators/CreateRsvpRequestValidator.cs`
- `backend/tests/AppEvents.UnitTests/Rsvp/GuestServiceTests.cs`
- `frontend/src/types/rsvp.ts`, `frontend/src/components/RsvpForm.tsx`
