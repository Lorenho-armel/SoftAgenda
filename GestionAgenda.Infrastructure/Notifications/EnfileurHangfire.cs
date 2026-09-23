using Hangfire;

namespace GestionAgenda.Infrastructure.Notifications;

public sealed class EnfileurHangfire : IEnfileurNotification
{
    public void Enfiler(Guid notificationId) =>
        BackgroundJob.Enqueue<DiffuseurNotification>(diffuseur => diffuseur.DiffuserAsync(notificationId));
}
