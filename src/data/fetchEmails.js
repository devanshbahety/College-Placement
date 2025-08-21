import Imap from "imap";
import { simpleParser } from "mailparser";

const imap = new Imap({
  user: "pregmi_be22@thapar.edu",
  password: "zpdv uchb kcua hrtg",   // Google App Password
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function openInbox(cb) {
  imap.openBox("INBOX", false, cb);
}

imap.once("ready", () => {
  openInbox((err, box) => {
    if (err) throw err;

    // 📌 Today’s date in IMAP format
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    imap.search([["FROM", "spr@thapar.edu"], ["ON", dateStr]], (err, results) => {
      if (err || !results.length) {
        console.log("No placement mails for today.");
        imap.end();
        return;
      }

      const f = imap.fetch(results, { bodies: "" });
      f.on("message", (msg) => {
        msg.on("body", (stream) => {
          simpleParser(stream, async (err, parsed) => {
            if (err) throw err;

            console.log("📧 Subject:", parsed.subject);

            // 📌 Extract details from mail body
            const emailText = parsed.text || "";

            const company =
              emailText.match(/Company\s*[:\-]\s*(.*)/i)?.[1] ||
              emailText.match(/Name of the Organization\s*[:\-]\s*(.*)/i)?.[1] ||
              "";

            const ctc =
              emailText.match(/CTC\s*[:\-]\s*(.*)/i)?.[1] ||
              emailText.match(/Package\s*[:\-]\s*(.*)/i)?.[1] ||
              "";

            const link =
              emailText.match(/https?:\/\/[^\s]+/i)?.[0] || "";

            console.log("🏢 Company:", company.trim());
            console.log("💰 CTC:", ctc.trim());
            console.log("🔗 Apply Link:", link.trim());
            console.log("----------------------------------");
          });
        });
      });

      f.once("end", () => imap.end());
    });
  });
});

imap.connect();
