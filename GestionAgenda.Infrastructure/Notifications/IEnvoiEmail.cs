namespace GestionAgenda.Infrastructure.Notifications;

public interface IEnvoiEmail
{
    Task EnvoyerAsync(string email, string titre, string message, CancellationToken cancellationToken = default);
}
