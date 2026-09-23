using FluentValidation;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Application.Common;

public static class ValidationExplicite
{
    public static async Task ValiderAsync<T>(
        this IValidator<T> validator,
        T instance,
        CancellationToken cancellationToken)
    {
        var resultat = await validator.ValidateAsync(instance, cancellationToken);
        if (!resultat.IsValid)
        {
            var message = string.Join(' ', resultat.Errors.Select(erreur => erreur.ErrorMessage));
            throw new DomainException(message);
        }
    }
}
