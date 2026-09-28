using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.Synchronisation;
using GestionAgenda.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionAgenda.API.Controllers;

[ApiController]
[Authorize(Roles = "Dirigeant,Assistante")]
[Route("api/google-sheets")]
[Produces("application/json")]
public sealed class GoogleSheetsController(IFeuilleAgendaService service, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("etat")]
    [ProducesResponseType(typeof(ApiResponse<EtatFeuilleResponse>), StatusCodes.Status200OK)]
    public IActionResult Etat() => Ok(ApiResponse<EtatFeuilleResponse>.Ok(service.Etat()));

    [HttpPost("import")]
    [ProducesResponseType(typeof(ApiResponse<RapportImportResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Importer(CancellationToken cancellationToken)
    {
        var result = await service.ImporterAsync(currentUser.UserId, cancellationToken);
        return Ok(ApiResponse<RapportImportResponse>.Ok(result));
    }

    [HttpPost("resynchronisation")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public async Task<IActionResult> Resynchroniser(CancellationToken cancellationToken)
    {
        await service.ResynchroniserAsync(currentUser.UserId, cancellationToken);
        return Accepted();
    }
}
