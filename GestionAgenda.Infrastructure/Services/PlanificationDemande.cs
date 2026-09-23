using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;

namespace GestionAgenda.Infrastructure.Services;

public sealed class PlanificationDemande(IPlanificationRepository planification)
{
    public async Task AppliquerAsync(
        DemandeRencontre demande,
        ChangerStatutDemandeRequest request,
        Guid auteurId,
        CancellationToken cancellationToken)
    {
        if (request.DebutPlanifie is null)
        {
            throw new DomainException("Le créneau confirmé est obligatoire pour planifier.");
        }

        var debut = request.DebutPlanifie.Value;
        var fin = demande.FinDuCreneau(debut);
        var salleId = request.SalleId is null || request.SalleId == Guid.Empty ? null : request.SalleId;
        if (!await planification.DirigeantLibreAsync(demande.DirigeantId, debut, fin, cancellationToken))
        {
            throw new ConflictException("Le dirigeant n'est pas disponible sur ce créneau.");
        }

        if (salleId.HasValue)
        {
            await VerifierSalleAsync(demande, salleId.Value, debut, fin, cancellationToken);
        }

        var creneau = new CreneauPlanifie(
            demande.DirigeantId, demande.SocieteId, demande.Id, salleId, debut, fin, demande.Motif);
        if (demande.Type == TypeDemande.RendezVous)
        {
            demande.PlanifierRendezVous(RendezVous.Planifier(creneau), auteurId, request.Commentaire);
            return;
        }

        demande.PlanifierReunion(Reunion.Planifier(creneau), auteurId, request.Commentaire);
    }

    private async Task VerifierSalleAsync(
        DemandeRencontre demande,
        Guid salleId,
        DateTimeOffset debut,
        DateTimeOffset fin,
        CancellationToken cancellationToken)
    {
        var salle = await planification.GetSalleAsync(salleId, cancellationToken);
        if (salle is null || !salle.EstActive || salle.SocieteId != demande.SocieteId)
        {
            throw new DomainException("La salle est introuvable, inactive ou hors société.");
        }

        var effectif = 1 + demande.Participants.Count;
        if (salle.Capacite < effectif)
        {
            throw new DomainException("La capacité de la salle est insuffisante.");
        }

        if (!await planification.SalleLibreAsync(salleId, debut, fin, cancellationToken))
        {
            throw new ConflictException("La salle n'est pas disponible sur ce créneau.");
        }
    }
}
