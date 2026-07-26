using AppEvents.Application.Rsvp.Dtos;

namespace AppEvents.Application.Rsvp.Services;

public interface IRsvpService
{
    Task<RsvpResponseDto> SubmitAsync(string slug, CreateRsvpRequest request, CancellationToken cancellationToken = default);

    Task<AttendanceResponse> GetAttendanceAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);
}
