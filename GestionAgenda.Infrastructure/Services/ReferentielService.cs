using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.DTOs.Referentiel;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;

namespace GestionAgenda.Infrastructure.Services;

public sealed class ReferentielService(
    IReferentielRepository referentiel,
    IAccesAgendaRepository acces) : IReferentielService
{
    private const int TailleRecherche = 20;
    private const int LongueurRechercheMax = 100;

    public async Task<IReadOnlyList<SocieteOptionResponse>> ListerSocietesAsync(
        Guid utilisateurId,
        string? recherche,
        CancellationToken cancellationToken = default)
    {
        var terme = recherche?.Trim();
        if (terme is { Length: > LongueurRechercheMax })
        {
            terme = terme[..LongueurRechercheMax];
        }

        var societes = await referentiel.ListerSocietesAsync(utilisateurId, terme, TailleRecherche, cancellationToken);
        return societes.Select(s => new SocieteOptionResponse(s.Id, s.Nom)).ToList();
    }

    public async Task<SocieteDetailResponse> ObtenirSocieteAsync(
        Guid utilisateurId,
        Guid societeId,
        CancellationToken cancellationToken = default)
    {
        var societe = await referentiel.GetSocieteAsync(societeId, cancellationToken);
        if (societe is null || !await acces.EstMembreAsync(utilisateurId, societeId, cancellationToken))
        {
            throw new NotFoundException("Société introuvable.");
        }

        var membres = await referentiel.ListerMembresAsync(societeId, cancellationToken);
        var salles = await referentiel.ListerSallesActivesAsync(societeId, cancellationToken);
        return new SocieteDetailResponse(
            societe.Id,
            societe.Nom,
            Personnes(membres.Where(m => m.Role == RoleSociete.Dirigeant)),
            Personnes(membres),
            salles.Select(s => new SalleOptionResponse(s.Id, s.Nom, s.Capacite)).ToList());
    }

    private static List<PersonneSocieteResponse> Personnes(IEnumerable<UtilisateurSociete> membres) =>
        membres
            .Where(m => m.Utilisateur is not null)
            .DistinctBy(m => m.UtilisateurId)
            .Select(m => new PersonneSocieteResponse(
                m.UtilisateurId,
                $"{m.Utilisateur!.Prenom} {m.Utilisateur.Nom}".Trim(),
                m.Utilisateur.Email))
            .ToList();
}
