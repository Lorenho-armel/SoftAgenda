namespace GestionAgenda.Domain.Exceptions;

public sealed class ServiceExterneException : DomainException
{
    public ServiceExterneException(string message, Exception? cause = null)
        : base(message, cause)
    {
    }
}
