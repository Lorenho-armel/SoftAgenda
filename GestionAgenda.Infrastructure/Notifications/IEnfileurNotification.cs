namespace GestionAgenda.Infrastructure.Notifications;

public interface IEnfileurNotification
{
    void Enfiler(Guid notificationId);
}
