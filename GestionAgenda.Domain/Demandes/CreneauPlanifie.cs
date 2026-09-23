namespace GestionAgenda.Domain.Demandes;

public sealed record CreneauPlanifie(
    Guid DirigeantId,
    Guid SocieteId,
    Guid DemandeId,
    Guid? SalleId,
    DateTimeOffset Debut,
    DateTimeOffset Fin,
    string Titre);
