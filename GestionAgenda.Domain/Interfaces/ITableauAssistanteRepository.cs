namespace GestionAgenda.Domain.Interfaces;

public interface ITableauAssistanteRepository
{
    Task<Demandes.LectureTableauAssistante> ObtenirAsync(
        Guid assistanteId,
        Demandes.Intervalle jour,
        CancellationToken cancellationToken = default);
}
