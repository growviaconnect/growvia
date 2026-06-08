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

/** Builds a "Add to Google Calendar" URL for a session. */
function gcalLink(params: {
  title: string;
  startIso: string;
  durationMinutes: number;
  description?: string;
  location?: string;
}): string {
  const { title, startIso, durationMinutes, description = "", location = "" } = params;
  const start = new Date(startIso);
  const end   = new Date(start.getTime() + durationMinutes * 60_000);
  const fmt   = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(".000", "");
  const qs = new URLSearchParams({
    action:  "TEMPLATE",
    text:    title,
    dates:   `${fmt(start)}/${fmt(end)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${qs.toString()}`;
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
  if (!r) {
    console.error("[email] sendWelcomeEmail: RESEND_API_KEY not configured");
    return { data: null, error: new Error("RESEND_API_KEY not configured") };
  }

  console.log(`[email] sendWelcomeEmail → ${to} (role=${role})`);
  const result = await r.emails.send({ from: FROM, to, subject: "Welcome to GrowVia 🚀", html: layout(body) });
  if (result.error) {
    console.error(`[email] sendWelcomeEmail failed for ${to}:`, result.error);
  } else {
    console.log(`[email] sendWelcomeEmail sent (id=${result.data?.id}) → ${to}`);
  }
  return result;
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
  email:           string;
  nom:             string;
  otherNom:        string;
  date:            string;
  role:            "mentor" | "mentee";
  hoursUntil:      24 | 2;
  meetLink?:       string;
  topic?:          string;
  durationMinutes?: number;
  scheduledAt?:    string; // ISO string, lets Resend deliver at the right time
};

export async function sendSessionReminder(params: ReminderParams) {
  const { email, nom, otherNom, date, role, hoursUntil, meetLink, topic, durationMinutes = 60, scheduledAt } = params;
  const formattedDate = formatDate(date);
  const dashUrl = `${BASE_URL}/dashboard`;

  const isUrgent = hoursUntil === 2;
  const timeLabel = isUrgent ? "in 2 hours" : "tomorrow";
  const urgBadge  = isUrgent ? badge("#dc2626", "⏰ Starting in 2 hours") : badge("#7C3AED", "📅 Reminder, 24h");
  const tipRole   = role === "mentor"
    ? "Think about your key advice and prepare actionable takeaways for your mentee."
    : "Come prepared with your questions to make the most of your session.";

  const calLink = gcalLink({
    title:           `GrowVia session with ${otherNom}`,
    startIso:        date,
    durationMinutes,
    description:     topic || "Mentoring session on GrowVia" + (meetLink ? `\n\nJoin: ${meetLink}` : ""),
    location:        meetLink ?? "",
  });

  const meetRow = meetLink
    ? highlight("Google Meet", `<a href="${meetLink}" style="color:#7C3AED;word-break:break-all;">${meetLink}</a>`)
    : "";

  const joinBtn = meetLink
    ? `<a href="${meetLink}" style="display:inline-block;background:#059669;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;">Join session →</a>`
    : btn("View session →", dashUrl);

  const calBtn = `<a href="${calLink}" style="display:inline-block;background:#ffffff;color:#7C3AED;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;margin-left:8px;border:2px solid #7C3AED;">📅 Add to Calendar</a>`;

  const body = `
    ${urgBadge}
    <br/><br/>
    ${h1(`Your session is ${timeLabel}`)}
    ${p(`Hi ${nom}, just a heads-up, your mentoring session is coming up ${timeLabel}.`)}
    ${infoBox(
      highlight("Date & time", formattedDate) +
      highlight(role === "mentor" ? "Mentee" : "Mentor", otherNom) +
      meetRow
    )}
    ${p(tipRole)}
    ${joinBtn}${calBtn}
  `;

  const subject = isUrgent
    ? `⏰ Your session with ${otherNom} starts in 2 hours`
    : `📅 Reminder: session with ${otherNom} is tomorrow`;

  const r = getResend();
  if (!r) return { data: null, error: new Error("RESEND_API_KEY not configured") };
  return r.emails.send({ from: FROM, to: email, subject, html: layout(body), ...(scheduledAt ? { scheduledAt } : {}) });
}

// ─── 6. Account deletion confirmation ────────────────────────────────────────

export async function sendAccountDeletionEmail(
  to: string,
  nom: string,
  deletedAt: Date,
  recoveryToken?: string,
) {
  const deletedAtLabel = deletedAt.toLocaleString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
    year: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Paris",
  });
  // Permanent deletion happens 30 days after soft-delete
  const purgeDate = new Date(deletedAt.getTime() + 30 * 24 * 3_600_000);
  const purgeDateLabel = purgeDate.toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const recoveryUrl = recoveryToken
    ? `${BASE_URL}/account/recover?token=${recoveryToken}`
    : `mailto:contact@growviaconnect.com?subject=Account%20recovery%20request%20-%20${encodeURIComponent(to)}`;

  const body = `
    ${badge("#dc2626", "Account deleted")}
    <br/><br/>
    ${h1(`Your GrowVia account has been deleted`)}
    ${p(`Hi ${nom}, your account and all associated data were deleted on <strong>${deletedAtLabel}</strong>.`)}
    ${infoBox(
      highlight("Email",             to) +
      highlight("Deleted on",        deletedAtLabel) +
      highlight("Permanent removal", purgeDateLabel),
    )}
    ${p("If you deleted your account by mistake, you can request recovery within <strong>30 days</strong>. After that, your data is permanently and irreversibly erased.")}
    <a href="${recoveryUrl}" style="display:inline-block;background:#7C3AED;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;">Recover my account →</a>
    <br/><br/>
    ${p(`If you did not request this deletion, contact us immediately at <a href="mailto:contact@growviaconnect.com" style="color:#7C3AED;text-decoration:none;">contact@growviaconnect.com</a>`)}
  `;

  const r = getResend();
  if (!r) {
    console.error("[email] sendAccountDeletionEmail: RESEND_API_KEY not configured");
    return { data: null, error: new Error("RESEND_API_KEY not configured") };
  }
  console.log(`[email] sendAccountDeletionEmail → ${to}`);
  const result = await r.emails.send({
    from:    FROM,
    to,
    subject: "Your GrowVia account has been deleted",
    html:    layout(body),
  });
  if (result.error) console.error(`[email] sendAccountDeletionEmail failed for ${to}:`, result.error);
  else              console.log(`[email] sendAccountDeletionEmail sent (id=${result.data?.id}) → ${to}`);
  return result;
}

