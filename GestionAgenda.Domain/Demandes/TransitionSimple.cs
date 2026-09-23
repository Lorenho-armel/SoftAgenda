using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

internal sealed class TransitionSimple
{
    private TransitionSimple()
    {
    }

    public StatutDemande Cible { get; private init; }

    public TypeEvenementDemande Evenement { get; private init; }

    public Guid AuteurId { get; private init; }

    public string? Commentaire { get; private init; }

    public bool CommentaireObligatoire { get; private init; }

    public static TransitionSimple Analyse(Guid auteurId, string? commentaire) =>
        Creer(StatutDemande.EnAnalyse, TypeEvenementDemande.PriseEnAnalyse, auteurId, commentaire, false);

    public static TransitionSimple Acceptation(Guid auteurId, string? commentaire) =>
        Creer(StatutDemande.Acceptee, TypeEvenementDemande.Acceptation, auteurId, commentaire, false);

    public static TransitionSimple Refus(Guid auteurId, string commentaire) =>
        Creer(StatutDemande.Refusee, TypeEvenementDemande.Refus, auteurId, commentaire, true);

    public static TransitionSimple Cloture(Guid auteurId, string? commentaire) =>
        Creer(StatutDemande.Terminee, TypeEvenementDemande.Cloture, auteurId, commentaire, false);

    private static TransitionSimple Creer(
        StatutDemande cible,
        TypeEvenementDemande evenement,
        Guid auteurId,
        string? commentaire,
        bool commentaireObligatoire) =>
        new()
        {
            Cible = cible,
            Evenement = evenement,
            AuteurId = auteurId,
            Commentaire = commentaire,
            CommentaireObligatoire = commentaireObligatoire,
        };
}
