using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;

namespace GestionAgenda.Infrastructure.Services;

internal sealed class EvaluationAccesDemande(IAccesAgendaRepository acces)
{
    internal readonly record struct Resultat(bool PeutVoir, bool EstGestionnaire, bool EstDemandeur);

    public async Task ExigerGestionnaireAsync(
        DemandeRencontre demande,
        Guid utilisateurId,
        CancellationToken cancellationToken)
    {
        var droit = await EvaluerAsync(demande, utilisateurId, cancellationToken);
        if (!droit.PeutVoir)
        {
            throw new NotFoundException("Demande introuvable.");
        }

        if (!droit.EstGestionnaire)
        {
            throw new ForbiddenException("Vous ne pouvez pas traiter cette demande.");
        }
    }

    public async Task AutoriserTransitionAsync(
        DemandeRencontre demande,
        ChangerStatutDemandeRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken)
    {
        var droit = await EvaluerAsync(demande, utilisateurId, cancellationToken);
        if (!droit.PeutVoir)
        {
            throw new NotFoundException("Demande introuvable.");
        }

        var annulationDemandeur = request.Statut == StatutDemande.Annulee
            && droit.EstDemandeur
            && AccesDemande.DemandeurPeutAnnuler(demande.Statut);
        if (!droit.EstGestionnaire && !annulationDemandeur)
        {
            throw new ForbiddenException("Vous ne pouvez pas traiter cette demande.");
        }
    }

    public async Task<Resultat> EvaluerAsync(
        DemandeRencontre demande,
        Guid utilisateurId,
        CancellationToken cancellationToken)
    {
        var estDemandeur = demande.DemandeurId == utilisateurId;
        var estDirigeant = demande.DirigeantId == utilisateurId
            && await acces.EstDirigeantAsync(utilisateurId, demande.SocieteId, cancellationToken);
        var estAssistante = await acces.EstAssistanteActiveAsync(
            utilisateurId, demande.DirigeantId, demande.SocieteId, cancellationToken);
        var aAssistante = await acces.AAssistanteActiveAsync(
            demande.DirigeantId, demande.SocieteId, cancellationToken);
        return new Resultat(
            AccesDemande.PeutVoir(estDemandeur, estDirigeant, estAssistante),
            AccesDemande.EstGestionnaire(estDirigeant, estAssistante, aAssistante),
            estDemandeur);
    }
}
