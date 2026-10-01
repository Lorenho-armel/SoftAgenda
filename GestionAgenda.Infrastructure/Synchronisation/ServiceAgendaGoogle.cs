using GestionAgenda.Application.DTOs.Synchronisation;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using GestionAgenda.Infrastructure.Options;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class ServiceAgendaGoogle(
    ApplicationDbContext contexte,
    IClientCalendrier calendrier,
    IIndisponibiliteRepository indisponibilites,
    IOptions<GoogleCalendarOptions> options,
    ILogger<ServiceAgendaGoogle> journal) : IAgendaGoogleService
{
    private const string LienGoogleAgenda = "https://calendar.google.com/calendar/r";
    private readonly GoogleCalendarOptions configuration = options.Value;

    public EtatAgendaGoogleResponse Etat()
    {
        if (!configuration.EstConfigure)
        {
            return new EtatAgendaGoogleResponse(false, null, LienGoogleAgenda);
        }

        try
        {
            return new EtatAgendaGoogleResponse(true, calendrier.CompteService, LienGoogleAgenda);
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException or InvalidOperationException)
        {
            journal.LogWarning(exception, "[Sync Agenda] Clé du compte de service illisible");
            return new EtatAgendaGoogleResponse(true, null, LienGoogleAgenda);
        }
    }

    public async Task<IReadOnlyList<AccesAgendaGoogleResponse>> VerifierAccesAsync(
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        ExigerConfiguration();
        var geres = await ExigerGestionnaireAsync(utilisateurId, cancellationToken);
        var identifiants = geres.Select(g => g.DirigeantId).Distinct().ToList();
        var emails = await contexte.Utilisateurs
            .Where(u => identifiants.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Email, cancellationToken);
        var resultats = new List<AccesAgendaGoogleResponse>();
        foreach (var dirigeant in geres.DistinctBy(g => g.DirigeantId))
        {
            var agenda = configuration.AgendaDe(emails.GetValueOrDefault(dirigeant.DirigeantId, string.Empty));
            var acces = await calendrier.VerifierAccesAsync(agenda, cancellationToken);
            resultats.Add(new AccesAgendaGoogleResponse(dirigeant.DirigeantId, dirigeant.DirigeantNom, agenda, acces.Accessible, acces.Message));
        }

        return resultats;
    }

    public async Task ResynchroniserAsync(Guid utilisateurId, CancellationToken cancellationToken = default)
    {
        ExigerConfiguration();
        await ExigerGestionnaireAsync(utilisateurId, cancellationToken);
        BackgroundJob.Enqueue<SynchronisationCalendrier>(s => s.ResynchroniserToutAsync());
    }

    private async Task<IReadOnlyList<DirigeantGere>> ExigerGestionnaireAsync(Guid utilisateurId, CancellationToken cancellationToken)
    {
        var geres = await indisponibilites.ListerDirigeantsGeresAsync(utilisateurId, cancellationToken);
        return geres.Count > 0 ? geres : throw new ForbiddenException("Vous ne gérez l'agenda d'aucun dirigeant.");
    }

    private void ExigerConfiguration()
    {
        if (!configuration.EstConfigure)
        {
            throw new DomainException("La synchronisation Google Agenda n'est pas configurée sur le serveur.");
        }
    }
}
