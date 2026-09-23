using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FluentValidation;
using GestionAgenda.Application.Common;
using GestionAgenda.Application.DTOs.Auth;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GestionAgenda.Infrastructure.Services;

public sealed class AuthService(
    IUtilisateurRepository utilisateurs,
    IRefreshTokenRepository refreshTokens,
    IUnitOfWork unitOfWork,
    IValidator<LoginRequest> loginValidator,
    IValidator<RefreshTokenRequest> refreshValidator,
    IOptions<JwtOptions> options) : IAuthService
{
    private static readonly string EmpreinteFactice = BCrypt.Net.BCrypt.HashPassword("mot-de-passe-factice");
    private readonly JwtOptions _options = options.Value;

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        await loginValidator.ValiderAsync(request, cancellationToken);
        var email = request.Email.Trim().ToLowerInvariant();
        var utilisateur = await utilisateurs.GetByEmailAsync(email, cancellationToken);
        var hash = utilisateur?.MotDePasseHash ?? EmpreinteFactice;
        var motDePasseValide = BCrypt.Net.BCrypt.Verify(request.MotDePasse, hash);
        if (utilisateur is null || !motDePasseValide)
        {
            throw new UnauthorizedException("Identifiants invalides.");
        }

        var roles = await utilisateurs.GetRolesAsync(utilisateur.Id, cancellationToken);
        if (roles.Count == 0)
        {
            throw new ForbiddenException("Aucun rôle ne vous est affecté.");
        }

        return await EmettreAsync(utilisateur, roles, cancellationToken);
    }

    public async Task<LoginResponse> RefreshAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        await refreshValidator.ValiderAsync(request, cancellationToken);
        var empreinte = Empreinte(request.RefreshToken);
        var jeton = await refreshTokens.GetByHashAsync(empreinte, cancellationToken);
        if (jeton is null || !jeton.EstActif(DateTimeOffset.UtcNow))
        {
            if (jeton is { RevoqueLe: not null })
            {
                await refreshTokens.RevoquerTousAsync(jeton.UtilisateurId, DateTimeOffset.UtcNow, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }

            throw new UnauthorizedException("Session expirée ou jeton invalide.");
        }

        var utilisateur = await utilisateurs.GetByIdAsync(jeton.UtilisateurId, cancellationToken)
            ?? throw new UnauthorizedException("Session expirée ou jeton invalide.");
        var roles = await utilisateurs.GetRolesAsync(utilisateur.Id, cancellationToken);
        var reponse = await EmettreAsync(utilisateur, roles, cancellationToken, jeton);
        return reponse;
    }

    private async Task<LoginResponse> EmettreAsync(
        Utilisateur utilisateur,
        IReadOnlyList<Domain.Enums.RoleSociete> roles,
        CancellationToken cancellationToken,
        RefreshToken? precedent = null)
    {
        GarantirSecret();
        var maintenant = DateTimeOffset.UtcNow;
        var accessExpire = maintenant.AddMinutes(_options.AccessTokenMinutes);
        var refreshClair = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var refreshHash = Empreinte(refreshClair);
        var refreshExpire = maintenant.AddDays(_options.RefreshTokenDays);
        precedent?.Revoquer(maintenant, refreshHash);
        await refreshTokens.AddAsync(RefreshToken.Creer(utilisateur.Id, refreshHash, refreshExpire), cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return new LoginResponse(CreerAccessToken(utilisateur, roles, accessExpire), accessExpire, refreshClair, refreshExpire);
    }

    private string CreerAccessToken(
        Utilisateur utilisateur,
        IReadOnlyList<Domain.Enums.RoleSociete> roles,
        DateTimeOffset expireLe)
    {
        var claims = new List<Claim>
        {
            new("sub", utilisateur.Id.ToString()),
            new("email", utilisateur.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.CreateVersion7().ToString()),
        };
        claims.AddRange(roles.Distinct().Select(role => new Claim("role", role.ToString())));
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var token = new JwtSecurityToken(
            _options.Issuer,
            _options.Audience,
            claims,
            DateTime.UtcNow,
            expireLe.UtcDateTime,
            new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private void GarantirSecret()
    {
        if (string.IsNullOrWhiteSpace(_options.Secret) || _options.Secret.Length < 32)
        {
            throw new InvalidOperationException("Jwt:Secret doit contenir au moins 32 caractères.");
        }
    }

    private static string Empreinte(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
