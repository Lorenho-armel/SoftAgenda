using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public sealed record RencontreTableau(
    Guid DemandeId,
    string Motif,
    Urgence Urgence,
    Priorite Priorite,
    DateTimeOffset Debut,
    DateTimeOffset Fin,
    string DirigeantNom,
    string SocieteNom);
