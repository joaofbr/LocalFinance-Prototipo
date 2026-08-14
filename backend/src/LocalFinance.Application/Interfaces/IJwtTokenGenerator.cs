using LocalFinance.Domain.Entities;

namespace LocalFinance.Application.Interfaces;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) Generate(User user);
}