// ─── 7. Session confirmed — sent to BOTH mentor and mentee with Meet link ─────

export type ConfirmWithMeetParams = {
  mentorEmail: string;
  mentorNom:   string;
  menteeEmail: string;
  menteeNom:   string;
  date:        string;
  meetLink?:   string;
  topic?:      string;
  durationMinutes?: number;
};

export async function sendConfirmationWithMeet(params: ConfirmWithMeetParams) {
  const { mentorEmail, mentorNom, menteeEmail, menteeNom, date, meetLink, topic, durationMinutes = 60 } = params;
  const formattedDate = formatDate(date);
  const dashUrl = `${BASE_URL}/dashboard`;

  const calLink = gcalLink({
    title:           `GrowVia: ${mentorNom} × ${menteeNom}`,
    startIso:        date,
    durationMinutes,
    description:     topic || "Mentoring session on GrowVia" + (meetLink ? `\n\nJoin: ${meetLink}` : ""),
    location:        meetLink ?? "",
  });

  const joinBtn = meetLink
    ? `<a href="${meetLink}" style="display:inline-block;background:#059669;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;">Join session →</a>`
    : btn("View dashboard →", dashUrl);

  const calBtn = `<a href="${calLink}" style="display:inline-block;background:#ffffff;color:#7C3AED;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;margin-left:8px;border:2px solid #7C3AED;">📅 Add to Calendar</a>`;

  const meetRow = meetLink
    ? highlight("Google Meet", `<a href="${meetLink}" style="color:#7C3AED;word-break:break-all;">${meetLink}</a>`)
    : "";

  const mentorBody = `
    ${badge("#059669", "Session confirmed ✓")}
    <br/><br/>
    ${h1("Your session is confirmed!")}
    ${p(`You accepted <strong>${menteeNom}</strong>'s session request. Here's what you need:`)}
    ${infoBox(
      highlight("Date & time", formattedDate) +
      highlight("Mentee",      menteeNom) +
      meetRow
    )}
    ${joinBtn}${calBtn}
  `;

  const menteeBody = `
    ${badge("#059669", "Session confirmed ✓")}
    <br/><br/>
    ${h1("Your session is confirmed!")}
    ${p(`Great news! <strong>${mentorNom}</strong> accepted your session request.`)}
    ${infoBox(
      highlight("Date & time", formattedDate) +
      highlight("Mentor",      mentorNom) +
      meetRow
    )}
    ${joinBtn}${calBtn}
  `;

  const subject = "Your GrowVia session is confirmed ✅";
  const r = getResend();
  if (!r) return;
  await Promise.all([
    r.emails.send({ from: FROM, to: mentorEmail, subject, html: layout(mentorBody) }),
    r.emails.send({ from: FROM, to: menteeEmail, subject, html: layout(menteeBody) }),
  ]);
}

