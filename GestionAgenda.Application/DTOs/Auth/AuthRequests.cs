namespace GestionAgenda.Application.DTOs.Auth;

public record LoginRequest(string Email, string MotDePasse);

public record RefreshTokenRequest(string RefreshToken);

public record LoginResponse(
    string AccessToken,
    DateTimeOffset AccessTokenExpireLe,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpireLe);
