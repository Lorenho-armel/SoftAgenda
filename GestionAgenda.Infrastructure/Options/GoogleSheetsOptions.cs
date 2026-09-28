namespace GestionAgenda.Infrastructure.Options;

public sealed class GoogleSheetsOptions
{
    public const string SectionName = "GoogleSheets";

    public bool Actif { get; set; }

    public string SpreadsheetId { get; set; } = string.Empty;

    public string Onglet { get; set; } = "Agenda";

    public string FichierCleCompteService { get; set; } = string.Empty;

    public string FuseauHoraire { get; set; } = string.Empty;

    public bool EstConfigure =>
        Actif && !string.IsNullOrWhiteSpace(SpreadsheetId) && !string.IsNullOrWhiteSpace(FichierCleCompteService);

    public TimeZoneInfo Fuseau() =>
        string.IsNullOrWhiteSpace(FuseauHoraire) ? TimeZoneInfo.Local : TimeZoneInfo.FindSystemTimeZoneById(FuseauHoraire);
}
