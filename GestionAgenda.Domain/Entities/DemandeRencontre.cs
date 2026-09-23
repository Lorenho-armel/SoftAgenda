using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Entities;

public sealed class DemandeRencontre : BaseEntity
{
    private readonly List<DemandeParticipant> _participants = [];
    private readonly List<HistoriqueDemande> _historique = [];

    private DemandeRencontre()
    {
    }

    public Guid DemandeurId { get; private set; }

    public Guid DirigeantId { get; private set; }

    public Guid SocieteId { get; private set; }

    public TypeDemande Type { get; private set; }

    public string Motif { get; private set; } = string.Empty;

    public DateTimeOffset DateDebutSouhaitee { get; private set; }

    public DateTimeOffset DateFinSouhaitee { get; private set; }

    public int DureeMinutes { get; private set; }

    public Urgence Urgence { get; private set; }

    public Priorite Priorite { get; private set; }

    public StatutDemande Statut { get; private set; }

    public Guid? SalleSouhaiteeId { get; private set; }

    public Utilisateur? Demandeur { get; private set; }

    public Utilisateur? Dirigeant { get; private set; }

    public Societe? Societe { get; private set; }

    public RendezVous? RendezVous { get; internal set; }

    public Reunion? Reunion { get; internal set; }

    public IReadOnlyCollection<DemandeParticipant> Participants => _participants;

    public IReadOnlyCollection<HistoriqueDemande> Historique => _historique;

    public static DemandeRencontre Creer(NouvelleDemande donnees)
    {
        ArgumentNullException.ThrowIfNull(donnees);
        InvariantsDemande.GarantirIdentite(donnees.DemandeurId, donnees.DirigeantId);
        QualificationDemande.GarantirValeurs(donnees.Type, donnees.Urgence, donnees.Priorite);
        var motif = InvariantsDemande.GarantirMotif(donnees.Motif);
        InvariantsDemande.GarantirPeriode(
            donnees.DateDebutSouhaitee,
            donnees.DateFinSouhaitee,
            donnees.DureeMinutes,
            exigerFutur: true);

        var demande = new DemandeRencontre
        {
            DemandeurId = donnees.DemandeurId,
            DirigeantId = donnees.DirigeantId,
            SocieteId = donnees.SocieteId,
            Type = donnees.Type,
            Motif = motif,
            DateDebutSouhaitee = donnees.DateDebutSouhaitee,
            DateFinSouhaitee = donnees.DateFinSouhaitee,
            DureeMinutes = donnees.DureeMinutes,
            Urgence = donnees.Urgence,
            Priorite = donnees.Priorite,
            Statut = StatutDemande.EnAttente,
            SalleSouhaiteeId = donnees.SalleSouhaiteeId,
        };
        demande.RemplacerParticipants(donnees.Participants, donnees.Type);
        demande.Journaliser(new NouvelEvenementDemande
        {
            AuteurId = donnees.DemandeurId,
            TypeEvenement = TypeEvenementDemande.Creation,
            StatutApres = StatutDemande.EnAttente,
        });
        return demande;
    }

    public void MettreAJour(MiseAJourDemande miseAJour)
    {
        if (!TransitionsDemande.AutoriseModificationSouhaits(Statut))
        {
            throw new DomainException("La demande ne peut plus être modifiée dans son statut actuel.");
        }

        QualificationDemande.GarantirValeurs(miseAJour.Type, Urgence, Priorite);
        Type = miseAJour.Type;
        Motif = InvariantsDemande.GarantirMotif(miseAJour.Motif);
        InvariantsDemande.GarantirPeriode(
            miseAJour.DateDebutSouhaitee,
            miseAJour.DateFinSouhaitee,
            miseAJour.DureeMinutes,
            exigerFutur: false);
        DateDebutSouhaitee = miseAJour.DateDebutSouhaitee;
        DateFinSouhaitee = miseAJour.DateFinSouhaitee;
        DureeMinutes = miseAJour.DureeMinutes;
        SalleSouhaiteeId = miseAJour.SalleSouhaiteeId;
        RemplacerParticipants(miseAJour.Participants, miseAJour.Type);
    }

