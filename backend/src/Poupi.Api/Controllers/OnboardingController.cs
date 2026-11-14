using Poupi.Api.Security;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Poupi.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/onboarding")]
public class OnboardingController(IOnboardingService service) : ControllerBase
{
    [HttpGet]
    public async Task<OnboardingDto> Get(CancellationToken ct) =>
        await service.GetAsync(User.HouseholdId(), User.Id(), ct);

    [HttpPost("welcome-seen")]
    public async Task<IActionResult> WelcomeSeen(CancellationToken ct)
    {
        await service.MarkWelcomeSeenAsync(User.HouseholdId(), User.Id(), ct);
        return NoContent();
    }

    [HttpPost("checklist/dismiss")]
    public async Task<IActionResult> DismissChecklist(CancellationToken ct)
    {
        await service.DismissChecklistAsync(User.HouseholdId(), User.Id(), ct);
        return NoContent();
    }

    [HttpPost("family-guide/dismiss")]
    public async Task<IActionResult> DismissFamilyGuide(CancellationToken ct)
    {
        await service.DismissFamilyGuideAsync(User.HouseholdId(), User.Id(), ct);
        return NoContent();
    }
}
