namespace AppEvents.Application.Common.Exceptions;

public class EmailNotConfirmedException : Exception
{
    public EmailNotConfirmedException(string message) : base(message)
    {
    }
}
