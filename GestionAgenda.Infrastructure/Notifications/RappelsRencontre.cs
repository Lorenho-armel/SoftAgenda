using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Interfaces;

namespace GestionAgenda.Infrastructure.Notifications;

public sealed class RappelsRencontre(
    IPlanificationRepository planification,
    INotificationRepository notifications,
    INotificationsDemande demandes)
{
    public async Task ExecuterAsync()
    {
        var maintenant = DateTimeOffset.UtcNow;
        var echeances = await planification.ListerARappelerAsync(maintenant, maintenant.AddHours(24));
        foreach (var echeance in echeances)
        {
            var horizon = SelectionRappels.Pour(maintenant, echeance.Debut);
            if (horizon is null)
            {
                continue;
            }

            var titre = TexteNotification.TitreRappel(horizon.Value);
            if (await notifications.RappelEmisAsync(echeance.DemandeId, titre, echeance.Reference))
            {
                continue;
            }

            await demandes.RappelerAsync(echeance.DemandeId, horizon.Value);
        }
    }
}