// ─── Schedule all reminders at booking time ───────────────────────────────────
// Called once when a session is booked. Resend queues and delivers each email
// at the calculated future timestamp, no cron job required.

export type ScheduleRemindersParams = {
  mentorEmail:      string;
  mentorNom:        string;
  menteeEmail:      string;
  menteeNom:        string;
  sessionDate:      string; // ISO string of the session start time
  meetLink?:        string;
  topic?:           string;
  durationMinutes?: number;
};

export async function scheduleSessionReminders(params: ScheduleRemindersParams) {
  const { mentorEmail, mentorNom, menteeEmail, menteeNom, sessionDate, meetLink, topic, durationMinutes } = params;
  const session = new Date(sessionDate);
  const now     = Date.now();

  const remind24 = new Date(session.getTime() - 24 * 3_600_000);
  const remind2  = new Date(session.getTime() -  2 * 3_600_000);

  const sends: Promise<unknown>[] = [];

  // Queue 24h reminders only if there's still time to send them
  if (remind24.getTime() > now + 60_000) {
    const at24 = remind24.toISOString();
    sends.push(
      sendSessionReminder({ email: mentorEmail, nom: mentorNom, otherNom: menteeNom, date: sessionDate, role: "mentor", hoursUntil: 24, meetLink, topic, durationMinutes, scheduledAt: at24 }),
      sendSessionReminder({ email: menteeEmail, nom: menteeNom, otherNom: mentorNom, date: sessionDate, role: "mentee", hoursUntil: 24, meetLink, topic, durationMinutes, scheduledAt: at24 }),
    );
  }

  // Queue 2h reminders only if there's still time to send them
  if (remind2.getTime() > now + 60_000) {
    const at2 = remind2.toISOString();
    sends.push(
      sendSessionReminder({ email: mentorEmail, nom: mentorNom, otherNom: menteeNom, date: sessionDate, role: "mentor", hoursUntil: 2, meetLink, topic, durationMinutes, scheduledAt: at2 }),
      sendSessionReminder({ email: menteeEmail, nom: menteeNom, otherNom: mentorNom, date: sessionDate, role: "mentee", hoursUntil: 2, meetLink, topic, durationMinutes, scheduledAt: at2 }),
    );
  }

  return Promise.allSettled(sends);
}

// ─── 8. Payment failed — mentee needs to update card ──────────────────────────

export type PaymentFailedParams = {
  menteeEmail: string;
  menteeNom:   string;
  sessionDate: string;
};

export async function sendPaymentFailedEmail(params: PaymentFailedParams) {
  const { menteeEmail, menteeNom, sessionDate } = params;
  const formattedDate = formatDate(sessionDate);
  const portalUrl     = `${BASE_URL}/settings?tab=subscription`;

  const body = `
    ${badge("#dc2626", "Payment failed")}
    <br/><br/>
    ${h1("We couldn't process your session payment")}
    ${p(`Hi ${menteeNom}, your mentor accepted the session but the payment for the following session could not be processed.`)}
    ${infoBox(
      highlight("Scheduled date", formattedDate)
    )}
    ${p("Please update your payment method to confirm the session. Your spot is reserved for 24 hours.")}
    ${btn("Update payment method →", portalUrl)}
  `;

  const r = getResend();
  if (!r) return { data: null, error: new Error("RESEND_API_KEY not configured") };
  return r.emails.send({
    from:    FROM,
    to:      menteeEmail,
    subject: "⚠️ Action required: session payment failed",
    html:    layout(body),
  });
}

// ─── 9. Mentor proposes a new session time ────────────────────────────────────

