namespace GestionAgenda.Domain.Demandes;

public sealed record OccurrenceARappeler(Guid DemandeId, DateTimeOffset Debut, DateTimeOffset Reference);
