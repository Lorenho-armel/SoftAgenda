using AutoMapper;
using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Demandes;

namespace GestionAgenda.Infrastructure.Services;

internal static class LectureFileDemandes
{
    public static FileDemandesResponse VersResponse(
        ResultatFile resultat,
        DemandeRencontreQuery query,
        IMapper mapper)
    {
        var totalPages = query.Size == 0
            ? 0
            : (int)Math.Ceiling(resultat.Page.TotalCount / (double)query.Size);
        var compteurs = resultat.Compteurs;
        return new FileDemandesResponse(
            new PaginatedResult<DemandeRencontreResumeResponse>(
                mapper.Map<List<DemandeRencontreResumeResponse>>(resultat.Page.Items),
                resultat.Page.TotalCount,
                query.Page,
                query.Size,
                totalPages),
            new CompteursFileResponse(
                compteurs.Nouvelles,
                compteurs.Urgentes,
                compteurs.Critiques,
                compteurs.Prioritaires,
                compteurs.EnAttente,
                compteurs.Planifiees),
            resultat.Demandeurs.Select(d => new PersonneOptionResponse(d.Id, d.NomComplet)).ToList(),
            resultat.Societes.Select(s => new SocieteOptionResponse(s.Id, s.Nom)).ToList());
    }
}
