using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.Indisponibilites;
using GestionAgenda.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionAgenda.API.Controllers;

[ApiController]
[Authorize(Roles = "Dirigeant,Assistante")]
[Route("api/indisponibilites")]
[Produces("application/json")]
public sealed class IndisponibilitesController(IIndisponibiliteService service, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("dirigeants")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DirigeantGereResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListerDirigeants(CancellationToken cancellationToken)
    {
        var result = await service.ListerDirigeantsGeresAsync(currentUser.UserId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<DirigeantGereResponse>>.Ok(result));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<IndisponibiliteResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Lister(
        [FromQuery] DateTimeOffset debut,
        [FromQuery] DateTimeOffset fin,
        CancellationToken cancellationToken)
    {
        var result = await service.ListerAsync(currentUser.UserId, debut, fin, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<IndisponibiliteResponse>>.Ok(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<IndisponibiliteResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Creer(CreerIndisponibiliteRequest request, CancellationToken cancellationToken)
    {
        var result = await service.CreerAsync(currentUser.UserId, request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<IndisponibiliteResponse>.Ok(result));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Supprimer(Guid id, CancellationToken cancellationToken)
    {
        await service.SupprimerAsync(currentUser.UserId, id, cancellationToken);
        return NoContent();
    }
}
