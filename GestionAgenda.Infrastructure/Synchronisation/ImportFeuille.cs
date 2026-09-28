using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.DTOs.Synchronisation;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using GestionAgenda.Infrastructure.Options;
using GestionAgenda.Infrastructure.Services;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class ImportFeuille(
    ApplicationDbContext contexte,
    IClientFeuille feuille,
    IIndisponibiliteRepository indisponibilites,
    PlanificationDemande planification,
    IOptions<GoogleSheetsOptions> options,
    ILogger<ImportFeuille> journal) : IFeuilleAgendaService
{
    private const string CommentaireImport = "Import Google Sheets";
    private readonly GoogleSheetsOptions configuration = options.Value;

    public EtatFeuilleResponse Etat() =>
        new(
            configuration.EstConfigure,
            configuration.EstConfigure ? $"https://docs.google.com/spreadsheets/d/{configuration.SpreadsheetId}" : null,
            configuration.Onglet);

    public async Task ResynchroniserAsync(Guid utilisateurId, CancellationToken cancellationToken = default)
    {
        ExigerConfiguration();
        await ExigerGestionnaireAsync(utilisateurId, cancellationToken);
        BackgroundJob.Enqueue<SynchronisationFeuille>(s => s.ResynchroniserToutAsync());
    }

    public async Task<RapportImportResponse> ImporterAsync(Guid utilisateurId, CancellationToken cancellationToken = default)
    {
        ExigerConfiguration();
        var geres = await ExigerGestionnaireAsync(utilisateurId, cancellationToken);
        var lignes = await feuille.LireAsync(
            FeuilleAgenda.Plage(configuration.Onglet, $"A{FeuilleAgenda.PremiereLigne}:O"),
            cancellationToken);
        var rapport = new Rapport();
        for (var index = 0; index < lignes.Count; index++)
        {
            var numero = index + FeuilleAgenda.PremiereLigne;
            try
            {
                await ImporterLigneAsync(new LigneLue(numero, lignes[index]), geres, utilisateurId, rapport, cancellationToken);
            }
            catch (DomainException exception)
            {
                contexte.ChangeTracker.Clear();
                rapport.Erreur(numero, exception.Message);
            }
        }

        journal.LogInformation(
            "Import du Sheet : {Demandes} demandes, {Indisponibilites} indisponibilités, {Erreurs} messages",
            rapport.Demandes,
            rapport.Indisponibilites,
            rapport.Messages.Count);
        return new RapportImportResponse(rapport.Demandes, rapport.Indisponibilites, rapport.Ignorees, rapport.Messages);
    }

    private async Task ImporterLigneAsync(
        LigneLue ligne,
        IReadOnlyList<DirigeantGere> geres,
        Guid utilisateurId,
        Rapport rapport,
        CancellationToken cancellationToken)
    {
        if (ligne.Texte(0).Length > 0 || ligne.EstVide)
        {
            return;
        }

        var statut = FeuilleAgenda.LireStatut(ligne.Cellule(14));
        if (statut is "annule" or "refuse" or "termine")
        {
            rapport.Ignorees++;
            return;
        }

        var (debut, fin) = LirePlage(ligne);
        if (debut <= DateTimeOffset.UtcNow)
        {
            rapport.Ignorees++;
            return;
        }

        var nature = FeuilleAgenda.LireNature(ligne.Cellule(6));
        if (nature == NatureLigne.Inconnue)
        {
            throw new DomainException($"Type « {ligne.Texte(6)} » inconnu.");
        }

        var dirigeant = TrouverDirigeant(geres, ligne.Texte(8), ligne.Texte(9));
        Guid identifiant;
        if (FeuilleAgenda.Indisponibilite(nature) is { } type)
        {
            identifiant = await CreerIndisponibiliteAsync(ligne, dirigeant, type, debut, fin, utilisateurId, cancellationToken);
            rapport.Indisponibilites++;
        }
        else
        {
            var demande = new DemandeLue(ligne, dirigeant, nature, statut, debut, fin);
            identifiant = await CreerDemandeAsync(demande, utilisateurId, rapport, cancellationToken);
            rapport.Demandes++;
        }

        await feuille.EcrireAsync(
            [new BlocCellules(FeuilleAgenda.Plage(configuration.Onglet, $"A{ligne.Numero}"), [[identifiant.ToString()]])],
            cancellationToken);
    }

    private async Task<Guid> CreerIndisponibiliteAsync(
        LigneLue ligne,
        DirigeantGere dirigeant,
        TypeIndisponibilite type,
        DateTimeOffset debut,
        DateTimeOffset fin,
        Guid utilisateurId,
        CancellationToken cancellationToken)
    {
        var motif = ligne.Texte(7).Length > 0 ? ligne.Texte(7) : LibellesIndisponibilite.Type(type);
        var indisponibilite = Indisponibilite.Creer(
            dirigeant.DirigeantId, dirigeant.SocieteId, type, motif, debut, fin, utilisateurId);
        await indisponibilites.AddAsync(indisponibilite, cancellationToken);
        await contexte.SaveChangesAsync(cancellationToken);
        return indisponibilite.Id;
    }

    private async Task<Guid> CreerDemandeAsync(
        DemandeLue lue,
        Guid utilisateurId,
        Rapport rapport,
        CancellationToken cancellationToken)
    {
        var ligne = lue.Ligne;
        var membres = await MembresAsync(lue.Dirigeant.SocieteId, cancellationToken);
        var demandeurId = Demandeur(ligne, lue.Dirigeant, membres, utilisateurId, rapport);
        var participants = Participants(ligne, lue.Dirigeant, membres, rapport);
        var type = lue.Nature == NatureLigne.Reunion ? TypeDemande.Reunion : TypeDemande.RendezVous;
        if (type == TypeDemande.Reunion && participants.Count == 0)
        {
            type = TypeDemande.RendezVous;
            rapport.Avertissement(ligne.Numero, "Réunion sans participant identifiable : importée comme rendez-vous.");
        }

        var duree = (int)(lue.Fin - lue.Debut).TotalMinutes;
        var demande = DemandeRencontre.Creer(new NouvelleDemande(
            demandeurId,
            lue.Dirigeant.DirigeantId,
            lue.Dirigeant.SocieteId,
            type,
            Motif(ligne, lue.Nature),
            lue.Debut,
            lue.Fin,
            duree,
            Urgence.Normal,
            FeuilleAgenda.LirePriorite(ligne.Cellule(13)),
            await SalleAsync(ligne.Texte(10), lue.Dirigeant.SocieteId, cancellationToken),
            participants));
        contexte.DemandesRencontre.Add(demande);
        if (lue.Statut == "confirme")
        {
            await ConfirmerAsync(demande, utilisateurId, ligne.Numero, rapport, cancellationToken);
        }

        await contexte.SaveChangesAsync(cancellationToken);
        return demande.Id;
    }

    private async Task ConfirmerAsync(
        DemandeRencontre demande,
        Guid utilisateurId,
        int numero,
        Rapport rapport,
        CancellationToken cancellationToken)
    {
        demande.Accepter(utilisateurId, CommentaireImport);
        try
        {
            await planification.AppliquerAsync(
                demande,
                new ChangerStatutDemandeRequest(StatutDemande.Planifiee, CommentaireImport, null, null, demande.DateDebutSouhaitee, null),
                utilisateurId,
                cancellationToken);
        }
        catch (ConflictException)
        {
            rapport.Avertissement(numero, "Conflit de calendrier : demande importée comme acceptée, à planifier.");
        }
    }

    private static Guid Demandeur(
        LigneLue ligne,
        DirigeantGere dirigeant,
        IReadOnlyList<Membre> membres,
        Guid utilisateurId,
        Rapport rapport)
    {
        var saisi = ligne.Texte(12);
        var trouve = saisi.Length == 0 ? null : TrouverMembre(membres, saisi.Contains('@') ? null : saisi, saisi.Contains('@') ? saisi : null);
        if (trouve is not null && trouve.Id != dirigeant.DirigeantId)
        {
            return trouve.Id;
        }

        if (utilisateurId == dirigeant.DirigeantId)
        {
            throw new DomainException("Demandeur introuvable : indiquez un collaborateur de la société.");
        }

        if (saisi.Length > 0)
        {
            rapport.Avertissement(ligne.Numero, $"Demandeur « {saisi} » introuvable : la demande est enregistrée à votre nom.");
        }

        return utilisateurId;
    }

    private static List<NouveauParticipant> Participants(
        LigneLue ligne,
        DirigeantGere dirigeant,
        IReadOnlyList<Membre> membres,
        Rapport rapport)
    {
        var resultat = new List<NouveauParticipant>();
        foreach (var lu in FeuilleAgenda.LireParticipants(ligne.Cellule(11)))
        {
            var membre = TrouverMembre(membres, lu.Nom, lu.Email);
            if (membre is not null)
            {
                if (membre.Id != dirigeant.DirigeantId && resultat.All(p => p.UtilisateurId != membre.Id))
                {
                    resultat.Add(new NouveauParticipant(membre.Id, null, null));
                }
            }
            else if (!string.IsNullOrWhiteSpace(lu.Email))
            {
                resultat.Add(new NouveauParticipant(null, lu.Nom ?? lu.Email, lu.Email));
            }
            else
            {
                rapport.Avertissement(ligne.Numero, $"Participant « {lu.Nom} » ignoré : e-mail manquant pour un externe.");
            }
        }

        return resultat;
    }

    private static string Motif(LigneLue ligne, NatureLigne nature)
    {
        var objet = ligne.Texte(7);
        var prefixe = nature switch
        {
            NatureLigne.Appel => "Appel",
            NatureLigne.Visio => "Visio",
            NatureLigne.Dejeuner => "Déjeuner",
            _ => null,
        };
        return prefixe is null ? objet : $"{prefixe} — {objet}";
    }

    private (DateTimeOffset Debut, DateTimeOffset Fin) LirePlage(LigneLue ligne)
    {
        var date = FeuilleAgenda.LireDate(ligne.Cellule(1))
            ?? throw new DomainException($"Date « {ligne.Texte(1)} » illisible.");
        var heureDebut = FeuilleAgenda.LireHeure(ligne.Cellule(3))
            ?? throw new DomainException($"Heure de début « {ligne.Texte(3)} » illisible.");
        var heureFin = FeuilleAgenda.LireHeure(ligne.Cellule(4))
            ?? throw new DomainException($"Heure de fin « {ligne.Texte(4)} » illisible.");
        var debut = Horodater(date.ToDateTime(heureDebut));
        var fin = Horodater(date.ToDateTime(heureFin));
        if (fin <= debut)
        {
            throw new DomainException("L'heure de fin doit être postérieure à l'heure de début.");
        }

        return (debut, fin);
    }

    private DateTimeOffset Horodater(DateTime local)
    {
        var fuseau = configuration.Fuseau();
        return new DateTimeOffset(local, fuseau.GetUtcOffset(local));
    }

    private static DirigeantGere TrouverDirigeant(IReadOnlyList<DirigeantGere> geres, string societe, string dirigeant)
    {
        var candidats = geres
            .Where(d => societe.Length == 0 || FeuilleAgenda.Normaliser(d.SocieteNom) == FeuilleAgenda.Normaliser(societe))
            .Where(d => dirigeant.Length == 0 || MemeNom(d.DirigeantNom, dirigeant))
            .ToList();
        return candidats.Count == 1
            ? candidats[0]
            : throw new DomainException(candidats.Count == 0
                ? $"Dirigeant « {dirigeant} » ou société « {societe} » introuvable parmi les agendas que vous gérez."
                : "Plusieurs dirigeants correspondent : précisez la société et le dirigeant.");
    }

    private static Membre? TrouverMembre(IReadOnlyList<Membre> membres, string? nom, string? email)
    {
        if (!string.IsNullOrWhiteSpace(email))
        {
            var parEmail = membres.FirstOrDefault(m => string.Equals(m.Email, email.Trim(), StringComparison.OrdinalIgnoreCase));
            if (parEmail is not null)
            {
                return parEmail;
            }
        }

        if (string.IsNullOrWhiteSpace(nom))
        {
            return null;
        }

        var correspondants = membres.Where(m => MemeNom(m.NomComplet, nom)).ToList();
        return correspondants.Count == 1 ? correspondants[0] : null;
    }

    private static bool MemeNom(string reference, string saisi)
    {
        static string Cle(string texte) =>
            string.Join(' ', FeuilleAgenda.Normaliser(texte).Split(' ').Order(StringComparer.Ordinal));
        return Cle(reference) == Cle(saisi);
    }

    private async Task<IReadOnlyList<Membre>> MembresAsync(Guid societeId, CancellationToken cancellationToken) =>
        await (
            from membre in contexte.UtilisateurSocietes
            join utilisateur in contexte.Utilisateurs on membre.UtilisateurId equals utilisateur.Id
            where membre.SocieteId == societeId
            select new Membre(utilisateur.Id, utilisateur.Prenom + " " + utilisateur.Nom, utilisateur.Email))
            .Distinct()
            .ToListAsync(cancellationToken);

    private async Task<Guid?> SalleAsync(string nom, Guid societeId, CancellationToken cancellationToken)
    {
        if (nom.Length == 0)
        {
            return null;
        }

        var salles = await contexte.Salles
            .Where(s => s.SocieteId == societeId && s.EstActive)
            .Select(s => new { s.Id, s.Nom })
            .ToListAsync(cancellationToken);
        return salles.FirstOrDefault(s => FeuilleAgenda.Normaliser(s.Nom) == FeuilleAgenda.Normaliser(nom))?.Id;
    }

    private async Task<IReadOnlyList<DirigeantGere>> ExigerGestionnaireAsync(Guid utilisateurId, CancellationToken cancellationToken)
    {
        var geres = await indisponibilites.ListerDirigeantsGeresAsync(utilisateurId, cancellationToken);
        return geres.Count > 0 ? geres : throw new ForbiddenException("Vous ne gérez l'agenda d'aucun dirigeant.");
    }

    private void ExigerConfiguration()
    {
        if (!configuration.EstConfigure)
        {
            throw new DomainException("La synchronisation Google Sheets n'est pas configurée sur le serveur.");
        }
    }

    private sealed record Membre(Guid Id, string NomComplet, string Email);

    private sealed record DemandeLue(
        LigneLue Ligne,
        DirigeantGere Dirigeant,
        NatureLigne Nature,
        string Statut,
        DateTimeOffset Debut,
        DateTimeOffset Fin);

    private sealed record LigneLue(int Numero, IList<object?> Valeurs)
    {
        public bool EstVide => Valeurs.All(v => FeuilleAgenda.Texte(v).Length == 0);

        public object? Cellule(int colonne) => FeuilleAgenda.Cellule(Valeurs, colonne);

        public string Texte(int colonne) => FeuilleAgenda.Texte(Cellule(colonne));
    }

    private sealed class Rapport
    {
        public int Demandes { get; set; }

        public int Indisponibilites { get; set; }

        public int Ignorees { get; set; }

        public List<MessageImport> Messages { get; } = [];

        public void Erreur(int ligne, string texte) => Messages.Add(new MessageImport(ligne, "Erreur", texte));

        public void Avertissement(int ligne, string texte) => Messages.Add(new MessageImport(ligne, "Avertissement", texte));
    }
}
