#:package BCrypt.Net-Next@4.2.0

// Usage (SDK .NET 10) : dotnet run deploiement/hash-mot-de-passe.cs -- "MotDePasse"
if (args.Length != 1 || string.IsNullOrWhiteSpace(args[0]))
{
    Console.Error.WriteLine("Usage : dotnet run deploiement/hash-mot-de-passe.cs -- \"MotDePasse\"");
    return 1;
}

Console.WriteLine(BCrypt.Net.BCrypt.HashPassword(args[0]));
return 0;
