using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public static class TexteNotification
{
    public static EvenementNotification? DepuisStatut(StatutDemande statut) => statut switch
    {
        StatutDemande.Acceptee => EvenementNotification.Acceptee,
        StatutDemande.Refusee => EvenementNotification.Refusee,
        StatutDemande.Reportee => EvenementNotification.Reportee,
        StatutDemande.Planifiee => EvenementNotification.Planifiee,
        StatutDemande.Annulee => EvenementNotification.Annulation,
        _ => null,
    };

    public static string Titre(EvenementNotification evenement) => evenement switch
    {
        EvenementNotification.Creation => "Nouvelle demande de rencontre",
        EvenementNotification.Acceptee => "Demande acceptée",
        EvenementNotification.Refusee => "Demande refusée",
        EvenementNotification.Reportee => "Demande reportée",
        EvenementNotification.Planifiee => "Rencontre planifiée",
        EvenementNotification.ModificationRendezVous => "Rendez-vous modifié",
        EvenementNotification.Annulation => "Demande annulée",
        EvenementNotification.Rappel => "Rappel de rencontre",
        _ => "Demande de rencontre",
    };

    public static string TitreRappel(HorizonRappel horizon) => horizon switch
    {
        HorizonRappel.Heure => "Rappel : rencontre imminente",
        _ => "Rappel : rencontre à venir",
    };

    public static string Message(EvenementNotification evenement, string motif) => evenement switch
    {
        EvenementNotification.Creation => $"Une demande vous est adressée : {motif}.",
        EvenementNotification.Acceptee => $"Votre demande a été acceptée : {motif}.",
        EvenementNotification.Refusee => $"Votre demande a été refusée : {motif}.",
        EvenementNotification.Reportee => $"Votre demande a été reportée : {motif}.",
        EvenementNotification.Planifiee => $"Une rencontre a été planifiée : {motif}.",
        EvenementNotification.ModificationRendezVous => $"Le rendez-vous a été modifié : {motif}.",
        EvenementNotification.Annulation => $"La demande a été annulée : {motif}.",
        EvenementNotification.Rappel => motif,
        _ => motif,
    };

    public static string MessageDecision(
        EvenementNotification evenement,
        string motif,
        string? commentaire,
        DateTimeOffset? nouveauDebut,
        DateTimeOffset? nouvelleFin)
    {
        var message = Message(evenement, motif);
        if (evenement == EvenementNotification.Reportee && nouveauDebut.HasValue && nouvelleFin.HasValue)
        {
            message += $" Nouvelle période proposée : du {Horodatage(nouveauDebut.Value)} au {Horodatage(nouvelleFin.Value)}.";
        }

        if (!string.IsNullOrWhiteSpace(commentaire))
        {
            var libelle = evenement == EvenementNotification.Refusee ? "Motif du refus" : "Commentaire";
            message += $" {libelle} : {commentaire.Trim()}";
        }

        return message;
    }

    private static string Horodatage(DateTimeOffset date) =>
        date.ToString("dd/MM/yyyy 'à' HH:mm", System.Globalization.CultureInfo.GetCultureInfo("fr-FR"));

    public static string MessageRappel(HorizonRappel horizon, string motif) => horizon switch
    {
        HorizonRappel.Heure => $"Votre rencontre commence dans moins d'une heure : {motif}.",
        _ => $"Votre rencontre commence dans moins de 24 heures : {motif}.",
    };
}
