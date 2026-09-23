using System.Text.Json;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WebPush;

namespace GestionAgenda.Infrastructure.Notifications;

public sealed class EnvoiPushNavigateur(
    INotificationRepository notifications,
    IUnitOfWork unitOfWork,
    IOptions<NotificationsOptions> options,
    ILogger<EnvoiPushNavigateur> journal) : IEnvoiPush
{
    public async Task EnvoyerAsync(
        Guid utilisateurId,
        string titre,
        string message,
        CancellationToken cancellationToken = default)
    {
        var push = options.Value.Push;
        if (string.IsNullOrWhiteSpace(push.ClePublique) || string.IsNullOrWhiteSpace(push.ClePrivee))
        {
            journal.LogInformation("Push navigateur ignoré : clés VAPID absentes");
            return;
        }

        var charge = JsonSerializer.Serialize(new { titre, message });
        var vapid = new VapidDetails(push.Sujet, push.ClePublique, push.ClePrivee);
        foreach (var abonnement in await notifications.AbonnementsDeAsync(utilisateurId, cancellationToken))
        {
            await EnvoyerUnAsync(abonnement.Endpoint, abonnement.CleP256dh, abonnement.Auth, charge, vapid, abonnement, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task EnvoyerUnAsync(
        string endpoint,
        string cle,
        string auth,
        string charge,
        VapidDetails vapid,
        Domain.Entities.AbonnementPush abonnement,
        CancellationToken cancellationToken)
    {
        try
        {
            var client = new WebPushClient();
            var subscription = new PushSubscription(endpoint, cle, auth);
            await client.SendNotificationAsync(subscription, charge, vapid, cancellationToken);
        }
        catch (WebPushException exception) when (exception.StatusCode == System.Net.HttpStatusCode.Gone)
        {
            journal.LogInformation(exception, "Abonnement push expiré pour {Endpoint}", endpoint);
            await notifications.RetirerAbonnementAsync(abonnement, cancellationToken);
        }
    }
}
