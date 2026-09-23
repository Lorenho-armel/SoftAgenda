using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.Auth;
using GestionAgenda.Application.DTOs.DemandesRencontre;

namespace GestionAgenda.Application.Services.Interfaces;

public interface IDemandeRencontreService
{
    Task<DemandeRencontreResponse> CreateAsync(
        CreerDemandeRencontreRequest request,
        Guid auteurId,
        CancellationToken cancellationToken = default);

    Task<PaginatedResult<DemandeRencontreResumeResponse>> GetAllAsync(
        DemandeRencontreQuery query,
        Guid utilisateurId,
        CancellationToken cancellationToken = default);

    Task<FileDemandesResponse> GetFileAsync(
        DemandeRencontreQuery query,
        Guid utilisateurId,
        CancellationToken cancellationToken = default);

    Task<DemandeRencontreResponse> GetByIdAsync(
        Guid id,
        Guid utilisateurId,
        CancellationToken cancellationToken = default);

    Task<DemandeRencontreResponse> UpdateAsync(
        Guid id,
        MettreAJourDemandeRencontreRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default);

    Task<DemandeRencontreResponse> ChangerStatutAsync(
        Guid id,
        ChangerStatutDemandeRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default);

    Task<DemandeRencontreResponse> ChangerPrioriteAsync(
        Guid id,
        ChangerPrioriteDemandeRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default);

    Task<DemandeRencontreResponse> ChangerUrgenceAsync(
        Guid id,
        ChangerUrgenceDemandeRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default);
}
