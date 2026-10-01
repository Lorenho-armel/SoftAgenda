using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Infrastructure.Options;
using Hangfire;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class EnfileurSynchronisationHangfire(
    IOptions<GoogleSheetsOptions> options,
    IOptions<GoogleCalendarOptions> optionsAgenda,
    ILogger<EnfileurSynchronisationHangfire> journal) : ISynchronisationAgenda
{
    private readonly bool actif = options.Value.EstConfigure;
    private readonly bool agendaActif = optionsAgenda.Value.EstConfigure;

    public void DemandeModifiee(Guid demandeId)
    {
        if (actif)
        {
            var job = BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.SynchroniserDemandeAsync(demandeId));
            journal.LogInformation("[Sync Sheet] Demande {Id} mise en file (job Hangfire {Job})", demandeId, job);
        }

        if (agendaActif)
        {
            var job = BackgroundJob.Enqueue<SynchronisationCalendrier>(s => s.SynchroniserDemandeAsync(demandeId));
            journal.LogInformation("[Sync Agenda] Demande {Id} mise en file (job Hangfire {Job})", demandeId, job);
        }
    }

    public void IndisponibiliteModifiee(Guid indisponibiliteId)
    {
        if (actif)
        {
            var job = BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.SynchroniserIndisponibiliteAsync(indisponibiliteId));
            journal.LogInformation("[Sync Sheet] Indisponibilité {Id} mise en file (job Hangfire {Job})", indisponibiliteId, job);
        }

        if (agendaActif)
        {
            var job = BackgroundJob.Enqueue<SynchronisationCalendrier>(s => s.SynchroniserIndisponibiliteAsync(indisponibiliteId));
            journal.LogInformation("[Sync Agenda] Indisponibilité {Id} mise en file (job Hangfire {Job})", indisponibiliteId, job);
        }
    }

    public void IndisponibiliteSupprimee(Guid indisponibiliteId, Guid dirigeantId)
    {
        if (actif)
        {
            var job = BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.MarquerIndisponibiliteSupprimeeAsync(indisponibiliteId));
            journal.LogInformation("[Sync Sheet] Suppression de l'indisponibilité {Id} mise en file (job Hangfire {Job})", indisponibiliteId, job);
        }

        if (agendaActif)
        {
            var job = BackgroundJob.Enqueue<SynchronisationCalendrier>(s => s.SupprimerIndisponibiliteAsync(indisponibiliteId, dirigeantId));
            journal.LogInformation("[Sync Agenda] Suppression de l'indisponibilité {Id} mise en file (job Hangfire {Job})", indisponibiliteId, job);
        }
    }
}
