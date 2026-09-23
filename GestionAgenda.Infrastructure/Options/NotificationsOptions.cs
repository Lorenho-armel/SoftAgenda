namespace GestionAgenda.Infrastructure.Options;

public sealed class NotificationsOptions
{
    public const string SectionName = "Notifications";

    public EmailNotificationsOptions Email { get; set; } = new();

    public PushNotificationsOptions Push { get; set; } = new();
}

public sealed class EmailNotificationsOptions
{
    public string Host { get; set; } = string.Empty;

    public int Port { get; set; } = 587;

    public string Expediteur { get; set; } = "agenda@softwell.local";

    public string Utilisateur { get; set; } = string.Empty;

    public string MotDePasse { get; set; } = string.Empty;
}

public sealed class PushNotificationsOptions
{
    public string Sujet { get; set; } = "mailto:agenda@softwell.local";

    public string ClePublique { get; set; } = string.Empty;

    public string ClePrivee { get; set; } = string.Empty;
}
