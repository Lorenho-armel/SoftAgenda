using System.Net;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace GestionAgenda.Tests;

[CollectionDefinition("HoteApi", DisableParallelization = true)]
public sealed class HoteApiCollection;

[Collection("HoteApi")]
public sealed class ApiAuthentificationTests : IClassFixture<ApiAuthentificationTests.Fabrique>
{
    private readonly HttpClient client;

    public ApiAuthentificationTests(Fabrique fabrique)
    {
        client = fabrique.Client;
    }

    [Fact]
    public async Task Demande_sans_jeton_repond_401()
    {
        var reponse = await client.GetAsync("/api/demandes-rencontre");

        reponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Jeton_invalide_repond_401()
    {
        var requete = new HttpRequestMessage(HttpMethod.Get, "/api/demandes-rencontre");
        requete.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "pas-un-jeton");

        var reponse = await client.SendAsync(requete);

        reponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    public sealed class Fabrique : WebApplicationFactory<Program>
    {
        public Fabrique()
        {
            HoteApiEnvironnement.Definir(secret: "TESTING_ONLY_GestionAgenda_Secret_32chars");
            Client = CreateClient();
        }

        public HttpClient Client { get; }
    }
}

[Collection("HoteApi")]
public sealed class DemarrageSansSecretTests
{
    [Fact]
    public void Demarrage_sans_secret_jwt_echoue()
    {
        HoteApiEnvironnement.Definir(secret: "court");
        using var fabrique = new WebApplicationFactory<Program>();

        var act = () => fabrique.CreateClient();

        act.Should().Throw<InvalidOperationException>().WithMessage("*Jwt:Secret*");
    }
}

internal static class HoteApiEnvironnement
{
    internal static void Definir(string secret)
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
        Environment.SetEnvironmentVariable("Jwt__Secret", secret);
        Environment.SetEnvironmentVariable(
            "ConnectionStrings__DefaultConnection",
            "Server=localhost\\SQLEXPRESS;Database=GestionAgenda_Integration;Trusted_Connection=True;TrustServerCertificate=True");
        Environment.SetEnvironmentVariable("Hangfire__Actif", "false");
        Environment.SetEnvironmentVariable("Seed__Enabled", "false");
    }
}
