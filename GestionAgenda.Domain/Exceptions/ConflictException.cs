using GestionAgenda.Domain.Demandes;

namespace GestionAgenda.Domain.Exceptions;

public sealed class ConflictException : DomainException
{
    public ConflictException(string message, IReadOnlyList<ConflitPlanification>? conflits = null)
        : base(message)
    {
        Conflits = conflits ?? [];
    }

    public IReadOnlyList<ConflitPlanification> Conflits { get; }
}
