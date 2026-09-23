using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class RefreshTokenRepository(ApplicationDbContext context) : IRefreshTokenRepository
{
    public Task AddAsync(RefreshToken token, CancellationToken cancellationToken = default)
    {
        context.RefreshTokens.Add(token);
        return Task.CompletedTask;
    }

    public Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken = default) =>
        context.RefreshTokens.AsTracking().FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

    public Task RevoquerTousAsync(
        Guid utilisateurId,
        DateTimeOffset maintenant,
        CancellationToken cancellationToken = default)
    {
        return context.RefreshTokens
            .Where(t => t.UtilisateurId == utilisateurId && t.RevoqueLe == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(t => t.RevoqueLe, maintenant), cancellationToken);
    }
}
