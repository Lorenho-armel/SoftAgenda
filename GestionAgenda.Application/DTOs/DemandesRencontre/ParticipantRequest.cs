namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record ParticipantRequest(Guid? UtilisateurId, string? NomComplet, string? Email);
