using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Interfaces;

public interface IPlanificationRepository
{
    Task<Salle?> GetSalleAsync(Guid salleId, CancellationToken cancellationToken = default);

    Task<bool> DirigeantLibreAsync(
        Guid dirigeantId,
        DateTimeOffset debut,
        DateTimeOffset fin,
        CancellationToken cancellationToken = default);

    Task<bool> SalleLibreAsync(
        Guid salleId,
        DateTimeOffset debut,
        DateTimeOffset fin,
        CancellationToken cancellationToken = default);
}
