namespace GestionAgenda.Domain.Demandes;

public sealed record OccupationSalle(
    Guid OccurrenceId,
    string Titre,
    DateTimeOffset Debut,
    DateTimeOffset Fin);
