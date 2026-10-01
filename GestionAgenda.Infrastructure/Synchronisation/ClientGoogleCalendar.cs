using System.Net;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class ClientGoogleCalendar(IOptions<GoogleCalendarOptions> options) : IClientCalendrier, IDisposable
{
    private static readonly string[] RolesEcriture = ["owner", "writer", "writerWithoutPrivateAccess"];
    private readonly GoogleCalendarOptions configuration = options.Value;
    private CalendarService? service;
    private string compteService = string.Empty;

    public string CompteService
    {
        get
        {
            Service();
            return compteService;
        }
    }

    public Task EnregistrerAsync(string agendaId, EvenementAgenda evenement, CancellationToken cancellationToken = default) =>
        ExecuterAsync(agendaId, async () =>
        {
            var donnees = Convertir(evenement);
            try
            {
                return await Service().Events.Update(donnees, agendaId, evenement.Id).ExecuteAsync(cancellationToken);
            }
            catch (GoogleApiException exception) when (exception.HttpStatusCode == HttpStatusCode.NotFound)
            {
                return await Service().Events.Insert(donnees, agendaId).ExecuteAsync(cancellationToken);
            }
        });

    public Task SupprimerAsync(string agendaId, string evenementId, CancellationToken cancellationToken = default) =>
        ExecuterAsync(agendaId, async () =>
        {
            try
            {
                return await Service().Events.Delete(agendaId, evenementId).ExecuteAsync(cancellationToken);
            }
            catch (GoogleApiException exception)
                when (exception.HttpStatusCode is HttpStatusCode.NotFound or HttpStatusCode.Gone)
            {
                return string.Empty;
            }
        });

    public async Task<AccesAgenda> VerifierAccesAsync(string agendaId, CancellationToken cancellationToken = default)
    {
        try
        {
            var entree = await ExecuterAsync(agendaId, async () =>
            {
                try
                {
                    return await Service().CalendarList.Get(agendaId).ExecuteAsync(cancellationToken);
                }
                catch (GoogleApiException exception) when (exception.HttpStatusCode == HttpStatusCode.NotFound)
                {
                    return await Service().CalendarList.Insert(new CalendarListEntry { Id = agendaId }).ExecuteAsync(cancellationToken);
                }
            });
            return RolesEcriture.Contains(entree.AccessRole)
                ? new AccesAgenda(true, "Agenda accessible en écriture.")
                : new AccesAgenda(false, $"Droit insuffisant ({entree.AccessRole}) : partagez l'agenda avec {compteService} en choisissant « Apporter des modifications aux événements ».");
        }
        catch (ServiceExterneException exception)
        {
            return new AccesAgenda(false, exception.Message);
        }
    }

    public void Dispose() => service?.Dispose();

    private static Event Convertir(EvenementAgenda evenement) =>
        new()
        {
            Id = evenement.Id,
            Summary = evenement.Titre,
            Description = evenement.Description,
            Location = evenement.Lieu,
            Start = new EventDateTime { DateTimeDateTimeOffset = evenement.Debut },
            End = new EventDateTime { DateTimeDateTimeOffset = evenement.Fin },
            Status = "confirmed",
            Transparency = "opaque",
            Visibility = evenement.Prive ? "private" : "default",
            ColorId = evenement.Couleur switch
            {
                CouleurEvenement.Reunion => "10",
                CouleurEvenement.Indisponibilite => "8",
                _ => "9",
            },
            Reminders = new Event.RemindersData { UseDefault = true },
            ExtendedProperties = new Event.ExtendedPropertiesData
            {
                Private__ = new Dictionary<string, string>
                {
                    ["source"] = "GestionAgenda",
                    ["sourceId"] = evenement.SourceId.ToString(),
                },
            },
        };

    private Task<T> ExecuterAsync<T>(string agendaId, Func<Task<T>> appel) =>
        AppelsGoogle.ExecuterAsync(appel, exception => exception.HttpStatusCode switch
        {
            HttpStatusCode.Forbidden =>
                $"Accès refusé à l'agenda « {agendaId} » : partagez-le avec {compteService} (« Apporter des modifications aux événements ») "
                + $"et vérifiez que l'API Google Calendar est activée ({exception.Error?.Message}).",
            HttpStatusCode.NotFound => $"Agenda « {agendaId} » introuvable ou non partagé avec {compteService}.",
            HttpStatusCode.BadRequest => $"Requête refusée par Google Agenda ({exception.Error?.Message}).",
            _ => null,
        });

    private CalendarService Service()
    {
        if (service is not null)
        {
            return service;
        }

        var cle = CredentialFactory.FromFile<ServiceAccountCredential>(configuration.FichierCleCompteService);
        compteService = cle.Id;
        var fabrique = new FabriqueHttpGoogle(configuration.CertificatRacineSupplementaire);
        var identifiants = cle
            .ToGoogleCredential()
            .CreateScoped(CalendarService.Scope.Calendar)
            .CreateWithHttpClientFactory(fabrique);
        service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = identifiants,
            HttpClientFactory = fabrique,
            ApplicationName = "GestionAgenda",
        });
        return service;
    }
}
