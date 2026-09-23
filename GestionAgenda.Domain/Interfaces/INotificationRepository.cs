using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Interfaces;

public interface INotificationRepository
{
    Task AddAsync(Notification notification, CancellationToken cancellationToken = default);

    Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Page<Notification>> ListerAsync(
        Guid destinataireId,
        int page,
        int size,
        CancellationToken cancellationToken = default);

    Task AddAbonnementAsync(AbonnementPush abonnement, CancellationToken cancellationToken = default);

    Task<AbonnementPush?> AbonnementParEndpointAsync(string endpoint, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AbonnementPush>> AbonnementsDeAsync(
        Guid utilisateurId,
        CancellationToken cancellationToken = default);

    Task RetirerAbonnementAsync(AbonnementPush abonnement, CancellationToken cancellationToken = default);
}
