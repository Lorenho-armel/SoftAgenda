using GestionAgenda.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace GestionAgenda.Infrastructure.Notifications;

public sealed class DiffuseurNotification(
    INotificationRepository notifications,
    IEnvoiEmail email,
    IEnvoiPush push,
    ILogger<DiffuseurNotification> journal)
{
    public async Task DiffuserAsync(Guid notificationId)
    {
        var notification = await notifications.GetByIdAsync(notificationId);
        if (notification is null)
        {
            journal.LogWarning("Notification {NotificationId} introuvable", notificationId);
            return;
        }

        await email.EnvoyerAsync(notification.Email, notification.Titre, notification.Message);
        if (notification.DestinataireId is Guid utilisateurId)
        {
            await push.EnvoyerAsync(utilisateurId, notification.Titre, notification.Message);
        }
    }
}
