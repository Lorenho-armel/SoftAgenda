using GestionAgenda.Application.DTOs.Synchronisation;

namespace GestionAgenda.Application.Services.Interfaces;

public interface IFeuilleAgendaService
{
    EtatFeuilleResponse Etat();

    Task<RapportImportResponse> ImporterAsync(Guid utilisateurId, CancellationToken cancellationToken = default);

    Task ResynchroniserAsync(Guid utilisateurId, CancellationToken cancellationToken = default);

    Task<LignesFeuilleResponse> LignesAsync(Guid id, Guid utilisateurId, CancellationToken cancellationToken = default);
}
