using System.Text;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed record RencontreAPublier(
    Guid DemandeId,
    TypeDemande Type,
    string Motif,
    string Societe,
    DateTimeOffset Debut,
    DateTimeOffset Fin,
    string? Salle,
    string Demandeur,
    string Participants,
    Priorite Priorite);

public sealed record IndisponibiliteAPublier(
    Guid Id,
    string Type,
    string Motif,
    DateTimeOffset Debut,
    DateTimeOffset Fin,
    string Auteur);

public static class EvenementsAgenda
{
    private const string Mention = "Géré par GestionAgenda : toute modification doit être faite dans l'application.";

    /// <summary>Google n'accepte que les caractères base32hex (0-9, a-v) : un GUID hexadécimal en minuscules convient.</summary>
    public static string Identifiant(Guid sourceId) => $"ga{sourceId:N}";

    public static bool EstPublieParApplication(string evenementId) =>
        evenementId.Length == 34
        && evenementId.StartsWith("ga", StringComparison.Ordinal)
        && Guid.TryParseExact(evenementId[2..], "N", out _);

    /// <summary>
    /// Ne retient que ce qui occupe réellement le dirigeant : les événements publiés par l'application sont déjà contrôlés
    /// par la base, et ceux marqués « Disponible » ou refusés ne bloquent rien.
    /// </summary>
    public static IReadOnlyList<CreneauOccupeExterne> Occupations(
        IEnumerable<EvenementLu> evenements,
        DateTimeOffset debut,
        DateTimeOffset fin) =>
        evenements
            .Where(e => !e.Libre && !EstPublieParApplication(e.Id) && e.Debut < fin && e.Fin > debut)
            .OrderBy(e => e.Debut)
            .Select(e => new CreneauOccupeExterne(string.IsNullOrWhiteSpace(e.Titre) ? "Occupé" : e.Titre, e.Debut, e.Fin))
            .ToList();

    public static EvenementAgenda Rencontre(RencontreAPublier rencontre, string urlApplication)
    {
        var description = new StringBuilder()
            .AppendLine($"Société : {rencontre.Societe}")
            .AppendLine($"Demandeur : {rencontre.Demandeur}")
            .AppendLine($"Participants : {(string.IsNullOrWhiteSpace(rencontre.Participants) ? "aucun" : rencontre.Participants)}")
            .AppendLine($"Priorité : {FeuilleAgenda.Priorite(rencontre.Priorite)}");
        if (!string.IsNullOrWhiteSpace(urlApplication))
        {
            description.AppendLine($"Demande : {urlApplication.TrimEnd('/')}/demandes-rencontre/{rencontre.DemandeId}");
        }

        description.AppendLine().Append(Mention);
        var reunion = rencontre.Type == TypeDemande.Reunion;
        return new EvenementAgenda(
            Identifiant(rencontre.DemandeId),
            rencontre.DemandeId,
            $"[{(reunion ? "Réunion" : "RDV")}] {rencontre.Motif} – {rencontre.Societe}",
            description.ToString(),
            rencontre.Salle,
            rencontre.Debut,
            rencontre.Fin,
            reunion ? CouleurEvenement.Reunion : CouleurEvenement.RendezVous,
            false);
    }

    public static EvenementAgenda Indisponibilite(IndisponibiliteAPublier indisponibilite) =>
        new(
            Identifiant(indisponibilite.Id),
            indisponibilite.Id,
            $"Indisponible – {indisponibilite.Type}",
            $"{indisponibilite.Motif}\nSaisie par : {indisponibilite.Auteur}\n\n{Mention}",
            null,
            indisponibilite.Debut,
            indisponibilite.Fin,
            CouleurEvenement.Indisponibilite,
            true);
}
