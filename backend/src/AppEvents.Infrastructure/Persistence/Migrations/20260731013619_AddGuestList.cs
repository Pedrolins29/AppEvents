using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppEvents.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestList : Migration
    {
        // Hand-written as a data-preserving rename (RsvpResponses -> Guests) rather than the
        // drop+create EF scaffolds by default: existing RSVP rows become guests whose status
        // already moved off Pending, with a backfilled InviteToken and RespondedAtUtc = CreatedAtUtc.
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""RsvpResponses"" RENAME TO ""Guests"";
                ALTER TABLE ""Guests"" RENAME CONSTRAINT ""PK_RsvpResponses"" TO ""PK_Guests"";
                ALTER TABLE ""Guests"" RENAME CONSTRAINT ""FK_RsvpResponses_Events_EventId"" TO ""FK_Guests_Events_EventId"";
                ALTER INDEX ""IX_RsvpResponses_EventId"" RENAME TO ""IX_Guests_EventId"";

                -- Email is now optional (an organizer-added invitee may only have a phone).
                ALTER TABLE ""Guests"" ALTER COLUMN ""GuestEmail"" DROP NOT NULL;

                -- New invitee/reminder columns. InviteToken and ReminderCount start with a temporary
                -- default so existing rows backfill, then the defaults are dropped to match the model.
                ALTER TABLE ""Guests"" ADD COLUMN ""InviteToken"" character varying(64) NOT NULL DEFAULT '';
                ALTER TABLE ""Guests"" ADD COLUMN ""RespondedAtUtc"" timestamp with time zone NULL;
                ALTER TABLE ""Guests"" ADD COLUMN ""ReminderCount"" integer NOT NULL DEFAULT 0;
                ALTER TABLE ""Guests"" ADD COLUMN ""LastReminderSentAtUtc"" timestamp with time zone NULL;

                -- Backfill: every pre-existing row already responded, so RespondedAtUtc = CreatedAtUtc,
                -- and each gets a unique token derived from its (unique) Id.
                UPDATE ""Guests""
                SET ""InviteToken"" = md5(random()::text || ""Id""::text),
                    ""RespondedAtUtc"" = ""CreatedAtUtc"";

                ALTER TABLE ""Guests"" ALTER COLUMN ""InviteToken"" DROP DEFAULT;
                ALTER TABLE ""Guests"" ALTER COLUMN ""ReminderCount"" DROP DEFAULT;

                CREATE UNIQUE INDEX ""IX_Guests_InviteToken"" ON ""Guests"" (""InviteToken"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP INDEX ""IX_Guests_InviteToken"";

                ALTER TABLE ""Guests"" DROP COLUMN ""InviteToken"";
                ALTER TABLE ""Guests"" DROP COLUMN ""RespondedAtUtc"";
                ALTER TABLE ""Guests"" DROP COLUMN ""ReminderCount"";
                ALTER TABLE ""Guests"" DROP COLUMN ""LastReminderSentAtUtc"";

                -- Restoring NOT NULL requires no null emails; pre-rename rows never had null email.
                UPDATE ""Guests"" SET ""GuestEmail"" = '' WHERE ""GuestEmail"" IS NULL;
                ALTER TABLE ""Guests"" ALTER COLUMN ""GuestEmail"" SET NOT NULL;

                ALTER INDEX ""IX_Guests_EventId"" RENAME TO ""IX_RsvpResponses_EventId"";
                ALTER TABLE ""Guests"" RENAME CONSTRAINT ""FK_Guests_Events_EventId"" TO ""FK_RsvpResponses_Events_EventId"";
                ALTER TABLE ""Guests"" RENAME CONSTRAINT ""PK_Guests"" TO ""PK_RsvpResponses"";
                ALTER TABLE ""Guests"" RENAME TO ""RsvpResponses"";
            ");
        }
    }
}
