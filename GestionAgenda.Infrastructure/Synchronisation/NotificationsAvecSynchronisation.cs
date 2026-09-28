using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Infrastructure.Services;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class NotificationsAvecSynchronisation(
    NotificationsDemande notifications,
    ISynchronisationAgenda synchronisation) : INotificationsDemande
{
    public async Task DemandeCreeeAsync(Guid demandeId, CancellationToken cancellationToken = default)
    {
        await notifications.DemandeCreeeAsync(demandeId, cancellationToken);
        synchronisation.DemandeModifiee(demandeId);
    }

    public async Task StatutModifieAsync(Guid demandeId, CancellationToken cancellationToken = default)
    {
        await notifications.StatutModifieAsync(demandeId, cancellationToken);
        synchronisation.DemandeModifiee(demandeId);
    }

    public async Task RendezVousModifieAsync(Guid demandeId, CancellationToken cancellationToken = default)
    {
        await notifications.RendezVousModifieAsync(demandeId, cancellationToken);
        synchronisation.DemandeModifiee(demandeId);
    }

    public Task RappelerAsync(Guid demandeId, HorizonRappel horizon, CancellationToken cancellationToken = default) =>
        notifications.RappelerAsync(demandeId, horizon, cancellationToken);
}
