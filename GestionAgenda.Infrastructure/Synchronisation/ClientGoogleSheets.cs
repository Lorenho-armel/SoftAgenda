using System.Net;
using System.Security.Authentication;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class ClientGoogleSheets(IOptions<GoogleSheetsOptions> options) : IClientFeuille, IDisposable
{
    private readonly GoogleSheetsOptions configuration = options.Value;
    private SheetsService? service;
    private string compteService = string.Empty;

    public Task<IList<IList<object?>>> LireAsync(string plage, CancellationToken cancellationToken = default) =>
        ExecuterAsync<IList<IList<object?>>>(async () =>
        {
            var requete = Service().Spreadsheets.Values.Get(configuration.SpreadsheetId, plage);
            requete.ValueRenderOption = SpreadsheetsResource.ValuesResource.GetRequest.ValueRenderOptionEnum.UNFORMATTEDVALUE;
            requete.DateTimeRenderOption = SpreadsheetsResource.ValuesResource.GetRequest.DateTimeRenderOptionEnum.SERIALNUMBER;
            var reponse = await requete.ExecuteAsync(cancellationToken);
            return reponse.Values?.Select(ligne => (IList<object?>)ligne.ToList<object?>()).ToList()
                ?? [];
        });

    public async Task EcrireAsync(IReadOnlyList<BlocCellules> blocs, CancellationToken cancellationToken = default)
    {
        if (blocs.Count == 0)
        {
            return;
        }

        var corps = new BatchUpdateValuesRequest
        {
            ValueInputOption = "RAW",
            Data = blocs.Select(bloc => new ValueRange
            {
                Range = bloc.Plage,
                Values = bloc.Valeurs.Select(ligne => (IList<object>)ligne.Select(v => v ?? string.Empty).ToList()).ToList(),
            }).ToList(),
        };
        await ExecuterAsync(() => Service().Spreadsheets.Values.BatchUpdate(corps, configuration.SpreadsheetId).ExecuteAsync(cancellationToken));
    }

    public void Dispose() => service?.Dispose();

    private async Task<T> ExecuterAsync<T>(Func<Task<T>> appel)
    {
        try
        {
            return await appel();
        }
        catch (HttpRequestException exception) when (exception.InnerException is AuthenticationException)
        {
            throw new ServiceExterneException(
                "Connexion à Google refusée : le certificat présenté n'est pas reconnu. Un pare-feu avec inspection SSL "
                + "intercepte probablement la connexion (voir docs/google-sheets.md, section Pare-feu).",
                exception);
        }
        catch (HttpRequestException exception)
        {
            throw new ServiceExterneException("Google est injoignable depuis le serveur : vérifiez la connexion Internet ou le proxy.", exception);
        }
        catch (GoogleApiException exception) when (exception.HttpStatusCode == HttpStatusCode.Forbidden)
        {
            throw new ServiceExterneException(
                $"Accès au Sheet refusé : partagez-le en Éditeur avec {compteService} et vérifiez que l'API Google Sheets est activée.",
                exception);
        }
        catch (GoogleApiException exception) when (exception.HttpStatusCode == HttpStatusCode.NotFound)
        {
            throw new ServiceExterneException("Sheet introuvable : vérifiez GoogleSheets:SpreadsheetId.", exception);
        }
        catch (GoogleApiException exception) when (exception.HttpStatusCode == HttpStatusCode.BadRequest)
        {
            throw new ServiceExterneException(
                $"Requête refusée par Google : vérifiez que l'onglet « {configuration.Onglet} » existe ({exception.Error?.Message}).",
                exception);
        }
    }

    private SheetsService Service()
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
            .CreateScoped(SheetsService.Scope.Spreadsheets)
            .CreateWithHttpClientFactory(fabrique);
        service = new SheetsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = identifiants,
            HttpClientFactory = fabrique,
            ApplicationName = "GestionAgenda",
        });
        return service;
    }
}
