using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Poupi.Infrastructure.Persistence.Migrations
{
    public partial class HouseholdPlan : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Plan",
                table: "Households",
                type: "character varying(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "Individual");

            migrationBuilder.Sql("""
                UPDATE "Households" AS h SET "Plan" = 'Family'
                WHERE (SELECT COUNT(*) FROM "Users" AS u WHERE u."HouseholdId" = h."Id") > 1;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Plan",
                table: "Households");
        }
    }
}
