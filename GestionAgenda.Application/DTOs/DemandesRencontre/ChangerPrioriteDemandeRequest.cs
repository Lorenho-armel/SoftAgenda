using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record ChangerPrioriteDemandeRequest(Priorite Priorite, string? Commentaire);
