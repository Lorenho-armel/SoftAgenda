namespace GestionAgenda.Domain.Exceptions;

public class DomainException : Exception
{
    public DomainException(string message)
        : base(message)
    {
    }

    public DomainException(string message, Exception? cause)
        : base(message, cause)
    {
    }
}
