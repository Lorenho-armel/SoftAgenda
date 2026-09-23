namespace GestionAgenda.Domain.Demandes;

public sealed class BilanPlanification
{
    public BilanPlanification(
        DateTimeOffset debut,
        DateTimeOffset fin,
        IReadOnlyList<ConflitPlanification> conflits)
    {
        Debut = debut;
        Fin = fin;
        Conflits = conflits;
    }

    public DateTimeOffset Debut { get; }

    public DateTimeOffset Fin { get; }

    public IReadOnlyList<ConflitPlanification> Conflits { get; }

    public bool PeutPlanifier => !Conflits.Any(conflit => conflit.Bloquant);
}
