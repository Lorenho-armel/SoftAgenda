namespace GestionAgenda.Application.Services.Interfaces;

public interface INotificationsDemande
{
    Task DemandeCreeeAsync(Guid demandeId, CancellationToken cancellationToken = default);

    Task StatutModifieAsync(Guid demandeId, CancellationToken cancellationToken = default);

    Task RendezVousModifieAsync(Guid demandeId, CancellationToken cancellationToken = default);
}
