namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record ParticipantResponse(Guid Id, Guid? UtilisateurId, string? NomComplet, string? Email);