    public void ChangerUrgence(Urgence urgence, Guid auteurId, string? commentaire)
    {
        QualificationDemande.GarantirUrgenceModifiable(urgence, Statut);
        if (Urgence == urgence)
        {
            return;
        }

        var avant = Urgence;
        Urgence = urgence;
        Journaliser(new NouvelEvenementDemande
        {
            AuteurId = auteurId,
            TypeEvenement = TypeEvenementDemande.ChangementUrgence,
            Commentaire = InvariantsDemande.NormaliserCommentaire(commentaire),
            UrgenceAvant = avant,
            UrgenceApres = urgence,
        });
    }

    public void ChangerPriorite(Priorite priorite, Guid auteurId, string? commentaire)
    {
        if (!Enum.IsDefined(priorite))
        {
            throw new DomainException("La priorité est invalide.");
        }

        if (TransitionsDemande.EstTerminal(Statut))
        {
            throw new DomainException("La priorité ne peut plus être modifiée.");
        }

        if (Priorite == priorite)
        {
            return;
        }

        var avant = Priorite;
        Priorite = priorite;
        Journaliser(new NouvelEvenementDemande
        {
            AuteurId = auteurId,
            TypeEvenement = TypeEvenementDemande.ChangementPriorite,
            Commentaire = InvariantsDemande.NormaliserCommentaire(commentaire),
            PrioriteAvant = avant,
            PrioriteApres = priorite,
        });
    }

    public void PrendreEnAnalyse(Guid auteurId, string? commentaire) =>
        AppliquerStatut(TransitionSimple.Analyse(auteurId, commentaire));

    public void Accepter(Guid auteurId, string? commentaire) =>
        AppliquerStatut(TransitionSimple.Acceptation(auteurId, commentaire));

    public void Refuser(Guid auteurId, string commentaire) =>
        AppliquerStatut(TransitionSimple.Refus(auteurId, commentaire));

    public void Cloturer(Guid auteurId, string? commentaire)
    {
        AppliquerStatut(TransitionSimple.Cloture(auteurId, commentaire));
        RendezVous?.Terminer();
        Reunion?.Terminer();
    }

    public void Annuler(Guid auteurId, string commentaire)
    {
        var avant = Statut;
        var texte = PreparerTransition(StatutDemande.Annulee, commentaire, obligatoire: true);
        var rendezVousId = RendezVous?.Id;
        var reunionId = Reunion?.Id;
        LiberationPlanification.Liberer(this);
        Statut = StatutDemande.Annulee;
        Journaliser(new NouvelEvenementDemande
        {
            AuteurId = auteurId,
            TypeEvenement = TypeEvenementDemande.Annulation,
            Commentaire = texte,
            StatutAvant = avant,
            StatutApres = Statut,
            RendezVousId = rendezVousId,
            ReunionId = reunionId,
        });
    }

    public void Reporter(ReportDemande report)
    {
        var avantStatut = Statut;
        var texte = PreparerTransition(StatutDemande.Reportee, report.Commentaire, obligatoire: true);
        InvariantsDemande.GarantirPeriode(report.Debut, report.Fin, DureeMinutes, exigerFutur: false);
        var rendezVousId = RendezVous?.Id;
        var reunionId = Reunion?.Id;
        var debutAvant = DateDebutSouhaitee;
        var finAvant = DateFinSouhaitee;
        LiberationPlanification.Liberer(this);
        DateDebutSouhaitee = report.Debut;
        DateFinSouhaitee = report.Fin;
        Statut = StatutDemande.Reportee;
        Journaliser(new NouvelEvenementDemande
        {
            AuteurId = report.AuteurId,
            TypeEvenement = TypeEvenementDemande.Report,
            Commentaire = texte,
            StatutAvant = avantStatut,
            StatutApres = Statut,
            DateDebutAvant = debutAvant,
            DateDebutApres = DateDebutSouhaitee,
            DateFinAvant = finAvant,
            DateFinApres = DateFinSouhaitee,
            RendezVousId = rendezVousId,
            ReunionId = reunionId,
        });
    }

