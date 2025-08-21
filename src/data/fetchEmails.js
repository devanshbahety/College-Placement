// src/data/fetchEmails.js
import Imap from "imap";
import { simpleParser } from "mailparser";

function createImap() {
  return new Imap({
    user: "pregmi_be22@thapar.edu",
    password: "zpdv uchb kcua hrtg",   // TODO: move to .env later
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });
}

function openInbox(imap, cb) {
  imap.openBox("INBOX", false, cb);
}

/** Return [{subject, company, ctc, link, date, from}] */
export function fetchPlacementMails() {
  return new Promise((resolve, reject) => {
    const imap = createImap();            // <-- NEW: make a fresh IMAP per call
    const items = [];

    imap.once("ready", () => {
      openInbox(imap, (err) => {
        if (err) return reject(err);

        const today = new Date();
        const dateStr = today.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        imap.search([["FROM", "spr@thapar.edu"], ["ON", dateStr]], (err2, results) => {
          if (err2) { imap.end(); return reject(err2); }
          if (!results.length) { imap.end(); return resolve([]); }

          const f = imap.fetch(results, { bodies: "" });
          const parsePromises = [];

          f.on("message", (msg) => {
            msg.on("body", (stream) => {
              const p = new Promise((res) => {
                simpleParser(stream, async (err3, parsed) => {
                  if (!err3) {
                    const emailText = parsed.text || "";

                    const company =
                      emailText.match(/Company\s*[:\-]\s*(.*)/i)?.[1] ||
                      emailText.match(/Name of the Organization\s*[:\-]\s*(.*)/i)?.[1] ||
                      "";

                    const ctc =
                      emailText.match(/CTC\s*[:\-]\s*(.*)/i)?.[1] ||
                      emailText.match(/Package\s*[:\-]\s*(.*)/i)?.[1] ||
                      "";

                    const link = emailText.match(/https?:\/\/[^\s>]+/i)?.[0] || "";

                    items.push({
                      subject: parsed.subject || "",
                      company: (company || "").trim(),
                      ctc: (ctc || "").trim(),
                      link: (link || "").trim(),
                      date: parsed.date?.toISOString?.() || new Date().toISOString(),
                      from: parsed.from?.text || "",
                    });
                  }
                  res();
                });
              });
              parsePromises.push(p);
            });
          });

          f.once("end", async () => {
            await Promise.all(parsePromises);
            imap.end();
            resolve(items);
          });

          f.once("error", (e) => { imap.end(); reject(e); });
        });
      });
    });

    imap.once("error", (err) => reject(err));
    imap.connect();
  });
}

// CLI debug still works
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchPlacementMails()
    .then(list => {
      list.forEach(p => {
        console.log("📧 Subject:", p.subject);
        console.log("🏢 Company:", p.company);
        console.log("💰 CTC:", p.ctc);
        console.log("🔗 Apply Link:", p.link);
        console.log("----------------------------------");
      });
      process.exit(0);
    })
    .catch(e => { console.error(e); process.exit(1); });
}
