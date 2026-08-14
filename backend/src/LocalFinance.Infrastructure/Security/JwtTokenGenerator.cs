using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace LocalFinance.Infrastructure.Security;

public class JwtTokenGenerator(IOptions<JwtOptions> options) : IJwtTokenGenerator
{
    public (string Token, DateTime ExpiresAt) Generate(User user)
    {
        var opts = options.Value;
        var expiresAt = DateTime.UtcNow.AddHours(opts.ExpiryHours);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Name, user.Name),
            new(ClaimTypes.Role, user.Role == UserRole.Admin ? "Admin" : "Member"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: opts.Issuer,
            audience: opts.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);
        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
