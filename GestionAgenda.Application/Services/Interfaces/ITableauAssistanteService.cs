using GestionAgenda.Application.DTOs.TableauAssistante;

namespace GestionAgenda.Application.Services.Interfaces;

public interface ITableauAssistanteService
{
    Task<TableauAssistanteResponse> ObtenirAsync(
        Guid assistanteId,
        TableauAssistanteQuery query,
        CancellationToken cancellationToken = default);
}
