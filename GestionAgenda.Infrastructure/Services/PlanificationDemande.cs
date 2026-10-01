using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;

namespace GestionAgenda.Infrastructure.Services;

public sealed class PlanificationDemande(
    IPlanificationRepository planification,
    IDisponibilitesExternes? disponibilites = null)
{
    public async Task<BilanPlanification> EvaluerAsync(
        DemandeRencontre demande,
        DateTimeOffset debut,
        Guid? salleId,
        CancellationToken cancellationToken = default)
    {
        if (demande.Statut is not (StatutDemande.Acceptee or StatutDemande.Planifiee))
        {
            throw new DomainException("Seule une demande acceptée ou planifiée peut occuper un créneau.");
        }

        var fin = demande.FinDuCreneau(debut);
        var salle = await ExigerSalleValideAsync(demande, NormaliserSalle(salleId), cancellationToken);
        var conflits = await CollecterAsync(demande, new Intervalle(debut, fin), salle, cancellationToken);
        return new BilanPlanification(debut, fin, conflits);
    }

    public async Task AppliquerAsync(
        DemandeRencontre demande,
        ChangerStatutDemandeRequest request,
        Guid auteurId,
        CancellationToken cancellationToken = default)
    {
        if (request.DebutPlanifie is null)
        {
            throw new DomainException("Le créneau confirmé est obligatoire pour planifier.");
        }

        var bilan = await EvaluerAsync(demande, request.DebutPlanifie.Value, request.SalleId, cancellationToken);
        GarantirSansConflit(bilan);
        Inscrire(demande, bilan, request, auteurId);
    }

    public async Task DeplacerAsync(
        DemandeRencontre demande,
        DateTimeOffset debut,
        Guid? salleId,
        Guid auteurId,
        CancellationToken cancellationToken = default)
    {
        if (demande.Statut != StatutDemande.Planifiee)
        {
            throw new DomainException("Seule une rencontre planifiée peut être déplacée.");
        }

        var bilan = await EvaluerAsync(demande, debut, salleId, cancellationToken);
        GarantirSansConflit(bilan);
        demande.DeplacerOccurrence(bilan.Debut, bilan.Fin, NormaliserSalle(salleId), auteurId);
    }

    private static void GarantirSansConflit(BilanPlanification bilan)
    {
        if (!bilan.PeutPlanifier)
        {
            throw new ConflictException(
                "La planification est impossible : des conflits bloquants ont été détectés.",
                bilan.Conflits);
        }
    }

    private static void Inscrire(
        DemandeRencontre demande,
        BilanPlanification bilan,
        ChangerStatutDemandeRequest request,
        Guid auteurId)
    {
        var creneau = new CreneauPlanifie(
            demande.DirigeantId,
            demande.SocieteId,
            demande.Id,
            NormaliserSalle(request.SalleId),
            bilan.Debut,
            bilan.Fin,
            demande.Motif);
        if (demande.Type == TypeDemande.RendezVous)
        {
            demande.PlanifierRendezVous(RendezVous.Planifier(creneau), auteurId, request.Commentaire);
            return;
        }

        demande.PlanifierReunion(Reunion.Planifier(creneau), auteurId, request.Commentaire);
    }

    private async Task<IReadOnlyList<ConflitPlanification>> CollecterAsync(
        DemandeRencontre demande,
        Intervalle creneau,
        Salle? salle,
        CancellationToken cancellationToken)
    {
        var conflits = new List<ConflitPlanification>();
        var dirigeant = await planification.OccupationsDirigeantAsync(
            demande.DirigeantId, creneau, demande.Id, cancellationToken);
        conflits.AddRange(dirigeant.Select(ConflitsPlanification.CalendrierDirigeant));
        var participants = await planification.OccupationsParticipantsAsync(
            IdentifiantsInternes(demande), creneau, demande.Id, cancellationToken);
        conflits.AddRange(participants.Select(ConflitsPlanification.CalendrierParticipant));
        if (salle is not null)
        {
            var occupations = await planification.OccupationsSalleAsync(salle.Id, creneau, demande.Id, cancellationToken);
            conflits.AddRange(occupations.Select(occupation => ConflitsPlanification.Salle(salle.Id, salle.Nom, occupation)));
        }

        if (disponibilites is not null)
        {
            var externes = await disponibilites.OccupationsDirigeantAsync(demande.DirigeantId, creneau, cancellationToken);
            conflits.AddRange(externes.Occupations.Select(ConflitsPlanification.AgendaGoogle));
            if (!externes.Verifiees)
            {
                conflits.Add(ConflitsPlanification.AgendaGoogleNonVerifie(externes.Raison ?? "raison inconnue."));
            }
        }

        return conflits;
    }

    private async Task<Salle?> ExigerSalleValideAsync(
        DemandeRencontre demande,
        Guid? salleId,
        CancellationToken cancellationToken)
    {
        if (salleId is null)
        {
            return null;
        }

        var salle = await planification.GetSalleAsync(salleId.Value, cancellationToken);
        if (salle is null || !salle.EstActive || salle.SocieteId != demande.SocieteId)
        {
            throw new DomainException("La salle est introuvable, inactive ou hors société.");
        }

        if (salle.Capacite < 1 + demande.Participants.Count)
        {
            throw new DomainException("La capacité de la salle est insuffisante.");
        }

        return salle;
    }

    private static IReadOnlyCollection<Guid> IdentifiantsInternes(DemandeRencontre demande) =>
        demande.Participants
            .Where(participant => participant.UtilisateurId.HasValue)
            .Select(participant => participant.UtilisateurId!.Value)
            .Distinct()
            .ToList();

    private static Guid? NormaliserSalle(Guid? salleId) =>
        salleId is null || salleId == Guid.Empty ? null : salleId;
}
