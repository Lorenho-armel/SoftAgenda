namespace GestionAgenda.Infrastructure.Options;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "GestionAgenda";

    public string Audience { get; set; } = "GestionAgenda";

    public string Secret { get; set; } = string.Empty;

    public int AccessTokenMinutes { get; set; } = 20;

    public int RefreshTokenDays { get; set; } = 7;
}
