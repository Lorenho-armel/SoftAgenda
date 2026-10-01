using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using GestionAgenda.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class DisponibilitesGoogle(
    ApplicationDbContext contexte,
    IClientCalendrier calendrier,
    IMemoryCache cache,
    IOptions<GoogleCalendarOptions> options,
    ILogger<DisponibilitesGoogle> journal) : IDisponibilitesExternes
{
    private static readonly TimeSpan DureeCache = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan DelaiMaximal = TimeSpan.FromSeconds(8);
    private readonly GoogleCalendarOptions configuration = options.Value;

    public async Task<DisponibilitesExternes> OccupationsDirigeantAsync(
        Guid dirigeantId,
        Intervalle creneau,
        CancellationToken cancellationToken = default)
    {
        if (!configuration.EstConfigure || !configuration.LireDisponibilites)
        {
            return DisponibilitesExternes.SansObjet;
        }

        var email = await contexte.Utilisateurs
            .Where(u => u.Id == dirigeantId)
            .Select(u => u.Email)
            .FirstOrDefaultAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(email))
        {
            return DisponibilitesExternes.SansObjet;
        }

        var agenda = configuration.AgendaDe(email);
        var cle = $"agenda-google:{agenda}:{creneau.Debut.UtcTicks}:{creneau.Fin.UtcTicks}";
        if (cache.TryGetValue(cle, out IReadOnlyList<CreneauOccupeExterne>? enCache) && enCache is not null)
        {
            return new DisponibilitesExternes(true, null, enCache);
        }

        using var delai = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        delai.CancelAfter(DelaiMaximal);
        try
        {
            var evenements = await calendrier.ListerAsync(agenda, creneau.Debut, creneau.Fin, delai.Token);
            var occupations = EvenementsAgenda.Occupations(evenements, creneau.Debut, creneau.Fin);
            cache.Set(cle, occupations, DureeCache);
            journal.LogInformation(
                "[Agenda Google] {Nombre} occupation(s) externe(s) dans l'agenda {Agenda} entre {Debut:dd/MM/yyyy HH:mm} et {Fin:HH:mm}",
                occupations.Count,
                agenda,
                creneau.Debut,
                creneau.Fin);
            return new DisponibilitesExternes(true, null, occupations);
        }
        catch (ServiceExterneException exception)
        {
            journal.LogWarning(exception, "[Agenda Google] Lecture de l'agenda {Agenda} impossible", agenda);
            return DisponibilitesExternes.NonVerifiees(exception.Message);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            journal.LogWarning("[Agenda Google] Lecture de l'agenda {Agenda} trop longue : abandonnée", agenda);
            return DisponibilitesExternes.NonVerifiees("Google Agenda ne répond pas assez vite.");
        }
    }
}