export async function sendProposeNewTime(params: {
  menteeEmail:      string;
  menteeNom:        string;
  mentorNom:        string;
  newDateIso:       string;
  durationMinutes?: number;
}) {
  const { menteeEmail, menteeNom, mentorNom, newDateIso, durationMinutes = 60 } = params;
  const formattedDate = formatDate(newDateIso);
  const dashUrl       = `${BASE_URL}/dashboard`;

  const calLink = gcalLink({
    title:           `GrowVia session with ${mentorNom}`,
    startIso:        newDateIso,
    durationMinutes,
    description:     "Mentoring session on GrowVia — accept or decline this time on your dashboard",
  });

  const calBtn = `<a href="${calLink}" style="display:inline-block;background:#ffffff;color:#7C3AED;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;margin-left:8px;border:2px solid #7C3AED;">📅 Preview in Calendar</a>`;

  const body = `
    ${badge("#F59E0B", "New time proposed")}
    <br/><br/>
    ${h1("Your mentor proposed a new time")}
    ${p(`Hi ${menteeNom}, <strong>${mentorNom}</strong> has suggested a different time for your session.`)}
    ${infoBox(highlight("Proposed date & time", formattedDate))}
    ${p("Go to your dashboard to accept or decline the new time.")}
    ${btn("View on dashboard →", dashUrl)}${calBtn}
    <br/><br/>
    ${p(`If you decline, your session request will be cancelled and you'll be free to book with another mentor.`)}
  `;

  const r = getResend();
  if (!r) return { data: null, error: new Error("RESEND_API_KEY not configured") };
  return r.emails.send({
    from:    FROM,
    to:      menteeEmail,
    subject: `${mentorNom} proposed a new session time`,
    html:    layout(body),
  });
}

// ─── 10a. Mentee accepted the retime — notify mentor ─────────────────────────

export async function sendRetimeAccepted(params: {
  mentorEmail:      string;
  mentorNom:        string;
  menteeNom:        string;
  newDateIso:       string;
  meetLink?:        string;
  durationMinutes?: number;
}) {
  const { mentorEmail, mentorNom, menteeNom, newDateIso, meetLink, durationMinutes = 60 } = params;
  const formattedDate = formatDate(newDateIso);
  const dashUrl       = `${BASE_URL}/dashboard`;

  const calLink = gcalLink({
    title:           `GrowVia: ${mentorNom} × ${menteeNom}`,
    startIso:        newDateIso,
    durationMinutes,
    description:     "Mentoring session on GrowVia" + (meetLink ? `\n\nJoin: ${meetLink}` : ""),
    location:        meetLink ?? "",
  });

  const joinBtn = meetLink
    ? `<a href="${meetLink}" style="display:inline-block;background:#059669;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;">Join session →</a>`
    : btn("View dashboard →", dashUrl);
  const calBtn  = `<a href="${calLink}" style="display:inline-block;background:#ffffff;color:#7C3AED;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;margin-top:8px;margin-left:8px;border:2px solid #7C3AED;">📅 Add to Calendar</a>`;

  const body = `
    ${badge("#059669", "New time accepted ✓")}
    <br/><br/>
    ${h1("Your proposed time was accepted!")}
    ${p(`Great news! <strong>${menteeNom}</strong> accepted the new session time you proposed.`)}
    ${infoBox(
      highlight("New date & time", formattedDate) +
      highlight("Mentee", menteeNom) +
      (meetLink ? highlight("Google Meet", `<a href="${meetLink}" style="color:#7C3AED;word-break:break-all;">${meetLink}</a>`) : "")
    )}
    ${joinBtn}${calBtn}
  `;

  const r = getResend();
  if (!r) return;
  return r.emails.send({ from: FROM, to: mentorEmail, subject: `${menteeNom} accepted your proposed time ✅`, html: layout(body) });
}

// ─── 10b. Mentee declined the retime — notify mentor ─────────────────────────

export async function sendRetimeDeclined(params: {
  mentorEmail: string;
  mentorNom:   string;
  menteeNom:   string;
}) {
  const { mentorEmail, mentorNom, menteeNom } = params;
  const dashUrl = `${BASE_URL}/dashboard`;

  const body = `
    ${badge("#dc2626", "Proposed time declined")}
    <br/><br/>
    ${h1("Your proposed time was declined")}
    ${p(`Hi ${mentorNom}, <strong>${menteeNom}</strong> declined the new session time you proposed. The session has been cancelled.`)}
    ${p("The mentee is free to rebook with you or another mentor at any time.")}
    ${btn("View dashboard →", dashUrl)}
  `;

  const r = getResend();
  if (!r) return;
  return r.emails.send({ from: FROM, to: mentorEmail, subject: `${menteeNom} declined your proposed time`, html: layout(body) });
}

// ─── 10. Subscription confirmation ────────────────────────────────────────────

export type SubscriptionConfirmationParams = {
  to:              string;
  nom:             string;
  plan:            string;   // e.g. "Basic" | "Premium"
  priceEur:        number;   // monthly price in euros
  nextBillingDate: string;   // ISO date string
  trialEnd?:       string;   // ISO date string if there's a trial period
};

export async function sendSubscriptionConfirmation(params: SubscriptionConfirmationParams) {
  const { to, nom, plan, priceEur, nextBillingDate, trialEnd } = params;
  const billingLabel = new Date(nextBillingDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const trialLabel = trialEnd
    ? new Date(trialEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const body = `
    ${badge("#059669", "Subscription active ✓")}
    <br/><br/>
    ${h1(`Welcome to ${plan}!`)}
    ${p(`Hi ${nom}, your <strong>${plan}</strong> subscription is now active. Here's what's been set up:`)}
    ${infoBox(
      highlight("Plan",              plan) +
      highlight("Monthly price",     `${priceEur}€ / month`) +
      highlight("Next billing date", billingLabel) +
      (trialLabel ? highlight("Trial ends", trialLabel) : ""),
    )}
    ${p(`You now have unlimited access to AI mentor matching and all ${plan} features. Start by finding your ideal mentor.`)}
    ${btn("Find a mentor →", `${BASE_URL}/explore/find-a-mentor`)}
    <br/>
    ${p(`You can manage your subscription and billing at any time from your <a href="${BASE_URL}/settings" style="color:#7C3AED;text-decoration:none;">account settings</a>.`)}
  `;

  const r = getResend();
  if (!r) {
    console.error("[email] sendSubscriptionConfirmation: RESEND_API_KEY not configured");
    return { data: null, error: new Error("RESEND_API_KEY not configured") };
  }
  console.log(`[email] sendSubscriptionConfirmation → ${to} (plan=${plan})`);
  const result = await r.emails.send({
    from:    FROM,
    to,
    subject: `Your ${plan} subscription is confirmed ✓`,
    html:    layout(body),
  });
  if (result.error) console.error(`[email] sendSubscriptionConfirmation failed for ${to}:`, result.error);
  else              console.log(`[email] sendSubscriptionConfirmation sent (id=${result.data?.id}) → ${to}`);
  return result;
}

// ─── 11. Subscription changed (upgrade / downgrade) ───────────────────────────

export type SubscriptionChangedParams = {
  to:              string;
  nom:             string;
  oldPlan:         string;
  newPlan:         string;
  newPriceEur:     number;
  nextBillingDate: string;
  isUpgrade:       boolean;
};

export async function sendSubscriptionChanged(params: SubscriptionChangedParams) {
  const { to, nom, oldPlan, newPlan, newPriceEur, nextBillingDate, isUpgrade } = params;
  const billingLabel = new Date(nextBillingDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const changeLabel = isUpgrade ? "Upgraded" : "Downgraded";
  const badgeColor  = isUpgrade ? "#7C3AED" : "#6b7280";
  const changeNote  = isUpgrade
    ? "Your new plan is active immediately. Enjoy the extra features!"
    : "Your plan change takes effect at the next billing cycle. You keep access to your current plan until then.";

  const body = `
    ${badge(badgeColor, `Plan ${changeLabel}`)}
    <br/><br/>
    ${h1(`Your plan has been ${changeLabel.toLowerCase()}`)}
    ${p(`Hi ${nom}, here's a summary of your subscription change:`)}
    ${infoBox(
      highlight("Previous plan",     oldPlan) +
      highlight("New plan",          newPlan) +
      highlight("New monthly price", `${newPriceEur}€ / month`) +
      highlight("Next billing date", billingLabel),
    )}
    ${p(changeNote)}
    ${btn("View subscription →", `${BASE_URL}/settings?tab=subscription`)}
    <br/>
    ${p(`Questions about your billing? Contact us at <a href="mailto:contact@growviaconnect.com" style="color:#7C3AED;text-decoration:none;">contact@growviaconnect.com</a>`)}
  `;

  const r = getResend();
  if (!r) {
    console.error("[email] sendSubscriptionChanged: RESEND_API_KEY not configured");
    return { data: null, error: new Error("RESEND_API_KEY not configured") };
  }
  console.log(`[email] sendSubscriptionChanged → ${to} (${oldPlan} → ${newPlan})`);
  const result = await r.emails.send({
    from:    FROM,
    to,
    subject: `Your GrowVia plan has been ${changeLabel.toLowerCase()} to ${newPlan}`,
    html:    layout(body),
  });
  if (result.error) console.error(`[email] sendSubscriptionChanged failed for ${to}:`, result.error);
  else              console.log(`[email] sendSubscriptionChanged sent (id=${result.data?.id}) → ${to}`);
  return result;
}

// ─── 12. Subscription cancelled ───────────────────────────────────────────────

export type SubscriptionCancelledParams = {
  to:          string;
  nom:         string;
  planName:    string;
  accessUntil: string; // ISO date — access remains until end of billing period
};

export async function sendSubscriptionCancelled(params: SubscriptionCancelledParams) {
  const { to, nom, planName, accessUntil } = params;
  const accessLabel = new Date(accessUntil).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const body = `
    ${badge("#6b7280", "Subscription cancelled")}
    <br/><br/>
    ${h1("Your subscription has been cancelled")}
    ${p(`Hi ${nom}, your <strong>${planName}</strong> subscription has been cancelled as requested.`)}
    ${infoBox(
      highlight("Plan",         planName) +
      highlight("Access until", accessLabel) +
      highlight("Free session", "Still available"),
    )}
    ${p(`You still have full access to ${planName} features until <strong>${accessLabel}</strong>. After that, your account reverts to the free plan.`)}
    ${p("Your free discovery session remains available — you can still book a session with any mentor on the platform.")}
    ${btn("Resubscribe →", `${BASE_URL}/subscribe`)}
    <br/>
    ${p(`Changed your mind? Resubscribe at any time and we'll reactivate your plan immediately. Any questions, reach us at <a href="mailto:contact@growviaconnect.com" style="color:#7C3AED;text-decoration:none;">contact@growviaconnect.com</a>`)}
  `;

  const r = getResend();
  if (!r) {
    console.error("[email] sendSubscriptionCancelled: RESEND_API_KEY not configured");
    return { data: null, error: new Error("RESEND_API_KEY not configured") };
  }
  console.log(`[email] sendSubscriptionCancelled → ${to} (plan=${planName})`);
  const result = await r.emails.send({
    from:    FROM,
    to,
    subject: "Your GrowVia subscription has been cancelled",
    html:    layout(body),
  });
  if (result.error) console.error(`[email] sendSubscriptionCancelled failed for ${to}:`, result.error);
  else              console.log(`[email] sendSubscriptionCancelled sent (id=${result.data?.id}) → ${to}`);
  return result;
}

// ─── 13. Account suspended (mentor) ───────────────────────────────────────────

export type AccountSuspendedParams = {
  to:  string;
  nom: string;
};

export async function sendAccountSuspended(params: AccountSuspendedParams) {
  const { to, nom } = params;
  const profileUrl  = `${BASE_URL}/profile`;
  const supportUrl  = `mailto:contact@growviaconnect.com?subject=Account%20suspension%20-%20${encodeURIComponent(to)}`;

  const body = `
    ${badge("#F59E0B", "Account suspended")}
    <br/><br/>
    ${h1("Your mentor account has been suspended")}
    ${p(`Hi ${nom}, your GrowVia mentor account has been suspended and is no longer visible to mentees.`)}
    ${infoBox(
      highlight("Status",        "Suspended") +
      highlight("Profile",       "Hidden from search") +
      highlight("Mentee impact", "Scheduled sessions notified"),
    )}
    ${p("Any mentees who had upcoming sessions with you will receive a notification and be prompted to find an alternative mentor.")}
    ${p("To reactivate your account and resume mentoring, go to your profile settings and set your status back to active.")}
    ${btn("Go to profile settings →", profileUrl)}
    <br/>
    ${p(`If this suspension was applied in error, or you have questions, contact us at <a href="${supportUrl}" style="color:#7C3AED;text-decoration:none;">contact@growviaconnect.com</a>`)}
  `;

  const r = getResend();
  if (!r) {
    console.error("[email] sendAccountSuspended: RESEND_API_KEY not configured");
    return { data: null, error: new Error("RESEND_API_KEY not configured") };
  }
  console.log(`[email] sendAccountSuspended → ${to}`);
  const result = await r.emails.send({
    from:    FROM,
    to,
    subject: "Your GrowVia mentoring account has been suspended",
    html:    layout(body),
  });
  if (result.error) console.error(`[email] sendAccountSuspended failed for ${to}:`, result.error);
  else              console.log(`[email] sendAccountSuspended sent (id=${result.data?.id}) → ${to}`);
  return result;
}
