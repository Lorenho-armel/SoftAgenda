namespace GestionAgenda.Domain.Demandes;

public sealed record CompteursFile(
    int Nouvelles,
    int Urgentes,
    int Critiques,
    int Prioritaires,
    int EnAttente,
    int Planifiees);
