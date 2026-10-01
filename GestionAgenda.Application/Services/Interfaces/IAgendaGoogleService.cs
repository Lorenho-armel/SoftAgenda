using GestionAgenda.Application.DTOs.Synchronisation;

namespace GestionAgenda.Application.Services.Interfaces;

public interface IAgendaGoogleService
{
    EtatAgendaGoogleResponse Etat();

    Task<IReadOnlyList<AccesAgendaGoogleResponse>> VerifierAccesAsync(Guid utilisateurId, CancellationToken cancellationToken = default);

    Task ResynchroniserAsync(Guid utilisateurId, CancellationToken cancellationToken = default);
}
