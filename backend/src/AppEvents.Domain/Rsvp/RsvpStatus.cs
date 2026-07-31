namespace AppEvents.Domain.Rsvp;

public enum RsvpStatus
{
    // Default for an organizer-added invitee who hasn't responded yet - the state the reminder
    // engine targets. A guest created by an open (tokenless) public submission is never Pending.
    Pending,
    Confirmed,
    Declined,
}
