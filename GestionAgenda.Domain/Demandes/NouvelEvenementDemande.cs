using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

internal sealed class NouvelEvenementDemande
{
    public required Guid AuteurId { get; init; }

    public required TypeEvenementDemande TypeEvenement { get; init; }

    public string? Commentaire { get; init; }

    public StatutDemande? StatutAvant { get; init; }

    public StatutDemande? StatutApres { get; init; }

    public Urgence? UrgenceAvant { get; init; }

    public Urgence? UrgenceApres { get; init; }

    public Priorite? PrioriteAvant { get; init; }

    public Priorite? PrioriteApres { get; init; }

    public DateTimeOffset? DateDebutAvant { get; init; }

    public DateTimeOffset? DateDebutApres { get; init; }

    public DateTimeOffset? DateFinAvant { get; init; }

    public DateTimeOffset? DateFinApres { get; init; }

    public Guid? SalleAvantId { get; init; }

    public Guid? SalleApresId { get; init; }

    public Guid? RendezVousId { get; init; }

    public Guid? ReunionId { get; init; }
}
