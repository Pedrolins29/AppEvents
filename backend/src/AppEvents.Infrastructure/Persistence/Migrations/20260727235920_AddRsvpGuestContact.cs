using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppEvents.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRsvpGuestContact : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GuestEmail",
                table: "RsvpResponses",
                type: "character varying(320)",
                maxLength: 320,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GuestPhone",
                table: "RsvpResponses",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GuestEmail",
                table: "RsvpResponses");

            migrationBuilder.DropColumn(
                name: "GuestPhone",
                table: "RsvpResponses");
        }
    }
}
