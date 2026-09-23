using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public static class TransitionsDemande
{
    private static readonly IReadOnlyDictionary<StatutDemande, StatutDemande[]> Autorisees =
        new Dictionary<StatutDemande, StatutDemande[]>
        {
            [StatutDemande.EnAttente] =
            [
                StatutDemande.EnAnalyse,
                StatutDemande.Acceptee,
                StatutDemande.Refusee,
                StatutDemande.Reportee,
                StatutDemande.Annulee,
            ],
            [StatutDemande.EnAnalyse] =
            [
                StatutDemande.Acceptee,
                StatutDemande.Refusee,
                StatutDemande.Reportee,
                StatutDemande.Annulee,
            ],
            [StatutDemande.Acceptee] =
            [
                StatutDemande.Planifiee,
                StatutDemande.Reportee,
                StatutDemande.Refusee,
                StatutDemande.Annulee,
            ],
            [StatutDemande.Reportee] =
            [
                StatutDemande.EnAnalyse,
                StatutDemande.Acceptee,
                StatutDemande.Refusee,
                StatutDemande.Annulee,
            ],
            [StatutDemande.Planifiee] =
            [
                StatutDemande.Terminee,
                StatutDemande.Annulee,
                StatutDemande.Reportee,
            ],
        };

    public static bool EstTerminal(StatutDemande statut) =>
        statut is StatutDemande.Refusee or StatutDemande.Terminee or StatutDemande.Annulee;

    public static bool AutoriseModificationSouhaits(StatutDemande statut) =>
        statut is StatutDemande.EnAttente
            or StatutDemande.EnAnalyse
            or StatutDemande.Acceptee
            or StatutDemande.Reportee;

    public static void Garantir(StatutDemande actuel, StatutDemande cible)
    {
        if (!Autorisees.TryGetValue(actuel, out var cibles) || !cibles.Contains(cible))
        {
            throw new Exceptions.DomainException(
                $"La transition de {actuel} vers {cible} est interdite.");
        }
    }
}
