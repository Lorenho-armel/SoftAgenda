using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class AccesAgendaRepository(ApplicationDbContext context) : IAccesAgendaRepository
{
    public Task<bool> EstMembreAsync(
        Guid utilisateurId,
        Guid societeId,
        CancellationToken cancellationToken = default) =>
        context.UtilisateurSocietes.AnyAsync(
            u => u.UtilisateurId == utilisateurId && u.SocieteId == societeId,
            cancellationToken);

    public Task<bool> EstDirigeantAsync(
        Guid utilisateurId,
        Guid societeId,
        CancellationToken cancellationToken = default) =>
        context.UtilisateurSocietes.AnyAsync(
            u => u.UtilisateurId == utilisateurId && u.SocieteId == societeId && u.Role == RoleSociete.Dirigeant,
            cancellationToken);

    public Task<bool> EstAssistanteActiveAsync(
        Guid assistanteId,
        Guid dirigeantId,
        Guid societeId,
        CancellationToken cancellationToken = default) =>
        context.AffectationAssistantes.AnyAsync(
            a => a.EstActive && a.AssistanteId == assistanteId && a.DirigeantId == dirigeantId && a.SocieteId == societeId,
            cancellationToken);

    public Task<bool> AAssistanteActiveAsync(
        Guid dirigeantId,
        Guid societeId,
        CancellationToken cancellationToken = default) =>
        context.AffectationAssistantes.AnyAsync(
            a => a.EstActive && a.DirigeantId == dirigeantId && a.SocieteId == societeId,
            cancellationToken);

    public async Task<bool> SontMembresAsync(
        IReadOnlyCollection<Guid> utilisateurIds,
        Guid societeId,
        CancellationToken cancellationToken = default)
    {
        var distincts = utilisateurIds.Distinct().ToList();
        if (distincts.Count == 0)
        {
            return true;
        }

        var trouves = await context.UtilisateurSocietes
            .Where(u => u.SocieteId == societeId && distincts.Contains(u.UtilisateurId))
            .Select(u => u.UtilisateurId)
            .Distinct()
            .CountAsync(cancellationToken);
        return trouves == distincts.Count;
    }

    public async Task<IReadOnlyList<Guid>> ListerAssistantesActivesAsync(
        Guid dirigeantId,
        Guid societeId,
        CancellationToken cancellationToken = default)
    {
        var identifiants = await context.AffectationAssistantes
            .Where(a => a.EstActive && a.DirigeantId == dirigeantId && a.SocieteId == societeId)
            .Select(a => a.AssistanteId)
            .Distinct()
            .ToListAsync(cancellationToken);
        return identifiants;
    }
}
