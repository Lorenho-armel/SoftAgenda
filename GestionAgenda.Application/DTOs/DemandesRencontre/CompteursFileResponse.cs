namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public sealed record CompteursFileResponse(
    int Nouvelles,
    int Urgentes,
    int Critiques,
    int Prioritaires,
    int EnAttente,
    int Planifiees);
