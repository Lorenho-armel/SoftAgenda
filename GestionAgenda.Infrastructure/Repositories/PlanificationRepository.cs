using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class PlanificationRepository(ApplicationDbContext context) : IPlanificationRepository
{
    public Task<Salle?> GetSalleAsync(Guid salleId, CancellationToken cancellationToken = default) =>
        context.Salles.FirstOrDefaultAsync(s => s.Id == salleId, cancellationToken);

    public async Task<bool> DirigeantLibreAsync(
        Guid dirigeantId,
        DateTimeOffset debut,
        DateTimeOffset fin,
        CancellationToken cancellationToken = default)
    {
        var rendezVousOccupe = await context.RendezVous.AnyAsync(
            r => r.DirigeantId == dirigeantId && r.Statut != StatutOccurrence.Annule && r.Debut < fin && r.Fin > debut,
            cancellationToken);
        if (rendezVousOccupe)
        {
            return false;
        }

        return !await context.Reunions.AnyAsync(
            r => r.DirigeantId == dirigeantId && r.Statut != StatutOccurrence.Annule && r.Debut < fin && r.Fin > debut,
            cancellationToken);
    }

    public async Task<bool> SalleLibreAsync(
        Guid salleId,
        DateTimeOffset debut,
        DateTimeOffset fin,
        CancellationToken cancellationToken = default)
    {
        var rendezVousOccupe = await context.RendezVous.AnyAsync(
            r => r.SalleId == salleId && r.Statut != StatutOccurrence.Annule && r.Debut < fin && r.Fin > debut,
            cancellationToken);
        if (rendezVousOccupe)
        {
            return false;
        }

        return !await context.Reunions.AnyAsync(
            r => r.SalleId == salleId && r.Statut != StatutOccurrence.Annule && r.Debut < fin && r.Fin > debut,
            cancellationToken);
    }
}
