using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Entities;

public sealed class Reunion : BaseEntity
{
    private Reunion()
    {
    }

    public Guid DirigeantId { get; private set; }

    public Guid SocieteId { get; private set; }

    public Guid? DemandeRencontreId { get; private set; }

    public Guid? SalleId { get; private set; }

    public DateTimeOffset Debut { get; private set; }

    public DateTimeOffset Fin { get; private set; }

    public string Titre { get; private set; } = string.Empty;

    public StatutOccurrence Statut { get; private set; }

    public DemandeRencontre? Demande { get; private set; }

    public void Deplacer(DateTimeOffset debut, DateTimeOffset fin, Guid? salleId)
    {
        if (Statut != StatutOccurrence.Planifie)
        {
            throw new DomainException("Cette rencontre ne peut plus être déplacée.");
        }

        if (fin <= debut)
        {
            throw new DomainException("Le créneau planifié est invalide.");
        }

        Debut = debut;
        Fin = fin;
        SalleId = salleId;
    }

    public void Annuler() => Statut = StatutOccurrence.Annule;

    public void Terminer() => Statut = StatutOccurrence.Termine;

    public void DetacherDemande() => DemandeRencontreId = null;

    public static Reunion Planifier(CreneauPlanifie creneau)
    {
        if (creneau.Fin <= creneau.Debut)
        {
            throw new DomainException("Le créneau planifié est invalide.");
        }

        return new Reunion
        {
            DirigeantId = creneau.DirigeantId,
            SocieteId = creneau.SocieteId,
            DemandeRencontreId = creneau.DemandeId,
            SalleId = creneau.SalleId,
            Debut = creneau.Debut,
            Fin = creneau.Fin,
            Titre = creneau.Titre.Trim(),
            Statut = StatutOccurrence.Planifie,
        };
    }
}
