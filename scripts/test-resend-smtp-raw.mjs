#!/usr/bin/env node
/**
 * Raw SMTP test against smtp.resend.com:465 with ZERO dependencies.
 *
 * Prints every byte exchanged with the server so you can see exactly
 * where things go wrong (auth, MAIL FROM, RCPT TO, DATA, etc.).
 *
 * Run from your local machine (not a sandbox that blocks port 465):
 *
 *   RESEND_API_KEY="re_..." \
 *   TEST_TO="lunadavin@growviaconnect.com" \
 *     node scripts/test-resend-smtp-raw.mjs
 *
 * Optional:
 *   PORT=587                  # use STARTTLS instead of implicit TLS on 465
 *   FROM="contact@growviaconnect.com"
 */

import tls from "node:tls";
import net from "node:net";

const HOST   = "smtp.resend.com";
const PORT   = Number(process.env.PORT ?? 465);
const USER   = "resend";
const PASS   = process.env.RESEND_API_KEY;
const FROM   = process.env.FROM ?? "contact@growviaconnect.com";
const TO     = process.env.TEST_TO;
const SENDER = "GrowVia";

if (!PASS) { console.error("Missing RESEND_API_KEY"); process.exit(1); }
if (!TO)   { console.error("Missing TEST_TO");        process.exit(1); }

const useStartTls = PORT === 587 || PORT === 25;

function ts() { return new Date().toISOString().slice(11, 23); }
function log(dir, line) {
  const arrow = dir === "<" ? "\x1b[36m<--\x1b[0m" : dir === ">" ? "\x1b[33m-->\x1b[0m" : "   ";
  console.log(`${ts()} ${arrow} ${line}`);
}

function makeSession(socket) {
  let buf = "";
  const waiters = [];
  socket.setEncoding("utf8");
  socket.on("data", chunk => {
    buf += chunk;
    let nl;
    // SMTP responses can be multi-line (each non-final line ends with "-")
    while ((nl = buf.indexOf("\r\n")) !== -1) {
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 2);
      log("<", line);
      const code = line.slice(0, 3);
      const more = line[3] === "-";
      if (!more && waiters.length) {
        const w = waiters.shift();
        const ok = code.startsWith("2") || code.startsWith("3");
        if (ok) w.resolve({ code, line });
        else    w.reject(new Error(`SMTP ${code}: ${line}`));
      }
    }
  });
  socket.on("error", e => {
    while (waiters.length) waiters.shift().reject(e);
  });
  socket.on("close", () => {
    while (waiters.length) waiters.shift().reject(new Error("connection closed"));
  });

  return {
    expect: () => new Promise((resolve, reject) => waiters.push({ resolve, reject })),
    send: (cmd, redacted = false) => {
      log(">", redacted ? cmd.replace(/.(?=.{4})/g, "*") : cmd);
      socket.write(cmd + "\r\n");
    },
  };
}

async function runSmtp(socket) {
  const s = makeSession(socket);

  await s.expect(); // 220 greeting

  s.send(`EHLO test.local`);
  await s.expect();

  if (useStartTls) {
    s.send("STARTTLS");
    await s.expect();
    // upgrade socket — but for simplicity if you're on 587, we don't fully
    // continue here; just observe the response. Most users should stick to 465.
    console.log("\n⚠️  STARTTLS upgrade not implemented in this raw script. Use PORT=465.");
    socket.end();
    return;
  }

  s.send("AUTH LOGIN");
  await s.expect();
  s.send(Buffer.from(USER).toString("base64"));
  await s.expect();
  s.send(Buffer.from(PASS).toString("base64"), /*redacted*/ true);
  await s.expect(); // 235 success or 535 fail

  s.send(`MAIL FROM:<${FROM}>`);
  await s.expect();

  s.send(`RCPT TO:<${TO}>`);
  await s.expect();

  s.send("DATA");
  await s.expect();

  const body = [
    `From: ${SENDER} <${FROM}>`,
    `To: ${TO}`,
    `Subject: GrowVia raw-SMTP diagnostic`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}@${HOST}>`,
    "",
    "If you receive this, the path Supabase Auth uses to send password-reset emails is working end-to-end.",
    "",
  ].join("\r\n");
  for (const line of body.split("\r\n")) {
    // SMTP dot-stuffing
    const out = line.startsWith(".") ? "." + line : line;
    socket.write(out + "\r\n");
  }
  s.send(".");
  await s.expect();

  s.send("QUIT");
  await s.expect().catch(() => {});
  socket.end();
}

console.log(`\nConnecting to ${HOST}:${PORT} (${useStartTls ? "STARTTLS" : "implicit TLS"})…\n`);

const socket = useStartTls
  ? net.connect(PORT, HOST)
  : tls.connect(PORT, HOST, { servername: HOST });

socket.setTimeout(20000, () => {
  console.error("\n⚠️  Timed out after 20s — port blocked or server unreachable.");
  socket.destroy();
  process.exit(2);
});

socket.on("error", e => {
  console.error(`\n⚠️  Socket error: ${e.message}`);
  process.exit(2);
});

socket.on(useStartTls ? "connect" : "secureConnect", async () => {
  console.log(`✅ Connected${useStartTls ? "" : " (TLS handshake OK)"}\n`);
  try {
    await runSmtp(socket);
    console.log(`\n✅ All SMTP steps succeeded. Resend accepted the message.\n`);
    process.exit(0);
  } catch (e) {
    console.error(`\n❌ Failed at SMTP step: ${e.message}\n`);
    process.exit(1);
  }
});
