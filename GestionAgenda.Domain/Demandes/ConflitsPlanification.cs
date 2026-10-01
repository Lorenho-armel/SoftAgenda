using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;

namespace GestionAgenda.Domain.Demandes;

public static class ConflitsPlanification
{
    public static ConflitPlanification CalendrierDirigeant(OccupationCalendrier occupation) =>
        new(
            TypeConflit.CalendrierDirigeant,
            true,
            Texte("Conflit de calendrier du dirigeant", occupation),
            occupation.OccurrenceId,
            occupation.Titre,
            occupation.Debut,
            occupation.Fin,
            null,
            null,
            null,
            null);

    public static ConflitPlanification CalendrierParticipant(OccupationCalendrier occupation) =>
        new(
            TypeConflit.CalendrierParticipant,
            true,
            Texte($"Conflit de calendrier de {occupation.PersonneNom}", occupation),
            occupation.OccurrenceId,
            occupation.Titre,
            occupation.Debut,
            occupation.Fin,
            occupation.PersonneId,
            occupation.PersonneNom,
            null,
            null);

    public static ConflitPlanification Salle(Guid salleId, string salleNom, OccupationSalle occupation) =>
        new(
            TypeConflit.Salle,
            true,
            $"Conflit de salle {salleNom} avec « {occupation.Titre} » ({Plage(occupation.Debut, occupation.Fin)}).",
            occupation.OccurrenceId,
            occupation.Titre,
            occupation.Debut,
            occupation.Fin,
            null,
            null,
            salleId,
            salleNom);

    public static ConflitPlanification AgendaGoogle(CreneauOccupeExterne occupation) =>
        new(
            TypeConflit.AgendaGoogle,
            true,
            $"Conflit avec l'agenda Google du dirigeant : « {occupation.Titre} » ({Plage(occupation.Debut, occupation.Fin)}).",
            null,
            occupation.Titre,
            occupation.Debut,
            occupation.Fin,
            null,
            null,
            null,
            null);

    public static ConflitPlanification AgendaGoogleNonVerifie(string raison) =>
        new(
            TypeConflit.AgendaGoogleNonVerifie,
            false,
            $"Disponibilités Google Agenda non vérifiées : {raison}",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null);

    private static string Texte(string sujet, OccupationCalendrier occurrence) =>
        $"{sujet} avec « {occurrence.Titre} » ({Plage(occurrence.Debut, occurrence.Fin)}).";

    private static string Plage(DateTimeOffset debut, DateTimeOffset fin) =>
        $"{debut:dd/MM/yyyy HH:mm} – {fin:dd/MM/yyyy HH:mm}";
}
