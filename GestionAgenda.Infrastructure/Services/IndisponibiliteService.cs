using FluentValidation;
using GestionAgenda.Application.Common;
using GestionAgenda.Application.DTOs.Indisponibilites;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;

namespace GestionAgenda.Infrastructure.Services;

public sealed class IndisponibiliteService(
    IIndisponibiliteRepository indisponibilites,
    IUnitOfWork unitOfWork,
    IValidator<CreerIndisponibiliteRequest> validator,
    ISynchronisationAgenda synchronisation) : IIndisponibiliteService
{
    private const int JoursConsultationMax = 100;

    public async Task<IReadOnlyList<DirigeantGereResponse>> ListerDirigeantsGeresAsync(
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        var dirigeants = await indisponibilites.ListerDirigeantsGeresAsync(utilisateurId, cancellationToken);
        return dirigeants
            .Select(d => new DirigeantGereResponse(d.DirigeantId, d.DirigeantNom, d.SocieteId, d.SocieteNom))
            .ToList();
    }

    public async Task<IReadOnlyList<IndisponibiliteResponse>> ListerAsync(
        Guid utilisateurId,
        DateTimeOffset debut,
        DateTimeOffset fin,
        CancellationToken cancellationToken = default)
    {
        if (fin <= debut || (fin - debut).TotalDays > JoursConsultationMax)
        {
            throw new DomainException($"La période consultée doit être positive et ne pas dépasser {JoursConsultationMax} jours.");
        }

        var geres = await indisponibilites.ListerDirigeantsGeresAsync(utilisateurId, cancellationToken);
        var noms = geres.GroupBy(d => d.DirigeantId).ToDictionary(g => g.Key, g => g.First().DirigeantNom);
        var trouvees = await indisponibilites.ListerAsync(noms.Keys, new Intervalle(debut, fin), cancellationToken);
        return trouvees.Select(i => VersResponse(i, noms[i.DirigeantId])).ToList();
    }

    public async Task<IndisponibiliteResponse> CreerAsync(
        Guid utilisateurId,
        CreerIndisponibiliteRequest request,
        CancellationToken cancellationToken = default)
    {
        await validator.ValiderAsync(request, cancellationToken);
        var dirigeant = await ExigerGestionnaireAsync(utilisateurId, request.DirigeantId, request.SocieteId, cancellationToken);
        var indisponibilite = Indisponibilite.Creer(
            request.DirigeantId,
            request.SocieteId,
            request.Type,
            request.Motif,
            request.Debut,
            request.Fin,
            utilisateurId);
        await indisponibilites.AddAsync(indisponibilite, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        synchronisation.IndisponibiliteModifiee(indisponibilite.Id);
        return VersResponse(indisponibilite, dirigeant.DirigeantNom);
    }

    public async Task SupprimerAsync(Guid utilisateurId, Guid id, CancellationToken cancellationToken = default)
    {
        var indisponibilite = await indisponibilites.GetByIdAsync(id, suivi: true, cancellationToken)
            ?? throw new NotFoundException("Indisponibilité introuvable.");
        await ExigerGestionnaireAsync(utilisateurId, indisponibilite.DirigeantId, indisponibilite.SocieteId, cancellationToken);
        indisponibilites.Remove(indisponibilite);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        synchronisation.IndisponibiliteSupprimee(id, indisponibilite.DirigeantId);
    }

    private async Task<DirigeantGere> ExigerGestionnaireAsync(
        Guid utilisateurId,
        Guid dirigeantId,
        Guid societeId,
        CancellationToken cancellationToken)
    {
        var geres = await indisponibilites.ListerDirigeantsGeresAsync(utilisateurId, cancellationToken);
        return geres.FirstOrDefault(d => d.DirigeantId == dirigeantId && d.SocieteId == societeId)
            ?? throw new ForbiddenException("Vous ne gérez pas l'agenda de ce dirigeant.");
    }

    private static IndisponibiliteResponse VersResponse(Indisponibilite indisponibilite, string dirigeantNom) =>
        new(
            indisponibilite.Id,
            indisponibilite.DirigeantId,
            dirigeantNom,
            indisponibilite.SocieteId,
            indisponibilite.Type,
            indisponibilite.Motif,
            indisponibilite.Debut,
            indisponibilite.Fin);
}
