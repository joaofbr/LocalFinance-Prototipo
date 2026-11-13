using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Poupi.Infrastructure.Persistence.Migrations
{
    public partial class CreditCards : Migration
    {
            protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transactions_HouseholdId_Date",
                table: "Transactions");

            migrationBuilder.AddColumn<Guid>(
                name: "CardId",
                table: "Transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "ReferenceMonth",
                table: "Transactions",
                type: "date",
                nullable: true);

            migrationBuilder.Sql(
                """UPDATE "Transactions" SET "ReferenceMonth" = date_trunc('month', "Date")::date;""");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "ReferenceMonth",
                table: "Transactions",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Cards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    ClosingDay = table.Column<int>(type: "integer", nullable: false),
                    DueDay = table.Column<int>(type: "integer", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cards_Households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalTable: "Households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Cards_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CardId",
                table: "Transactions",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_HouseholdId_ReferenceMonth",
                table: "Transactions",
                columns: new[] { "HouseholdId", "ReferenceMonth" });

            migrationBuilder.CreateIndex(
                name: "IX_Cards_HouseholdId",
                table: "Cards",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_Cards_OwnerId",
                table: "Cards",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Cards_CardId",
                table: "Transactions",
                column: "CardId",
                principalTable: "Cards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

            protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Cards_CardId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "Cards");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_CardId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_HouseholdId_ReferenceMonth",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "CardId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "ReferenceMonth",
                table: "Transactions");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_HouseholdId_Date",
                table: "Transactions",
                columns: new[] { "HouseholdId", "Date" });
        }
    }
}
