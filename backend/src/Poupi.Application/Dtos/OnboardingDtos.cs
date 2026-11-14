namespace Poupi.Application.Dtos;

public record OnboardingStepDto(string Id, bool Done);

public record OnboardingDto(
    bool ShowWelcome,
    bool Invited,
    string? FamilyOwner,
    List<OnboardingStepDto> Checklist,
    List<OnboardingStepDto> FamilyGuide);
