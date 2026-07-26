using AppEvents.Domain.Rsvp;

namespace AppEvents.Application.Rsvp.Dtos;

public record RsvpResponseDto(Guid Id, string GuestName, RsvpStatus Status, DateTime CreatedAtUtc);

public record AttendanceSummary(int Total, int Confirmed, int Declined);

public record AttendanceResponse(AttendanceSummary Summary, IReadOnlyList<RsvpResponseDto> Responses);
