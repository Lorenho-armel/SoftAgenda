using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.Synchronisation;
using GestionAgenda.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionAgenda.API.Controllers;

[ApiController]
[Authorize(Roles = "Dirigeant,Assistante")]
[Route("api/google-agenda")]
[Produces("application/json")]
public sealed class GoogleAgendaController(IAgendaGoogleService service, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("etat")]
    [ProducesResponseType(typeof(ApiResponse<EtatAgendaGoogleResponse>), StatusCodes.Status200OK)]
    public IActionResult Etat() => Ok(ApiResponse<EtatAgendaGoogleResponse>.Ok(service.Etat()));

    [HttpGet("acces")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AccesAgendaGoogleResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Acces(CancellationToken cancellationToken)
    {
        var result = await service.VerifierAccesAsync(currentUser.UserId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<AccesAgendaGoogleResponse>>.Ok(result));
    }

    [HttpPost("resynchronisation")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public async Task<IActionResult> Resynchroniser(CancellationToken cancellationToken)
    {
        await service.ResynchroniserAsync(currentUser.UserId, cancellationToken);
        return Accepted();
    }
}
