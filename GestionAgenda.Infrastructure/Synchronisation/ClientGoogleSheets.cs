using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using GestionAgenda.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class ClientGoogleSheets(IOptions<GoogleSheetsOptions> options) : IClientFeuille, IDisposable
{
    private readonly GoogleSheetsOptions configuration = options.Value;
    private SheetsService? service;

    public async Task<IList<IList<object?>>> LireAsync(string plage, CancellationToken cancellationToken = default)
    {
        var requete = Service().Spreadsheets.Values.Get(configuration.SpreadsheetId, plage);
        requete.ValueRenderOption = SpreadsheetsResource.ValuesResource.GetRequest.ValueRenderOptionEnum.UNFORMATTEDVALUE;
        requete.DateTimeRenderOption = SpreadsheetsResource.ValuesResource.GetRequest.DateTimeRenderOptionEnum.SERIALNUMBER;
        var reponse = await requete.ExecuteAsync(cancellationToken);
        return reponse.Values?.Select(ligne => (IList<object?>)ligne.ToList<object?>()).ToList()
            ?? [];
    }

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
        await Service().Spreadsheets.Values.BatchUpdate(corps, configuration.SpreadsheetId).ExecuteAsync(cancellationToken);
    }

    public void Dispose() => service?.Dispose();

    private SheetsService Service()
    {
        if (service is not null)
        {
            return service;
        }

        var identifiants = CredentialFactory
            .FromFile<ServiceAccountCredential>(configuration.FichierCleCompteService)
            .ToGoogleCredential()
            .CreateScoped(SheetsService.Scope.Spreadsheets);
        service = new SheetsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = identifiants,
            ApplicationName = "GestionAgenda",
        });
        return service;
    }
}
