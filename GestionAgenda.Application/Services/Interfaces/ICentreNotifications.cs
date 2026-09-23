using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.Notifications;

namespace GestionAgenda.Application.Services.Interfaces;

public interface ICentreNotifications
{
    Task<PaginatedResult<NotificationResponse>> ListerAsync(
        Guid destinataireId,
        NotificationQuery query,
        CancellationToken cancellationToken = default);

    Task EnregistrerPushAsync(
        Guid utilisateurId,
        AbonnementPushRequest request,
        CancellationToken cancellationToken = default);

    string ClePubliquePush();
}
