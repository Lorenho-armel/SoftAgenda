using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record ChangerUrgenceDemandeRequest(Urgence Urgence, string? Commentaire);
