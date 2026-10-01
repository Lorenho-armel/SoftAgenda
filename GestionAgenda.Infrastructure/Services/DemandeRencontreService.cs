using AutoMapper;
using FluentValidation;
using GestionAgenda.Application.Common;
using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace GestionAgenda.Infrastructure.Services;

public sealed class DemandeRencontreService(
    IDemandeRencontreRepository demandes,
    IAccesAgendaRepository acces,
    IPlanificationRepository planification,
    IUtilisateurRepository utilisateurs,
    PlanificationDemande planificationDemande,
    IUnitOfWork unitOfWork,
    IValidator<CreerDemandeRencontreRequest> creerValidator,
    IValidator<MettreAJourDemandeRencontreRequest> majValidator,
    IValidator<ChangerStatutDemandeRequest> statutValidator,
    IValidator<ChangerPrioriteDemandeRequest> prioriteValidator,
    IValidator<ChangerUrgenceDemandeRequest> urgenceValidator,
    IValidator<DemandeRencontreQuery> queryValidator,
    IValidator<VerifierCreneauRequest> creneauValidator,
    IMapper mapper,
    INotificationsDemande notifications,
    ISynchronisationAgenda synchronisation,
    ILogger<DemandeRencontreService> logger) : IDemandeRencontreService
{
    private readonly EvaluationAccesDemande evaluationAcces = new(acces);

    public async Task<DemandeRencontreResponse> CreateAsync(
        CreerDemandeRencontreRequest request,
        Guid auteurId,
        CancellationToken cancellationToken = default)
    {
        await creerValidator.ValiderAsync(request, cancellationToken);
        await GarantirCreationAsync(request, auteurId, cancellationToken);
        var demande = DemandeRencontre.Creer(PreparationDemande.VersNouvelle(request, auteurId));
        await demandes.AddAsync(demande, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Demande {DemandeId} créée pour le dirigeant {DirigeantId}", demande.Id, demande.DirigeantId);
        await notifications.DemandeCreeeAsync(demande.Id, cancellationToken);
        return mapper.Map<DemandeRencontreResponse>(demande);
    }

    public async Task<PaginatedResult<DemandeRencontreResumeResponse>> GetAllAsync(
        DemandeRencontreQuery query,
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        await queryValidator.ValiderAsync(query, cancellationToken);
        var page = await demandes.RechercherVisiblesAsync(utilisateurId, PreparationDemande.VersFiltre(query), cancellationToken);
        var totalPages = query.Size == 0 ? 0 : (int)Math.Ceiling(page.TotalCount / (double)query.Size);
        return new PaginatedResult<DemandeRencontreResumeResponse>(
            mapper.Map<List<DemandeRencontreResumeResponse>>(page.Items),
            page.TotalCount,
            query.Page,
            query.Size,
            totalPages);
    }

    public async Task<FileDemandesResponse> GetFileAsync(
        DemandeRencontreQuery query,
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        await queryValidator.ValiderAsync(query, cancellationToken);
        var filtre = PreparationDemande.VersFiltre(query);
        var resultat = await demandes.ObtenirFileAsync(utilisateurId, filtre, cancellationToken);
        return LectureFileDemandes.VersResponse(resultat, query, mapper);
    }

    public async Task<DemandeRencontreResponse> GetByIdAsync(
        Guid id,
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        var demande = await ChargerAsync(id, suivi: false, cancellationToken);
        var droit = await evaluationAcces.EvaluerAsync(demande, utilisateurId, cancellationToken);
        if (!droit.PeutVoir)
        {
            throw new NotFoundException("Demande introuvable.");
        }

        return await DetailAsync(demande, droit.EstGestionnaire, cancellationToken);
    }

    public async Task<BilanPlanificationResponse> VerifierCreneauAsync(
        Guid id,
        VerifierCreneauRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        await creneauValidator.ValiderAsync(request, cancellationToken);
        var demande = await ChargerAsync(id, suivi: false, cancellationToken);
        await evaluationAcces.ExigerGestionnaireAsync(demande, utilisateurId, cancellationToken);
        var bilan = await planificationDemande.EvaluerAsync(
            demande, request.DebutPlanifie, request.SalleId, cancellationToken);
        return mapper.Map<BilanPlanificationResponse>(bilan);
    }

    public async Task<DemandeRencontreResponse> ReplanifierAsync(
        Guid id,
        VerifierCreneauRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        await creneauValidator.ValiderAsync(request, cancellationToken);
        var demande = await ChargerAsync(id, suivi: true, cancellationToken);
        await evaluationAcces.ExigerGestionnaireAsync(demande, utilisateurId, cancellationToken);
        await planificationDemande.DeplacerAsync(
            demande, request.DebutPlanifie, request.SalleId, utilisateurId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await notifications.RendezVousModifieAsync(demande.Id, cancellationToken);
        return mapper.Map<DemandeRencontreResponse>(demande);
    }

    public async Task<DemandeRencontreResponse> UpdateAsync(
        Guid id,
        MettreAJourDemandeRencontreRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        await majValidator.ValiderAsync(request, cancellationToken);
        var demande = await ChargerAsync(id, suivi: true, cancellationToken);
        var droit = await evaluationAcces.EvaluerAsync(demande, utilisateurId, cancellationToken);
        if (!droit.PeutVoir)
        {
            throw new NotFoundException("Demande introuvable.");
        }

        var demandeurAutorise = droit.EstDemandeur && demande.Statut == StatutDemande.EnAttente;
        var gestionnaireAutorise = droit.EstGestionnaire
            && TransitionsDemande.AutoriseModificationSouhaits(demande.Statut);
        if (!demandeurAutorise && !gestionnaireAutorise)
        {
            throw new ForbiddenException("Vous ne pouvez pas modifier cette demande.");
        }

        await VerifierSalleSouhaiteeAsync(request.SalleSouhaiteeId, demande.SocieteId, cancellationToken);
        await VerifierParticipantsAsync(request.Participants, demande.SocieteId, cancellationToken);
        demande.MettreAJour(PreparationDemande.VersMiseAJour(request));
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await notifications.RendezVousModifieAsync(demande.Id, cancellationToken);
        return mapper.Map<DemandeRencontreResponse>(demande);
    }

    public async Task<DemandeRencontreResponse> ChangerStatutAsync(
        Guid id,
        ChangerStatutDemandeRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        await statutValidator.ValiderAsync(request, cancellationToken);
        var demande = await ChargerAsync(id, suivi: true, cancellationToken);
        await evaluationAcces.AutoriserTransitionAsync(demande, request, utilisateurId, cancellationToken);
        if (request.Statut == demande.Statut)
        {
            return mapper.Map<DemandeRencontreResponse>(demande);
        }

        await AppliquerStatutAsync(demande, request, utilisateurId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Demande {DemandeId} passée au statut {Statut} par {AuteurId}", demande.Id, demande.Statut, utilisateurId);
        await notifications.StatutModifieAsync(demande.Id, cancellationToken);
        return mapper.Map<DemandeRencontreResponse>(demande);
    }

    public Task<DemandeRencontreResponse> ChangerPrioriteAsync(
        Guid id,
        ChangerPrioriteDemandeRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default) =>
        ChangerQualificationAsync(
            id,
            utilisateurId,
            new Qualification<ChangerPrioriteDemandeRequest>(
                prioriteValidator,
                request,
                (demande, auteur) => demande.ChangerPriorite(request.Priorite, auteur, request.Commentaire)),
            cancellationToken);

    public Task<DemandeRencontreResponse> ChangerUrgenceAsync(
        Guid id,
        ChangerUrgenceDemandeRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken = default) =>
        ChangerQualificationAsync(
            id,
            utilisateurId,
            new Qualification<ChangerUrgenceDemandeRequest>(
                urgenceValidator,
                request,
                (demande, auteur) => demande.ChangerUrgence(request.Urgence, auteur, request.Commentaire)),
            cancellationToken);

    private async Task<DemandeRencontreResponse> ChangerQualificationAsync<T>(
        Guid id,
        Guid utilisateurId,
        Qualification<T> qualification,
        CancellationToken cancellationToken)
    {
        await qualification.Validator.ValiderAsync(qualification.Request, cancellationToken);
        var demande = await ChargerAsync(id, suivi: true, cancellationToken);
        await evaluationAcces.ExigerGestionnaireAsync(demande, utilisateurId, cancellationToken);
        qualification.Appliquer(demande, utilisateurId);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        synchronisation.DemandeModifiee(demande.Id);
        return mapper.Map<DemandeRencontreResponse>(demande);
    }

    private readonly record struct Qualification<T>(
        IValidator<T> Validator,
        T Request,
        Action<DemandeRencontre, Guid> Appliquer);

    private async Task AppliquerStatutAsync(
        DemandeRencontre demande,
        ChangerStatutDemandeRequest request,
        Guid utilisateurId,
        CancellationToken cancellationToken)
    {
        switch (request.Statut)
        {
            case StatutDemande.EnAnalyse:
                demande.PrendreEnAnalyse(utilisateurId, request.Commentaire);
                break;
            case StatutDemande.Acceptee:
                demande.Accepter(utilisateurId, request.Commentaire);
                break;
            case StatutDemande.Refusee:
                demande.Refuser(utilisateurId, request.Commentaire ?? string.Empty);
                break;
            case StatutDemande.Reportee:
                demande.Reporter(new ReportDemande(
                    utilisateurId,
                    request.Commentaire ?? string.Empty,
                    request.DateDebutSouhaitee!.Value,
                    request.DateFinSouhaitee!.Value));
                break;
            case StatutDemande.Planifiee:
                await planificationDemande.AppliquerAsync(demande, request, utilisateurId, cancellationToken);
                break;
            case StatutDemande.Terminee:
                demande.Cloturer(utilisateurId, request.Commentaire);
                break;
            case StatutDemande.Annulee:
                demande.Annuler(utilisateurId, request.Commentaire ?? string.Empty);
                break;
            default:
                throw new DomainException("La transition de statut est interdite.");
        }
    }

    private async Task GarantirCreationAsync(
        CreerDemandeRencontreRequest request,
        Guid auteurId,
        CancellationToken cancellationToken)
    {
        if (!await acces.EstMembreAsync(auteurId, request.SocieteId, cancellationToken))
        {
            throw new ForbiddenException("Vous n'appartenez pas à cette société.");
        }

        if (!await acces.EstDirigeantAsync(request.DirigeantId, request.SocieteId, cancellationToken))
        {
            throw new DomainException("Le dirigeant indiqué n'exerce pas dans cette société.");
        }

        await VerifierSalleSouhaiteeAsync(request.SalleSouhaiteeId, request.SocieteId, cancellationToken);
        await VerifierParticipantsAsync(request.Participants, request.SocieteId, cancellationToken);
    }

    private async Task VerifierSalleSouhaiteeAsync(
        Guid? salleId,
        Guid societeId,
        CancellationToken cancellationToken)
    {
        if (salleId is null || salleId == Guid.Empty)
        {
            return;
        }

        var salle = await planification.GetSalleAsync(salleId.Value, cancellationToken);
        if (salle is null || !salle.EstActive || salle.SocieteId != societeId)
        {
            throw new DomainException("La salle souhaitée est introuvable, inactive ou hors société.");
        }
    }

    private async Task VerifierParticipantsAsync(
        IReadOnlyList<ParticipantRequest>? participants,
        Guid societeId,
        CancellationToken cancellationToken)
    {
        var identifiants = (participants ?? [])
            .Where(p => p.UtilisateurId.HasValue && p.UtilisateurId != Guid.Empty)
            .Select(p => p.UtilisateurId!.Value)
            .ToList();
        if (!await acces.SontMembresAsync(identifiants, societeId, cancellationToken))
        {
            throw new DomainException("Un participant n'appartient pas à la société.");
        }
    }

    private async Task<DemandeRencontreResponse> DetailAsync(
        DemandeRencontre demande,
        bool estGestionnaire,
        CancellationToken cancellationToken)
    {
        var reponse = mapper.Map<DemandeRencontreResponse>(demande);
        var identifiants = reponse.Participants
            .Where(p => p.UtilisateurId.HasValue)
            .Select(p => p.UtilisateurId!.Value)
            .Concat(reponse.Historique.Select(h => h.AuteurId))
            .Append(demande.DirigeantId)
            .Distinct()
            .ToList();
        var noms = (await utilisateurs.GetByIdsAsync(identifiants, cancellationToken))
            .ToDictionary(u => u.Id, u => $"{u.Prenom} {u.Nom}".Trim());
        string Nom(Guid id) => noms.GetValueOrDefault(id, string.Empty);

        return reponse with
        {
            EstGestionnaire = estGestionnaire,
            DirigeantNom = Nom(demande.DirigeantId),
            Participants = reponse.Participants
                .Select(p => p.UtilisateurId is { } id && string.IsNullOrWhiteSpace(p.NomComplet) ? p with { NomComplet = Nom(id) } : p)
                .ToList(),
            Historique = reponse.Historique.Select(h => h with { AuteurNom = Nom(h.AuteurId) }).ToList(),
            Rencontre = await RencontreAsync(demande, cancellationToken),
        };
    }

    private async Task<RencontreResponse?> RencontreAsync(DemandeRencontre demande, CancellationToken cancellationToken)
    {
        RencontreResponse? rencontre = demande switch
        {
            { RendezVous: { } r } => new(TypeDemande.RendezVous, r.Debut, r.Fin, r.SalleId, null, r.Statut),
            { Reunion: { } r } => new(TypeDemande.Reunion, r.Debut, r.Fin, r.SalleId, null, r.Statut),
            _ => null,
        };
        if (rencontre?.SalleId is not { } salleId)
        {
            return rencontre;
        }

        var salle = await planification.GetSalleAsync(salleId, cancellationToken);
        return rencontre with { SalleNom = salle?.Nom };
    }

    private async Task<DemandeRencontre> ChargerAsync(Guid id, bool suivi, CancellationToken cancellationToken) =>
        await demandes.GetByIdAsync(id, suivi, cancellationToken)
        ?? throw new NotFoundException("Demande introuvable.");
}
