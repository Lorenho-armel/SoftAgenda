using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using Google.Apis.Http;

namespace GestionAgenda.Infrastructure.Synchronisation;

/// <summary>
/// Ajoute, pour les seuls appels Google, une autorité racine supplémentaire (celle d'un pare-feu qui inspecte le SSL).
/// La validation reste complète : nom d'hôte, dates et chaîne jusqu'à cette racine précise.
/// </summary>
public sealed class FabriqueHttpGoogle(string cheminCertificat) : HttpClientFactory
{
    private readonly X509Certificate2? racine = string.IsNullOrWhiteSpace(cheminCertificat)
        ? null
        : X509CertificateLoader.LoadCertificateFromFile(cheminCertificat);

    protected override HttpMessageHandler CreateHandler(CreateHttpClientArgs args)
    {
        var handler = new HttpClientHandler
        {
            AutomaticDecompression = args.GZipEnabled ? DecompressionMethods.GZip | DecompressionMethods.Deflate : DecompressionMethods.None,
        };
        if (racine is not null)
        {
            handler.ServerCertificateCustomValidationCallback = (_, certificat, _, erreurs) => Valider(certificat, erreurs);
        }

        return handler;
    }

    private bool Valider(X509Certificate2? certificat, SslPolicyErrors erreurs)
    {
        if (erreurs == SslPolicyErrors.None)
        {
            return true;
        }

        if (erreurs != SslPolicyErrors.RemoteCertificateChainErrors || certificat is null)
        {
            return false;
        }

        using var chaine = new X509Chain();
        chaine.ChainPolicy.TrustMode = X509ChainTrustMode.CustomRootTrust;
        chaine.ChainPolicy.CustomTrustStore.Add(racine!);
        chaine.ChainPolicy.RevocationMode = X509RevocationMode.NoCheck;
        return chaine.Build(certificat);
    }
}
