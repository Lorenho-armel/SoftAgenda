namespace GestionAgenda.Domain.Demandes;

public sealed record CompteursTableau(
    int ATraiter,
    int Urgentes,
    int Critiques,
    int Prioritaires,
    int Acceptees,
    int Reportees,
    int PlanifieesAujourdhui);
