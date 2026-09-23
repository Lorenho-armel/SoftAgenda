using GestionAgenda.Infrastructure.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace GestionAgenda.Infrastructure.Notifications;

public sealed class EnvoiEmailSmtp(IOptions<NotificationsOptions> options, ILogger<EnvoiEmailSmtp> journal) : IEnvoiEmail
{
    public async Task EnvoyerAsync(
        string email,
        string titre,
        string message,
        CancellationToken cancellationToken = default)
    {
        var emailOptions = options.Value.Email;
        if (string.IsNullOrWhiteSpace(emailOptions.Host))
        {
            journal.LogInformation("E-mail non envoyé à {Email} : serveur SMTP non configuré", email);
            return;
        }

        var mime = new MimeMessage();
        mime.From.Add(MailboxAddress.Parse(emailOptions.Expediteur));
        mime.To.Add(MailboxAddress.Parse(email));
        mime.Subject = titre;
        mime.Body = new TextPart("plain") { Text = message };
        using var client = new SmtpClient();
        await client.ConnectAsync(emailOptions.Host, emailOptions.Port, SecureSocketOptions.StartTls, cancellationToken);
        if (!string.IsNullOrWhiteSpace(emailOptions.Utilisateur))
        {
            await client.AuthenticateAsync(emailOptions.Utilisateur, emailOptions.MotDePasse, cancellationToken);
        }

        await client.SendAsync(mime, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
