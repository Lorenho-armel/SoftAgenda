using System.Security.Claims;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.API.Services;

public sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public Guid UserId
    {
        get
        {
            var value = accessor.HttpContext?.User.FindFirstValue("sub")
                ?? accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(value, out var id))
            {
                throw new UnauthorizedException("Utilisateur non authentifié.");
            }

            return id;
        }
    }
}
