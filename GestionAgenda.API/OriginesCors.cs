namespace GestionAgenda.API;

public static class OriginesCors
{
    public static string[] Lire(IConfiguration configuration)
    {
        var tableau = configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
        var origines = tableau.Where(origine => !string.IsNullOrWhiteSpace(origine)).ToArray();
        if (origines.Length > 0)
        {
            return origines;
        }

        var brut = configuration["Cors:Origins"];
        if (string.IsNullOrWhiteSpace(brut))
        {
            return [];
        }

        return brut.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}
