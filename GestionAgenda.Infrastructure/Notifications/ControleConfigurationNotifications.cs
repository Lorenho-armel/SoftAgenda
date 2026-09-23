using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GestionAgenda.Infrastructure.Notifications;

public static class ControleConfigurationNotifications
{
    public static void Journaliser(IConfiguration configuration, ILogger journal)
    {
        if (string.IsNullOrWhiteSpace(configuration["Notifications:Email:Host"]))
        {
            journal.LogWarning("SMTP non configuré : les e-mails de notification sont ignorés.");
        }

        if (string.IsNullOrWhiteSpace(configuration["Notifications:Push:ClePublique"])
            || string.IsNullOrWhiteSpace(configuration["Notifications:Push:ClePrivee"]))
        {
            journal.LogWarning("Clés VAPID absentes : le push navigateur est ignoré.");
        }
    }
}
