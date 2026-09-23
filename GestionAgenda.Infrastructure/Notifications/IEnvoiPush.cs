namespace GestionAgenda.Infrastructure.Notifications;

public interface IEnvoiPush
{
    Task EnvoyerAsync(Guid utilisateurId, string titre, string message, CancellationToken cancellationToken = default);
}
