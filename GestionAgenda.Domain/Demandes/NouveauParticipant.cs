namespace GestionAgenda.Domain.Demandes;

public sealed record NouveauParticipant(Guid? UtilisateurId, string? NomComplet, string? Email);