    public void DeplacerOccurrence(DateTimeOffset debut, DateTimeOffset fin, Guid? salleId, Guid auteurId)
    {
        if (Statut != StatutDemande.Planifiee)
        {
            throw new DomainException("Seule une rencontre planifiée peut être déplacée.");
        }

        if (RendezVous is not null)
        {
            RendezVous.Deplacer(debut, fin, salleId);
        }
        else if (Reunion is not null)
        {
            Reunion.Deplacer(debut, fin, salleId);
        }
        else
        {
            throw new DomainException("Aucune rencontre planifiée à déplacer.");
        }

        Journaliser(new NouvelEvenementDemande
        {
            AuteurId = auteurId,
            TypeEvenement = TypeEvenementDemande.Deplacement,
            StatutAvant = Statut,
            StatutApres = Statut,
            DateDebutApres = debut,
            DateFinApres = fin,
            SalleApresId = salleId,
        });
    }

    public DateTimeOffset FinDuCreneau(DateTimeOffset debut)
    {
        InvariantsDemande.GarantirCreneauDansPeriode(DateDebutSouhaitee, DateFinSouhaitee, debut, DureeMinutes);
        return debut.AddMinutes(DureeMinutes);
    }

    public void PlanifierRendezVous(RendezVous rendezVous, Guid auteurId, string? commentaire)
    {
        var avant = PreparerPlanification(TypeDemande.RendezVous, commentaire);
        RendezVous = rendezVous;
        Journaliser(EvenementsDemande.Planification(auteurId, avant, commentaire, (rendezVous.Id, null)));
    }

    public void PlanifierReunion(Reunion reunion, Guid auteurId, string? commentaire)
    {
        var avant = PreparerPlanification(TypeDemande.Reunion, commentaire);
        Reunion = reunion;
        Journaliser(EvenementsDemande.Planification(auteurId, avant, commentaire, (null, reunion.Id)));
    }

    private StatutDemande PreparerPlanification(TypeDemande typeAttendu, string? commentaire)
    {
        if (Type != typeAttendu)
        {
            throw new DomainException("Le type de la demande ne correspond pas à la planification.");
        }

        var avant = Statut;
        TransitionsDemande.Garantir(Statut, StatutDemande.Planifiee);
        _ = InvariantsDemande.NormaliserCommentaire(commentaire);
        Statut = StatutDemande.Planifiee;
        return avant;
    }

    private void AppliquerStatut(TransitionSimple transition)
    {
        var avant = Statut;
        var texte = PreparerTransition(transition.Cible, transition.Commentaire, transition.CommentaireObligatoire);
        Statut = transition.Cible;
        Journaliser(new NouvelEvenementDemande
        {
            AuteurId = transition.AuteurId,
            TypeEvenement = transition.Evenement,
            Commentaire = texte,
            StatutAvant = avant,
            StatutApres = transition.Cible,
        });
    }

    private string? PreparerTransition(StatutDemande cible, string? commentaire, bool obligatoire)
    {
        TransitionsDemande.Garantir(Statut, cible);
        return obligatoire
            ? InvariantsDemande.ExigerCommentaire(commentaire)
            : InvariantsDemande.NormaliserCommentaire(commentaire);
    }

    private void RemplacerParticipants(IReadOnlyList<NouveauParticipant> participants, TypeDemande type)
    {
        var nouveaux = ParticipationDemande.Construire(Id, DirigeantId, type, participants);
        _participants.Clear();
        _participants.AddRange(nouveaux);
    }

    private void Journaliser(NouvelEvenementDemande evenement) =>
        _historique.Add(HistoriqueDemande.Creer(Id, evenement));
}
