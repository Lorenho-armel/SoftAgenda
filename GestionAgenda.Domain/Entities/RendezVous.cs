using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Entities;

public sealed class RendezVous : BaseEntity
{
    private RendezVous()
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

    public void Annuler() => Statut = StatutOccurrence.Annule;

    public void Terminer() => Statut = StatutOccurrence.Termine;

    public void DetacherDemande() => DemandeRencontreId = null;

    public static RendezVous Planifier(CreneauPlanifie creneau)
    {
        GarantirCreneau(creneau.Debut, creneau.Fin);
        return new RendezVous
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

    private static void GarantirCreneau(DateTimeOffset debut, DateTimeOffset fin)
    {
        if (fin <= debut)
        {
            throw new DomainException("Le créneau planifié est invalide.");
        }
    }
}
