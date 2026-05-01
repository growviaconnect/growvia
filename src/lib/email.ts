import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY ?? "";
  if (!key) return null;
  return new Resend(key);
}

const FROM = "GrowVia <contact@growviaconnect.com>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://growviaconnect.com";

// ─── HTML layout ──────────────────────────────────────────────────────────────

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GrowVia</title>
</head>
<body style="margin:0;padding:0;background-color:#f0eeff;font-family:Inter,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0eeff;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">

        <!-- Header -->
        <tr><td style="background:#0D0A1A;border-radius:16px 16px 0 0;padding:24px 36px;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="background:linear-gradient(135deg,#7C3AED,#4C1D95);border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                <span style="color:#fff;font-weight:800;font-size:15px;line-height:36px;">G</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.3px;">GrowVia</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;border-radius:0 0 16px 16px;padding:40px 36px;">
          ${body}

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:36px;border-top:1px solid #ede9fe;padding-top:24px;">
            <tr><td align="center" style="color:#9ca3af;font-size:12px;line-height:1.7;">
              GrowVia &mdash; Connect your potential<br/>
              <a href="${BASE_URL}" style="color:#7C3AED;text-decoration:none;">${BASE_URL.replace("https://", "")}</a>
            </td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#7C3AED;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:24px;">${label}</a>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 8px;color:#0D0A1A;font-size:24px;font-weight:800;letter-spacing:-0.5px;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.65;">${text}</p>`;
}

function highlight(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 14px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:10px 14px;color:#111827;font-size:13px;font-weight:600;vertical-align:top;">${value}</td>
  </tr>`;
}

function infoBox(rows: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background:#f5f3ff;border-radius:10px;border:1px solid #ede9fe;margin:20px 0 8px;">
    ${rows}
  </table>`;
}

function badge(color: string, text: string): string {
  return `<span style="display:inline-block;background:${color};color:#fff;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.3px;">${text}</span>`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      weekday: "long", day: "numeric", month: "long",
      year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
    });
  } catch { return iso; }
}

