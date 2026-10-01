using System.Security.Authentication;
using Google;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Infrastructure.Synchronisation;

public static class AppelsGoogle
{
    public static async Task<T> ExecuterAsync<T>(Func<Task<T>> appel, Func<GoogleApiException, string?> messageErreurApi)
    {
        try
        {
            return await appel();
        }
        catch (HttpRequestException exception) when (exception.InnerException is AuthenticationException)
        {
            throw new ServiceExterneException(
                "Connexion à Google refusée : le certificat présenté n'est pas reconnu. Un pare-feu avec inspection SSL "
                + "intercepte probablement la connexion (voir docs/google-sheets.md, section Pare-feu).",
                exception);
        }
        catch (HttpRequestException exception)
        {
            throw new ServiceExterneException("Google est injoignable depuis le serveur : vérifiez la connexion Internet ou le proxy.", exception);
        }
        catch (GoogleApiException exception) when (messageErreurApi(exception) is { } message)
        {
            throw new ServiceExterneException(message, exception);
        }
    }
}
