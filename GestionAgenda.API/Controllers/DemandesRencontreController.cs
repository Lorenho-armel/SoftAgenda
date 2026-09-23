using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionAgenda.API.Controllers;

[ApiController]
[Authorize(Roles = "Dirigeant,Assistante,Collaborateur,Externe")]
[Route("api/demandes-rencontre")]
[Produces("application/json")]
public sealed class DemandesRencontreController(IDemandeRencontreService service, ICurrentUser currentUser) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<DemandeRencontreResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(CreerDemandeRencontreRequest request, CancellationToken cancellationToken)
    {
        var created = await service.CreateAsync(request, currentUser.UserId, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<DemandeRencontreResponse>.Ok(created));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResult<DemandeRencontreResumeResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] DemandeRencontreQuery query, CancellationToken cancellationToken)
    {
        var result = await service.GetAllAsync(query, currentUser.UserId, cancellationToken);
        return Ok(ApiResponse<PaginatedResult<DemandeRencontreResumeResponse>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DemandeRencontreResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.GetByIdAsync(id, currentUser.UserId, cancellationToken);
        return Ok(ApiResponse<DemandeRencontreResponse>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DemandeRencontreResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        Guid id,
        MettreAJourDemandeRencontreRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, request, currentUser.UserId, cancellationToken);
        return Ok(ApiResponse<DemandeRencontreResponse>.Ok(result));
    }

    [HttpPatch("{id:guid}/statut")]
    [ProducesResponseType(typeof(ApiResponse<DemandeRencontreResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ChangerStatut(
        Guid id,
        ChangerStatutDemandeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.ChangerStatutAsync(id, request, currentUser.UserId, cancellationToken);
        return Ok(ApiResponse<DemandeRencontreResponse>.Ok(result));
    }

    [HttpPatch("{id:guid}/priorite")]
    [ProducesResponseType(typeof(ApiResponse<DemandeRencontreResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ChangerPriorite(
        Guid id,
        ChangerPrioriteDemandeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.ChangerPrioriteAsync(id, request, currentUser.UserId, cancellationToken);
        return Ok(ApiResponse<DemandeRencontreResponse>.Ok(result));
    }

    [HttpPatch("{id:guid}/urgence")]
    [ProducesResponseType(typeof(ApiResponse<DemandeRencontreResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ChangerUrgence(
        Guid id,
        ChangerUrgenceDemandeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.ChangerUrgenceAsync(id, request, currentUser.UserId, cancellationToken);
        return Ok(ApiResponse<DemandeRencontreResponse>.Ok(result));
    }
}
