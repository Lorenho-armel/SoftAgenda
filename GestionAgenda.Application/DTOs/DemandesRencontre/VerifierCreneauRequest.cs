namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public sealed record VerifierCreneauRequest(DateTimeOffset DebutPlanifie, Guid? SalleId);