// ─── 1. Welcome email ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, nom: string, role: string) {
  const roleLabel = role === "mentor" ? "Mentor" : role === "mentee" ? "Mentee" : "School Admin";
  const nextPath  = role === "mentor" ? "/onboarding/mentor" : role === "mentee" ? "/onboarding/mentee" : "/dashboard";

  const body = `
    ${h1(`Welcome to GrowVia, ${nom} 👋`)}
    ${p(`Your account is all set. You joined as a <strong>${roleLabel}</strong>, we're glad to have you.`)}
    ${p("Complete your profile so we can match you with the right people.")}
    ${btn("Complete my profile →", `${BASE_URL}${nextPath}`)}
    <br/>
    ${p(`If you didn't create this account, you can ignore this email.`)}
  `;

  const r = getResend();
  if (!r) return { data: null, error: new Error("RESEND_API_KEY not configured") };
  return r.emails.send({ from: FROM, to, subject: "Welcome to GrowVia 🚀", html: layout(body) });
}

// ─── 2. Session booking confirmation ─────────────────────────────────────────

export type BookingParams = {
  mentorEmail: string;
  mentorNom:   string;
  menteeEmail: string;
  menteeNom:   string;
  date:        string;
  sessionId:   string;
};

export async function sendBookingConfirmation(params: BookingParams) {
  const { mentorEmail, mentorNom, menteeEmail, menteeNom, date, sessionId } = params;
  const formattedDate = formatDate(date);
  const dashUrl = `${BASE_URL}/dashboard`;

  // Email to mentor
  const mentorBody = `
    ${badge("#7C3AED", "New session request")}
    <br/><br/>
    ${h1("You have a new session request")}
    ${p(`<strong>${menteeNom}</strong> has requested a mentoring session with you.`)}
    ${infoBox(
      highlight("Date & time", formattedDate) +
      highlight("Mentee",      menteeNom) +
      highlight("Session ID",  sessionId)
    )}
    ${p("You can accept or decline from your dashboard.")}
    ${btn("View request →", dashUrl)}
  `;

  // Email to mentee
  const menteeBody = `
    ${badge("#059669", "Booking sent")}
    <br/><br/>
    ${h1("Your session request was sent!")}
    ${p(`We've sent your request to <strong>${mentorNom}</strong>. You'll be notified once they respond.`)}
    ${infoBox(
      highlight("Date & time", formattedDate) +
      highlight("Mentor",      mentorNom) +
      highlight("Session ID",  sessionId)
    )}
    ${p("In the meantime, make the most of your free plan to explore more mentors.")}
    ${btn("View my dashboard →", dashUrl)}
  `;

  const r = getResend();
  if (!r) return [{ data: null, error: new Error("RESEND_API_KEY not configured") }, { data: null, error: new Error("RESEND_API_KEY not configured") }];
  return Promise.all([
    r.emails.send({ from: FROM, to: mentorEmail, subject: `New session request from ${menteeNom}`, html: layout(mentorBody) }),
    r.emails.send({ from: FROM, to: menteeEmail, subject: "Your session request was sent ✓",      html: layout(menteeBody) }),
  ]);
}

// ─── 3. Session accepted / rejected ──────────────────────────────────────────

export type StatusParams = {
  menteeEmail: string;
  menteeNom:   string;
  mentorNom:   string;
  date:        string;
  accepted:    boolean;
};

export async function sendSessionStatusNotification(params: StatusParams) {
  const { menteeEmail, menteeNom, mentorNom, date, accepted } = params;
  const formattedDate = formatDate(date);
  const dashUrl = `${BASE_URL}/dashboard`;

  const body = accepted
    ? `
      ${badge("#059669", "Session confirmed ✓")}
      <br/><br/>
      ${h1("Your session is confirmed!")}
      ${p(`Great news, ${menteeNom}! <strong>${mentorNom}</strong> accepted your session request.`)}
      ${infoBox(
        highlight("Date & time", formattedDate) +
        highlight("Mentor",      mentorNom)
      )}
      ${p("Add it to your calendar and come prepared with your questions.")}
      ${btn("View session →", dashUrl)}
    `
    : `
      ${badge("#dc2626", "Session declined")}
      <br/><br/>
      ${h1("Your session was declined")}
      ${p(`Unfortunately, ${menteeNom}, <strong>${mentorNom}</strong> wasn't able to accept your session at this time.`)}
      ${p("Don't be discouraged, explore other mentors who might be a great fit.")}
      ${btn("Find another mentor →", `${BASE_URL}/explore`)}
    `;

  const subject = accepted
    ? `✅ ${mentorNom} confirmed your session`
    : `Your session request with ${mentorNom} was declined`;

  const r = getResend();
  if (!r) return { data: null, error: new Error("RESEND_API_KEY not configured") };
  return r.emails.send({ from: FROM, to: menteeEmail, subject, html: layout(body) });
}

// ─── 4 & 5. Session reminders (24h and 2h) ──────────────────────────────────

export type ReminderParams = {
  email:      string;
  nom:        string;
  otherNom:   string;
  date:       string;
  role:       "mentor" | "mentee";
  hoursUntil: 24 | 2;
  scheduledAt?: string; // ISO string, lets Resend deliver at the right time
};

export async function sendSessionReminder(params: ReminderParams) {
  const { email, nom, otherNom, date, role, hoursUntil, scheduledAt } = params;
  const formattedDate = formatDate(date);
  const dashUrl = `${BASE_URL}/dashboard`;

  const isUrgent = hoursUntil === 2;
  const timeLabel = isUrgent ? "in 2 hours" : "tomorrow";
  const urgBadge  = isUrgent ? badge("#dc2626", "⏰ Starting in 2 hours") : badge("#7C3AED", "📅 Reminder, 24h");
  const tipRole   = role === "mentor"
    ? "Think about your key advice and prepare actionable takeaways for your mentee."
    : "Come prepared with your questions to make the most of your session.";

  const body = `
    ${urgBadge}
    <br/><br/>
    ${h1(`Your session is ${timeLabel}`)}
    ${p(`Hi ${nom}, just a heads-up, your mentoring session is coming up ${timeLabel}.`)}
    ${infoBox(
      highlight("Date & time", formattedDate) +
      highlight(role === "mentor" ? "Mentee" : "Mentor", otherNom)
    )}
    ${p(tipRole)}
    ${btn("View session →", dashUrl)}
  `;

  const subject = isUrgent
    ? `⏰ Your session with ${otherNom} starts in 2 hours`
    : `📅 Reminder: session with ${otherNom} is tomorrow`;

  const r = getResend();
  if (!r) return { data: null, error: new Error("RESEND_API_KEY not configured") };
  return r.emails.send({ from: FROM, to: email, subject, html: layout(body), ...(scheduledAt ? { scheduledAt } : {}) });
}

// ─── Schedule all reminders at booking time ───────────────────────────────────
// Called once when a session is booked. Resend queues and delivers each email
// at the calculated future timestamp, no cron job required.

export type ScheduleRemindersParams = {
  mentorEmail: string;
  mentorNom:   string;
  menteeEmail: string;
  menteeNom:   string;
  sessionDate: string; // ISO string of the session start time
};

export async function scheduleSessionReminders(params: ScheduleRemindersParams) {
  const { mentorEmail, mentorNom, menteeEmail, menteeNom, sessionDate } = params;
  const session = new Date(sessionDate);
  const now     = Date.now();

  const remind24 = new Date(session.getTime() - 24 * 3_600_000);
  const remind2  = new Date(session.getTime() -  2 * 3_600_000);

  const sends: Promise<unknown>[] = [];

  // Queue 24h reminders only if there's still time to send them
  if (remind24.getTime() > now + 60_000) {
    const at24 = remind24.toISOString();
    sends.push(
      sendSessionReminder({ email: mentorEmail, nom: mentorNom, otherNom: menteeNom, date: sessionDate, role: "mentor", hoursUntil: 24, scheduledAt: at24 }),
      sendSessionReminder({ email: menteeEmail, nom: menteeNom, otherNom: mentorNom, date: sessionDate, role: "mentee", hoursUntil: 24, scheduledAt: at24 }),
    );
  }

  // Queue 2h reminders only if there's still time to send them
  if (remind2.getTime() > now + 60_000) {
    const at2 = remind2.toISOString();
    sends.push(
      sendSessionReminder({ email: mentorEmail, nom: mentorNom, otherNom: menteeNom, date: sessionDate, role: "mentor", hoursUntil: 2, scheduledAt: at2 }),
      sendSessionReminder({ email: menteeEmail, nom: menteeNom, otherNom: mentorNom, date: sessionDate, role: "mentee", hoursUntil: 2, scheduledAt: at2 }),
    );
  }

  return Promise.allSettled(sends);
}
