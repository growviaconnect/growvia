import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function getCalendarClient() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
  const credentials = JSON.parse(json) as object;
  const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
  return google.calendar({ version: "v3", auth });
}

export interface MeetSessionParams {
  mentorName: string;
  mentorEmail: string;
  menteeName: string;
  menteeEmail: string;
  /** Full ISO datetime string for the session start (from connexions.date) */
  startIso: string;
  durationMinutes?: number;
  topic?: string;
}

/** Creates a Google Calendar event with a Meet link and returns the hangout URL. */
export async function createMeetSession(params: MeetSessionParams): Promise<string> {
  const {
    mentorName, mentorEmail, menteeName, menteeEmail,
    startIso, durationMinutes = 60, topic = "",
  } = params;

  const calendar = getCalendarClient();

  const start = new Date(startIso);
  const end   = new Date(start.getTime() + durationMinutes * 60_000);

  const { data } = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary:     `GrowVia: ${mentorName} × ${menteeName}`,
      description: topic || "Mentoring session on GrowVia",
      start: { dateTime: start.toISOString(), timeZone: "UTC" },
      end:   { dateTime: end.toISOString(),   timeZone: "UTC" },
      attendees: [
        { email: mentorEmail, displayName: mentorName },
        { email: menteeEmail, displayName: menteeName },
      ],
      conferenceData: {
        createRequest: {
          requestId: `growvia-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const meetLink = data.hangoutLink;
  if (!meetLink) throw new Error("Google Calendar did not return a Meet link");

  return meetLink;
}
