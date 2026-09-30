using System.Globalization;
using System.Text;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed record ElementAgenda(
    Guid Id,
    DateTime DebutLocal,
    DateTime FinLocal,
    string Type,
    string Objet,
    string Societe,
    string Dirigeant,
    string? Lieu,
    string Participants,
    string Demandeur,
    string Priorite,
    string Statut);

public sealed record ParticipantLu(string? Nom, string? Email);

public enum NatureLigne
{
    Inconnue,
    RendezVous,
    Reunion,
    Appel,
    Visio,
    Dejeuner,
    Deplacement,
    TempsBloque,
    Personnel,
    Evenement,
}

/// <summary>
/// Disposition du Sheet : A ID | B Date | C Jour | D Début | E Fin | F Durée | G Type | H Objet | I Société |
/// J Dirigeant | K Lieu | L Participants | M Demandeur | N Priorité | O Statut | P à S colonnes de l'assistante.
/// </summary>
public static class FeuilleAgenda
{
    public const int PremiereLigne = 2;
    public const int NombreColonnes = 19;

    public static readonly IReadOnlyList<string> Entetes =
    [
        "ID application", "Date", "Jour", "Heure début", "Heure fin", "Durée", "Type", "Objet", "Société",
        "Dirigeant", "Lieu ou lien visio", "Participants", "Demandeur", "Priorité", "Statut",
        "Documents à préparer", "Brief prêt ?", "Logistique", "Notes et décisions",
    ];

    public static readonly IReadOnlyList<string> Types =
    [
        "Rendez-vous", "Réunion", "Appel", "Visio", "Déjeuner", "Déplacement", "Événement", "Temps bloqué", "Personnel",
    ];

    public static readonly IReadOnlyList<string> Priorites = ["Basse", "Moyenne", "Haute", "Critique"];

    public static readonly IReadOnlyList<string> Statuts =
        ["À confirmer", "Accepté", "Confirmé", "Reporté", "Refusé", "Annulé", "Terminé"];

    private static readonly DateTime Origine = new(1899, 12, 30);
    private static readonly CultureInfo Francais = CultureInfo.GetCultureInfo("fr-FR");

    public static double NumeroSerie(DateTime date) => (date.Date - Origine).TotalDays;

    public static double FractionJour(DateTime date) => date.TimeOfDay.TotalDays;

    public static IReadOnlyList<BlocCellules> Blocs(string onglet, int ligne, ElementAgenda element, bool nouvelleLigne)
    {
        var objet = element.FinLocal.Date > element.DebutLocal.Date
            ? $"{element.Objet} (jusqu'au {element.FinLocal.ToString("dd/MM/yyyy HH:mm", Francais)})"
            : element.Objet;
        var blocs = new List<BlocCellules>
        {
            Bloc(onglet, "A", ligne, element.Id.ToString(), NumeroSerie(element.DebutLocal)),
            Bloc(onglet, "D", ligne, FractionJour(element.DebutLocal), FractionJour(element.FinLocal)),
            Bloc(onglet, "G", ligne, element.Type, objet, element.Societe, element.Dirigeant),
            Bloc(onglet, "L", ligne, element.Participants, element.Demandeur, element.Priorite, element.Statut),
        };
        if (nouvelleLigne && !string.IsNullOrWhiteSpace(element.Lieu))
        {
            blocs.Add(Bloc(onglet, "K", ligne, element.Lieu));
        }

        return blocs;
    }

    public static string Plage(string onglet, string plage) => $"'{onglet.Replace("'", "''")}'!{plage}";

    public static int? LigneDe(IList<IList<object?>> identifiantsEtDates, Guid id)
    {
        var cle = id.ToString();
        for (var index = 0; index < identifiantsEtDates.Count; index++)
        {
            if (string.Equals(Texte(Cellule(identifiantsEtDates[index], 0)), cle, StringComparison.OrdinalIgnoreCase))
            {
                return index + PremiereLigne;
            }
        }

        return null;
    }

    public static int PremiereLigneLibre(IList<IList<object?>> identifiantsEtDates)
    {
        for (var index = 0; index < identifiantsEtDates.Count; index++)
        {
            var ligne = identifiantsEtDates[index];
            if (Texte(Cellule(ligne, 0)).Length == 0 && Texte(Cellule(ligne, 1)).Length == 0)
            {
                return index + PremiereLigne;
            }
        }

        return identifiantsEtDates.Count + PremiereLigne;
    }

    public static string TypeDemande(TypeDemande type) => type == Domain.Enums.TypeDemande.Reunion ? "Réunion" : "Rendez-vous";

    public static string Priorite(Priorite priorite) => priorite switch
    {
        Domain.Enums.Priorite.Faible => "Basse",
        Domain.Enums.Priorite.Haute => "Haute",
        Domain.Enums.Priorite.Critique => "Critique",
        _ => "Moyenne",
    };

    public static string Statut(StatutDemande statut) => statut switch
    {
        StatutDemande.Acceptee => "Accepté",
        StatutDemande.Planifiee => "Confirmé",
        StatutDemande.Reportee => "Reporté",
        StatutDemande.Refusee => "Refusé",
        StatutDemande.Annulee => "Annulé",
        StatutDemande.Terminee => "Terminé",
        _ => "À confirmer",
    };

