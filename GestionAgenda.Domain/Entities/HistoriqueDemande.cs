using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Entities;

public sealed class HistoriqueDemande : BaseEntity
{
    private HistoriqueDemande()
    {
    }

    public Guid DemandeRencontreId { get; private set; }

    public Guid AuteurId { get; private set; }

    public TypeEvenementDemande TypeEvenement { get; private set; }

    public string? Commentaire { get; private set; }

    public StatutDemande? StatutAvant { get; private set; }

    public StatutDemande? StatutApres { get; private set; }

    public Urgence? UrgenceAvant { get; private set; }

    public Urgence? UrgenceApres { get; private set; }

    public Priorite? PrioriteAvant { get; private set; }

    public Priorite? PrioriteApres { get; private set; }

    public DateTimeOffset? DateDebutAvant { get; private set; }

    public DateTimeOffset? DateDebutApres { get; private set; }

    public DateTimeOffset? DateFinAvant { get; private set; }

    public DateTimeOffset? DateFinApres { get; private set; }

    public Guid? SalleAvantId { get; private set; }

    public Guid? SalleApresId { get; private set; }

    public Guid? RendezVousId { get; private set; }

    public Guid? ReunionId { get; private set; }

    public DemandeRencontre? Demande { get; private set; }

    internal static HistoriqueDemande Creer(Guid demandeId, NouvelEvenementDemande evenement) =>
        new()
        {
            DemandeRencontreId = demandeId,
            AuteurId = evenement.AuteurId,
            TypeEvenement = evenement.TypeEvenement,
            Commentaire = evenement.Commentaire,
            StatutAvant = evenement.StatutAvant,
            StatutApres = evenement.StatutApres,
            UrgenceAvant = evenement.UrgenceAvant,
            UrgenceApres = evenement.UrgenceApres,
            PrioriteAvant = evenement.PrioriteAvant,
            PrioriteApres = evenement.PrioriteApres,
            DateDebutAvant = evenement.DateDebutAvant,
            DateDebutApres = evenement.DateDebutApres,
            DateFinAvant = evenement.DateFinAvant,
            DateFinApres = evenement.DateFinApres,
            SalleAvantId = evenement.SalleAvantId,
            SalleApresId = evenement.SalleApresId,
            RendezVousId = evenement.RendezVousId,
            ReunionId = evenement.ReunionId,
        };
}
