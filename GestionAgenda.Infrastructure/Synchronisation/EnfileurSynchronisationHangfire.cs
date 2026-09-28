using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Infrastructure.Options;
using Hangfire;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class EnfileurSynchronisationHangfire(IOptions<GoogleSheetsOptions> options) : ISynchronisationAgenda
{
    private readonly bool actif = options.Value.EstConfigure;

    public void DemandeModifiee(Guid demandeId)
    {
        if (actif)
        {
            BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.SynchroniserDemandeAsync(demandeId));
        }
    }

    public void IndisponibiliteModifiee(Guid indisponibiliteId)
    {
        if (actif)
        {
            BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.SynchroniserIndisponibiliteAsync(indisponibiliteId));
        }
    }

    public void IndisponibiliteSupprimee(Guid indisponibiliteId)
    {
        if (actif)
        {
            BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.MarquerIndisponibiliteSupprimeeAsync(indisponibiliteId));
        }
    }
}
