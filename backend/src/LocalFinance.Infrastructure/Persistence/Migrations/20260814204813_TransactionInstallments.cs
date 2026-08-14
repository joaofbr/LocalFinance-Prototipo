using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalFinance.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class TransactionInstallments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "InstallmentGroupId",
                table: "Transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InstallmentNumber",
                table: "Transactions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InstallmentTotal",
                table: "Transactions",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_InstallmentGroupId",
                table: "Transactions",
                column: "InstallmentGroupId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transactions_InstallmentGroupId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "InstallmentGroupId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "InstallmentNumber",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "InstallmentTotal",
                table: "Transactions");
        }
    }
}
