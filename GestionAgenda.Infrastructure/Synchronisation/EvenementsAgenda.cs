using System.Text;
using GestionAgenda.Domain.Enums;

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
