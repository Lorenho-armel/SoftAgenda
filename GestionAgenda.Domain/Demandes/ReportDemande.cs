namespace GestionAgenda.Domain.Demandes;

public sealed record ReportDemande(
    Guid AuteurId,
    string Commentaire,
    DateTimeOffset Debut,
    DateTimeOffset Fin);
