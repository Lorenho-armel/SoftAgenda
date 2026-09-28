using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Infrastructure.Context;
using GestionAgenda.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class SynchronisationFeuille(
    ApplicationDbContext contexte,
    IClientFeuille feuille,
    IOptions<GoogleSheetsOptions> options,
    ILogger<SynchronisationFeuille> journal)
{
    private static readonly SemaphoreSlim Verrou = new(1, 1);
    private readonly GoogleSheetsOptions configuration = options.Value;

    public async Task SynchroniserDemandeAsync(Guid demandeId)
    {
        var element = await ElementDemandeAsync(demandeId);
        if (element is not null)
        {
            await EcrireAsync(element);
        }
    }

    public async Task SynchroniserIndisponibiliteAsync(Guid indisponibiliteId)
    {
        var indisponibilite = await contexte.Indisponibilites.FirstOrDefaultAsync(i => i.Id == indisponibiliteId);
        if (indisponibilite is not null)
        {
            await EcrireAsync(await ElementIndisponibiliteAsync(indisponibilite));
        }
    }

    public async Task MarquerIndisponibiliteSupprimeeAsync(Guid indisponibiliteId)
    {
        if (!configuration.EstConfigure)
        {
            return;
        }

        await Verrou.WaitAsync();
        try
        {
            var ligne = FeuilleAgenda.LigneDe(await LireIdentifiantsAsync(), indisponibiliteId);
            if (ligne is not null)
            {
                await feuille.EcrireAsync([
                    new BlocCellules(FeuilleAgenda.Plage(configuration.Onglet, $"O{ligne}"), [["Annulé"]]),
                ]);
            }
        }
        finally
        {
            Verrou.Release();
        }
    }

    public async Task ResynchroniserToutAsync()
    {
        var depuis = DateTimeOffset.UtcNow.AddDays(-30);
        var demandes = await contexte.DemandesRencontre
            .Where(d => d.DateFinSouhaitee >= depuis)
            .OrderBy(d => d.DateDebutSouhaitee)
            .Select(d => d.Id)
            .ToListAsync();
        foreach (var id in demandes)
        {
            await SynchroniserDemandeAsync(id);
        }

        var indisponibilites = await contexte.Indisponibilites
            .Where(i => i.Fin >= depuis)
            .OrderBy(i => i.Debut)
            .ToListAsync();
        foreach (var indisponibilite in indisponibilites)
        {
            await EcrireAsync(await ElementIndisponibiliteAsync(indisponibilite));
        }

        journal.LogInformation(
            "Resynchronisation du Sheet : {Demandes} demandes, {Indisponibilites} indisponibilités",
            demandes.Count,
            indisponibilites.Count);
    }

    private async Task EcrireAsync(ElementAgenda element)
    {
        if (!configuration.EstConfigure)
        {
            return;
        }

        await Verrou.WaitAsync();
        try
        {
            var identifiants = await LireIdentifiantsAsync();
            var existante = FeuilleAgenda.LigneDe(identifiants, element.Id);
            var ligne = existante ?? FeuilleAgenda.PremiereLigneLibre(identifiants);
            await feuille.EcrireAsync(FeuilleAgenda.Blocs(configuration.Onglet, ligne, element, existante is null));
        }
        finally
        {
            Verrou.Release();
        }
    }

    private Task<IList<IList<object?>>> LireIdentifiantsAsync() =>
        feuille.LireAsync(FeuilleAgenda.Plage(configuration.Onglet, $"A{FeuilleAgenda.PremiereLigne}:B"));

    private async Task<ElementAgenda?> ElementDemandeAsync(Guid demandeId)
    {
        var demande = await contexte.DemandesRencontre
            .Include(d => d.Participants)
            .Include(d => d.Demandeur)
            .Include(d => d.Dirigeant)
            .Include(d => d.Societe)
            .Include(d => d.RendezVous)
            .Include(d => d.Reunion)
            .AsSplitQuery()
            .FirstOrDefaultAsync(d => d.Id == demandeId);
        if (demande is null)
        {
            return null;
        }

        var (debut, fin, salleId) = Creneau(demande);
        return new ElementAgenda(
            demande.Id,
            Local(debut),
            Local(fin),
            FeuilleAgenda.TypeDemande(demande.Type),
            demande.Motif,
            demande.Societe?.Nom ?? string.Empty,
            NomComplet(demande.Dirigeant),
            await NomSalleAsync(salleId),
            await ParticipantsAsync(demande),
            NomComplet(demande.Demandeur),
            FeuilleAgenda.Priorite(demande.Priorite),
            FeuilleAgenda.Statut(demande.Statut));
    }

    private async Task<ElementAgenda> ElementIndisponibiliteAsync(Indisponibilite indisponibilite)
    {
        var personnes = await contexte.Utilisateurs
            .Where(u => u.Id == indisponibilite.DirigeantId || u.Id == indisponibilite.AuteurId)
            .ToDictionaryAsync(u => u.Id);
        var societe = await contexte.Societes
            .Where(s => s.Id == indisponibilite.SocieteId)
            .Select(s => s.Nom)
            .FirstOrDefaultAsync();
        return new ElementAgenda(
            indisponibilite.Id,
            Local(indisponibilite.Debut),
            Local(indisponibilite.Fin),
            LibellesIndisponibilite.Type(indisponibilite.Type),
            indisponibilite.Motif,
            societe ?? string.Empty,
            NomComplet(personnes.GetValueOrDefault(indisponibilite.DirigeantId)),
            null,
            string.Empty,
            NomComplet(personnes.GetValueOrDefault(indisponibilite.AuteurId)),
            string.Empty,
            "Confirmé");
    }

    private static (DateTimeOffset Debut, DateTimeOffset Fin, Guid? SalleId) Creneau(DemandeRencontre demande)
    {
        if (demande.RendezVous is { } rendezVous && rendezVous.Statut != StatutOccurrence.Annule)
        {
            return (rendezVous.Debut, rendezVous.Fin, rendezVous.SalleId);
        }

        if (demande.Reunion is { } reunion && reunion.Statut != StatutOccurrence.Annule)
        {
            return (reunion.Debut, reunion.Fin, reunion.SalleId);
        }

        return (demande.DateDebutSouhaitee, demande.DateFinSouhaitee, demande.SalleSouhaiteeId);
    }

    private async Task<string> ParticipantsAsync(DemandeRencontre demande)
    {
        var identifiants = demande.Participants
            .Where(p => p.UtilisateurId.HasValue)
            .Select(p => p.UtilisateurId!.Value)
            .ToList();
        var internes = await contexte.Utilisateurs
            .Where(u => identifiants.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id);
        return FeuilleAgenda.EcrireParticipants(demande.Participants.Select(p =>
            p.UtilisateurId is { } id && internes.TryGetValue(id, out var utilisateur)
                ? new ParticipantLu(NomComplet(utilisateur), null)
                : new ParticipantLu(p.NomComplet, p.Email)));
    }

    private async Task<string?> NomSalleAsync(Guid? salleId) =>
        salleId is null
            ? null
            : await contexte.Salles.Where(s => s.Id == salleId).Select(s => s.Nom).FirstOrDefaultAsync();

    private DateTime Local(DateTimeOffset date) => TimeZoneInfo.ConvertTime(date, configuration.Fuseau()).DateTime;

    private static string NomComplet(Utilisateur? utilisateur) =>
        utilisateur is null ? string.Empty : $"{utilisateur.Prenom} {utilisateur.Nom}".Trim();
}
