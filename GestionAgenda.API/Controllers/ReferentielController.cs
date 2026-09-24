using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.DTOs.Referentiel;
using GestionAgenda.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionAgenda.API.Controllers;

[ApiController]
[Authorize(Roles = "Dirigeant,Assistante,Collaborateur,Externe")]
[Route("api/referentiel")]
[Produces("application/json")]
public sealed class ReferentielController(IReferentielService service, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("societes")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SocieteOptionResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListerSocietes([FromQuery] string? recherche, CancellationToken cancellationToken)
    {
        var result = await service.ListerSocietesAsync(currentUser.UserId, recherche, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<SocieteOptionResponse>>.Ok(result));
    }

    [HttpGet("societes/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SocieteDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenirSociete(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.ObtenirSocieteAsync(currentUser.UserId, id, cancellationToken);
        return Ok(ApiResponse<SocieteDetailResponse>.Ok(result));
    }
}
