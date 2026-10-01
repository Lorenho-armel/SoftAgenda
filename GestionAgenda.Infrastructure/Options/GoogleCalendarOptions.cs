namespace GestionAgenda.Infrastructure.Options;

public sealed class GoogleCalendarOptions
{
    public const string SectionName = "GoogleCalendar";

    public bool Actif { get; set; }

    public string FichierCleCompteService { get; set; } = string.Empty;

    public string CertificatRacineSupplementaire { get; set; } = string.Empty;

    public string UrlApplication { get; set; } = string.Empty;

    public bool LireDisponibilites { get; set; } = true;

    /// <summary>E-mail du dirigeant → identifiant de l'agenda Google. Par défaut, l'agenda principal (son e-mail).</summary>
    public Dictionary<string, string> Agendas { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    public bool EstConfigure => Actif && !string.IsNullOrWhiteSpace(FichierCleCompteService);

    public string AgendaDe(string emailDirigeant) =>
        Agendas.TryGetValue(emailDirigeant, out var agenda) && !string.IsNullOrWhiteSpace(agenda) ? agenda : emailDirigeant;
}
