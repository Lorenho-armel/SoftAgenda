using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

internal static class EvenementsDemande
{
    public static NouvelEvenementDemande Planification(
        Guid auteurId,
        StatutDemande avant,
        string? commentaire,
        (Guid? RendezVousId, Guid? ReunionId) liens) =>
        new()
        {
            AuteurId = auteurId,
            TypeEvenement = TypeEvenementDemande.Planification,
            Commentaire = InvariantsDemande.NormaliserCommentaire(commentaire),
            StatutAvant = avant,
            StatutApres = StatutDemande.Planifiee,
            RendezVousId = liens.RendezVousId,
            ReunionId = liens.ReunionId,
        };
}
