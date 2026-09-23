using System.Linq.Expressions;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public static class TableauAssistante
{
    public const int TailleATraiter = 8;

    public const int TailleAujourdhui = 20;

    public const int TailleProchaines = 5;

    public static Expression<Func<DemandeRencontre, bool>> ATraiter =>
        demande => demande.Statut == StatutDemande.EnAttente || demande.Statut == StatutDemande.EnAnalyse;

    public static Expression<Func<DemandeRencontre, bool>> Urgentes =>
        demande => demande.Urgence == Urgence.Urgent
            && demande.Statut != StatutDemande.Refusee
            && demande.Statut != StatutDemande.Terminee
            && demande.Statut != StatutDemande.Annulee;

    public static Expression<Func<DemandeRencontre, bool>> Critiques =>
        demande => demande.Urgence == Urgence.Critique
            && demande.Statut != StatutDemande.Refusee
            && demande.Statut != StatutDemande.Terminee
            && demande.Statut != StatutDemande.Annulee;

    public static Expression<Func<DemandeRencontre, bool>> Prioritaires =>
        demande => (demande.Priorite == Priorite.Haute || demande.Priorite == Priorite.Critique)
            && demande.Statut != StatutDemande.Refusee
            && demande.Statut != StatutDemande.Terminee
            && demande.Statut != StatutDemande.Annulee;

    public static Expression<Func<DemandeRencontre, bool>> Acceptees =>
        demande => demande.Statut == StatutDemande.Acceptee;

    public static Expression<Func<DemandeRencontre, bool>> Reportees =>
        demande => demande.Statut == StatutDemande.Reportee;

    public static Expression<Func<DemandeRencontre, bool>> DuJour(DateTimeOffset debut, DateTimeOffset fin) =>
        demande => demande.Statut == StatutDemande.Planifiee
            && ((demande.RendezVous != null
                    && demande.RendezVous.Statut == StatutOccurrence.Planifie
                    && demande.RendezVous.Debut >= debut
                    && demande.RendezVous.Debut < fin)
                || (demande.Reunion != null
                    && demande.Reunion.Statut == StatutOccurrence.Planifie
                    && demande.Reunion.Debut >= debut
                    && demande.Reunion.Debut < fin));

    public static Expression<Func<DemandeRencontre, bool>> Apres(DateTimeOffset instant) =>
        demande => demande.Statut == StatutDemande.Planifiee
            && ((demande.RendezVous != null
                    && demande.RendezVous.Statut == StatutOccurrence.Planifie
                    && demande.RendezVous.Debut >= instant)
                || (demande.Reunion != null
                    && demande.Reunion.Statut == StatutOccurrence.Planifie
                    && demande.Reunion.Debut >= instant));
}
