using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Demandes;

namespace GestionAgenda.Infrastructure.Services;

internal static class PreparationDemande
{
    public static NouvelleDemande VersNouvelle(CreerDemandeRencontreRequest request, Guid auteurId) =>
        new(
            auteurId,
            request.DirigeantId,
            request.SocieteId,
            request.Type,
            request.Motif,
            request.DateDebutSouhaitee,
            request.DateFinSouhaitee,
            request.DureeMinutes,
            request.Urgence,
            request.Priorite,
            request.SalleSouhaiteeId,
            VersParticipants(request.Participants));

    public static MiseAJourDemande VersMiseAJour(MettreAJourDemandeRencontreRequest request) =>
        new(
            request.Type,
            request.Motif,
            request.DateDebutSouhaitee,
            request.DateFinSouhaitee,
            request.DureeMinutes,
            request.SalleSouhaiteeId,
            VersParticipants(request.Participants));

    public static DemandeRencontreFiltre VersFiltre(DemandeRencontreQuery query) =>
        new(
            query.Page,
            query.Size,
            query.Search,
            query.SortBy,
            query.SortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase),
            query.Statut,
            query.Urgence,
            query.Priorite,
            query.Type,
            query.SocieteId,
            query.DateDebut,
            query.DateFin);

    private static IReadOnlyList<NouveauParticipant> VersParticipants(IReadOnlyList<ParticipantRequest>? participants) =>
        (participants ?? []).Select(p => new NouveauParticipant(p.UtilisateurId, p.NomComplet, p.Email)).ToList();
}
