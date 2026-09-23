using AutoMapper;
using FluentValidation;
using GestionAgenda.Application.Common;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.DTOs.TableauAssistante;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Interfaces;

namespace GestionAgenda.Infrastructure.Services;

public sealed class TableauAssistanteService(
    ITableauAssistanteRepository tableau,
    IValidator<TableauAssistanteQuery> validator,
    IMapper mapper) : ITableauAssistanteService
{
    public async Task<TableauAssistanteResponse> ObtenirAsync(
        Guid assistanteId,
        TableauAssistanteQuery query,
        CancellationToken cancellationToken = default)
    {
        await validator.ValiderAsync(query, cancellationToken);
        var lecture = await tableau.ObtenirAsync(
            assistanteId, new Intervalle(query.DebutJour, query.FinJour), cancellationToken);
        return VersResponse(lecture);
    }

    private TableauAssistanteResponse VersResponse(LectureTableauAssistante lecture) =>
        new(
            VersCompteurs(lecture.Compteurs),
            mapper.Map<List<DemandeRencontreResumeResponse>>(lecture.ATraiterMaintenant),
            lecture.RencontresAujourdhui.Select(VersRencontre).ToList(),
            lecture.ProchainesRencontres.Select(VersRencontre).ToList());

    private static CompteursTableauResponse VersCompteurs(CompteursTableau compteurs) =>
        new(
            compteurs.ATraiter,
            compteurs.Urgentes,
            compteurs.Critiques,
            compteurs.Prioritaires,
            compteurs.Acceptees,
            compteurs.Reportees,
            compteurs.PlanifieesAujourdhui);

    private static RencontreTableauResponse VersRencontre(RencontreTableau rencontre) =>
        new(
            rencontre.DemandeId,
            rencontre.Motif,
            rencontre.Urgence,
            rencontre.Priorite,
            rencontre.Debut,
            rencontre.Fin,
            rencontre.DirigeantNom,
            rencontre.SocieteNom);
}
