using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Interfaces;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken token, CancellationToken cancellationToken = default);

    Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken = default);

    Task RevoquerTousAsync(Guid utilisateurId, DateTimeOffset maintenant, CancellationToken cancellationToken = default);
}
