using Poupi.Domain.Entities;

namespace Poupi.Application.Interfaces;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) Generate(User user, bool developer);
}