    public static Priorite LirePriorite(object? valeur) => Normaliser(Texte(valeur)) switch
    {
        "basse" or "faible" => Domain.Enums.Priorite.Faible,
        "haute" => Domain.Enums.Priorite.Haute,
        "critique" => Domain.Enums.Priorite.Critique,
        _ => Domain.Enums.Priorite.Moyenne,
    };

    public static string LireStatut(object? valeur) => Normaliser(Texte(valeur));

    public static NatureLigne LireNature(object? valeur) => Normaliser(Texte(valeur)) switch
    {
        "" or "rendez-vous" or "rendez vous" or "rdv" => NatureLigne.RendezVous,
        "reunion" => NatureLigne.Reunion,
        "appel" => NatureLigne.Appel,
        "visio" => NatureLigne.Visio,
        "dejeuner" => NatureLigne.Dejeuner,
        "deplacement" => NatureLigne.Deplacement,
        "temps bloque" => NatureLigne.TempsBloque,
        "personnel" => NatureLigne.Personnel,
        "evenement" => NatureLigne.Evenement,
        _ => NatureLigne.Inconnue,
    };

    public static TypeIndisponibilite? Indisponibilite(NatureLigne nature) => nature switch
    {
        NatureLigne.Deplacement => TypeIndisponibilite.Deplacement,
        NatureLigne.TempsBloque => TypeIndisponibilite.TempsBloque,
        NatureLigne.Personnel => TypeIndisponibilite.Personnel,
        NatureLigne.Evenement => TypeIndisponibilite.Evenement,
        _ => null,
    };

    public static DateOnly? LireDate(object? valeur)
    {
        switch (valeur)
        {
            case double serie when serie > 0:
                return DateOnly.FromDateTime(Origine.AddDays(Math.Floor(serie)));
            case long entier when entier > 0:
                return DateOnly.FromDateTime(Origine.AddDays(entier));
            default:
                var texte = Texte(valeur);
                string[] formats = ["dd/MM/yyyy", "d/M/yyyy", "dd/MM/yy", "yyyy-MM-dd"];
                return DateOnly.TryParseExact(texte, formats, Francais, DateTimeStyles.None, out var date) ? date : null;
        }
    }

    public static TimeOnly? LireHeure(object? valeur)
    {
        switch (valeur)
        {
            case double fraction when fraction >= 0:
                var minutes = (int)Math.Round((fraction - Math.Floor(fraction)) * 24 * 60);
                return minutes >= 24 * 60 ? null : TimeOnly.FromTimeSpan(TimeSpan.FromMinutes(minutes));
            default:
                var texte = Texte(valeur).Replace('h', ':').Replace('H', ':');
                if (texte.EndsWith(':'))
                {
                    texte += "00";
                }

                string[] formats = ["H:mm", "HH:mm", "H:mm:ss", "HH:mm:ss"];
                return TimeOnly.TryParseExact(texte, formats, Francais, DateTimeStyles.None, out var heure) ? heure : null;
        }
    }

    public static IReadOnlyList<ParticipantLu> LireParticipants(object? valeur)
    {
        var morceaux = Texte(valeur).Split([';', '\n', ','], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var participants = new List<ParticipantLu>();
        foreach (var morceau in morceaux)
        {
            var ouverture = morceau.IndexOf('<');
            var fermeture = morceau.IndexOf('>');
            if (ouverture >= 0 && fermeture > ouverture)
            {
                var nom = morceau[..ouverture].Trim();
                participants.Add(new ParticipantLu(nom.Length == 0 ? null : nom, morceau[(ouverture + 1)..fermeture].Trim()));
            }
            else if (morceau.Contains('@'))
            {
                participants.Add(new ParticipantLu(null, morceau));
            }
            else
            {
                participants.Add(new ParticipantLu(morceau, null));
            }
        }

        return participants;
    }

    public static string EcrireParticipants(IEnumerable<ParticipantLu> participants) =>
        string.Join("; ", participants.Select(p => p switch
        {
            { Nom: { Length: > 0 } nom, Email: { Length: > 0 } email } => $"{nom} <{email}>",
            { Nom: { Length: > 0 } nom } => nom,
            _ => p.Email ?? string.Empty,
        }).Where(texte => texte.Length > 0));

    public static object? Cellule(IList<object?> ligne, int colonne) => colonne < ligne.Count ? ligne[colonne] : null;

    public static string Texte(object? valeur) => Convert.ToString(valeur, Francais)?.Trim() ?? string.Empty;

    public static string Normaliser(string texte)
    {
        var decompose = texte.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var resultat = new StringBuilder(decompose.Length);
        foreach (var caractere in decompose)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(caractere) != UnicodeCategory.NonSpacingMark)
            {
                resultat.Append(caractere);
            }
        }

        return string.Join(' ', resultat.ToString().Split(' ', StringSplitOptions.RemoveEmptyEntries));
    }

    private static BlocCellules Bloc(string onglet, string colonne, int ligne, params object?[] valeurs)
    {
        var fin = (char)(colonne[0] + valeurs.Length - 1);
        return new BlocCellules(Plage(onglet, $"{colonne}{ligne}:{fin}{ligne}"), [valeurs.ToList()]);
    }
}
