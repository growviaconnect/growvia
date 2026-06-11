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

/** Creates a Whereby meeting room and returns the host roomUrl. */
export async function createMeetSession(params: MeetSessionParams): Promise<string> {
  const { mentorName, menteeName, startIso, durationMinutes = 60, topic = "" } = params;

  const apiKey = process.env.WHEREBY_API_KEY ?? "";
  if (!apiKey) throw new Error("WHEREBY_API_KEY is not set");

  // Clamp to now if the session date is in the past (Whereby rejects past startDate)
  const startDate = new Date(Math.max(Date.now(), new Date(startIso).getTime()));
  const endDate   = new Date(startDate.getTime() + durationMinutes * 60_000);

  const res = await fetch("https://api.whereby.dev/v1/meetings", {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      roomNamePrefix:  "growvia",
      roomMode:        "group",
      startDate:       startDate.toISOString(),
      endDate:         endDate.toISOString(),
      fields:          ["hostRoomUrl"],
      roomNamePattern: "uuid",
      ...(topic || mentorName || menteeName
        ? { meetingName: topic || `${mentorName} × ${menteeName}` }
        : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Whereby API error ${res.status}: ${text}`);
  }

  const data = await res.json() as { roomUrl: string; hostRoomUrl: string };
  const roomUrl = data.hostRoomUrl ?? data.roomUrl;
  if (!roomUrl) throw new Error("Whereby did not return a roomUrl");

  return roomUrl;
}
