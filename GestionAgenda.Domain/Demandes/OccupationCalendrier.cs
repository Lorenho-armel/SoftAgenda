namespace GestionAgenda.Domain.Demandes;

public sealed record OccupationCalendrier(
    Guid OccurrenceId,
    Guid PersonneId,
    string PersonneNom,
    string Titre,
    DateTimeOffset Debut,
    DateTimeOffset Fin);
