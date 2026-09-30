using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Infrastructure.Options;
using Hangfire;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class EnfileurSynchronisationHangfire(
    IOptions<GoogleSheetsOptions> options,
    ILogger<EnfileurSynchronisationHangfire> journal) : ISynchronisationAgenda
{
    private readonly bool actif = options.Value.EstConfigure;

    public void DemandeModifiee(Guid demandeId)
    {
        if (actif)
        {
            var job = BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.SynchroniserDemandeAsync(demandeId));
            journal.LogInformation("[Sync Sheet] Demande {Id} mise en file (job Hangfire {Job})", demandeId, job);
        }
    }

    public void IndisponibiliteModifiee(Guid indisponibiliteId)
    {
        if (actif)
        {
            var job = BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.SynchroniserIndisponibiliteAsync(indisponibiliteId));
            journal.LogInformation("[Sync Sheet] Indisponibilité {Id} mise en file (job Hangfire {Job})", indisponibiliteId, job);
        }
    }

    public void IndisponibiliteSupprimee(Guid indisponibiliteId)
    {
        if (actif)
        {
            var job = BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.MarquerIndisponibiliteSupprimeeAsync(indisponibiliteId));
            journal.LogInformation("[Sync Sheet] Suppression de l'indisponibilité {Id} mise en file (job Hangfire {Job})", indisponibiliteId, job);
        }
    }
}
