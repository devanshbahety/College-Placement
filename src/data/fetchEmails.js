// src/data/fetchEmails.js
import Imap from "imap";
import { simpleParser } from "mailparser";

const DEBUG = false; // set true to console.log diagnostics

function createImap() {
  return new Imap({
    user: "pregmi_be22@thapar.edu",
    password: "zpdv uchb kcua hrtg",   // TODO: move to .env later
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });
}

/** Recursively find the mailbox path that has the \All attribute (Gmail "All Mail") */
function findAllMailPath(boxes, prefix = "") {
  for (const [name, info] of Object.entries(boxes)) {
    const path = prefix ? `${prefix}${name}` : name;
    const attrs = info.attrib || info.attribs || [];
    if (attrs.map(String).some(a => a.toLowerCase() === "\\all")) {
      return path;
    }
    if (info.children) {
      const childPath = findAllMailPath(info.children, `${path}${info.delimiter || "/"}`
      );
      if (childPath) return childPath;
    }
  }
  return null;
}

function openBox(imap, boxName, cb) {
  imap.openBox(boxName, true, cb); // readonly = true
}

/**
 * Return [{subject, company, ctc, link, date, from}]
 * @param {number} daysBack
 */
export function fetchPlacementMails(daysBack = 30) {
  return new Promise((resolve, reject) => {
    const imap = createImap();
    const items = [];
    const days = Math.max(1, Number(daysBack) || 30);

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const parseMsg = (stream, itemsArr) =>
      new Promise((res) => {
        simpleParser(stream, (err3, parsed) => {
          if (!err3 && parsed) {
            const emailText = parsed.text || parsed.html || "";

            const company =
              emailText.match(/Company\s*[:\-]\s*(.*)/i)?.[1] ||
              emailText.match(/Name of the Organization\s*[:\-]\s*(.*)/i)?.[1] ||
              "";

            const ctc =
              emailText.match(/CTC\s*[:\-]\s*(.*)/i)?.[1] ||
              emailText.match(/Package\s*[:\-]\s*(.*)/i)?.[1] ||
              "";

            const link = emailText.match(/https?:\/\/[^\s>]+/i)?.[0] || "";

            itemsArr.push({
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

    const doSearch = (criteria, onDone) => {
      imap.search(criteria, (err2, results) => {
        if (err2) return onDone(err2);
        if (DEBUG) console.log("search criteria:", criteria, "results:", results?.length || 0);
        if (!results || results.length === 0) return onDone(null, []);

        const f = imap.fetch(results, { bodies: "" });
        const parsePromises = [];

        f.on("message", (msg) => {
          msg.on("body", (stream) => {
            parsePromises.push(parseMsg(stream, items));
          });
        });

        f.once("error", (e) => onDone(e));
        f.once("end", async () => {
          await Promise.all(parsePromises);
          onDone(null, items);
        });
      });
    };

    const proceedSearches = () => {
      // Broadened Gmail query:
      // - multiple sender variants
      // - subject hints
      // - last X days
      const gmQuery = [
        "(",
        'from:spr@thapar.edu',
        "OR from:tnp@thapar.edu",
        "OR from:placement@thapar.edu",
        'OR from:"Student Placement Representative"',
        'OR from:"Training and Placement"',
        "OR list:spr@thapar.edu",
        ")",
        "AND",
        "(",
        'subject:placement',
        "OR subject:recruitment",
        "OR subject:campus",
        "OR subject:drive",
        ")",
        `newer_than:${days}d`,
      ].join(" ");

      // 1) Try Gmail raw first (works across All Mail better than vanilla IMAP)
      doSearch([["X-GM-RAW", gmQuery]], (errRaw) => {
        if (!errRaw && items.length > 0) {
          items.sort((a, b) => new Date(b.date) - new Date(a.date));
          imap.end();
          return resolve(items);
        }

        // 2) Fallback: standards-compliant IMAP with OR + SINCE
        // OR chain for multiple FROMs:
        const fromOr =
          ["spr@thapar.edu", "tnp@thapar.edu", "placement@thapar.edu"].reduce(
            (acc, addr) => (acc.length === 0 ? ["FROM", addr] : ["OR", acc, ["FROM", addr]]),
            []
          );

        // Build criteria: ALL + SINCE + (FROM A OR FROM B OR FROM C)
        const criteria = ["ALL", ["SINCE", sinceDate]];
        if (fromOr.length) criteria.push(fromOr);

        doSearch(criteria, (errStd) => {
          imap.end();
          if (errStd) return reject(errStd);
          items.sort((a, b) => new Date(b.date) - new Date(a.date));
          resolve(items);
        });
      });
    };

    imap.once("ready", () => {
      // Find the true All Mail path regardless of locale
      imap.getBoxes((err, boxes) => {
        if (err) {
          if (DEBUG) console.log("getBoxes error, falling back to INBOX:", err);
          return openBox(imap, "INBOX", (errInbox) => {
            if (errInbox) { imap.end(); return reject(errInbox); }
            proceedSearches();
          });
        }
        const allMailPath = findAllMailPath(boxes) || "[Gmail]/All Mail"; // fallback
        if (DEBUG) console.log("Resolved All Mail path:", allMailPath);

        openBox(imap, allMailPath, (errOpen) => {
          if (errOpen) {
            if (DEBUG) console.log("Open All Mail failed, falling back to INBOX:", errOpen);
            openBox(imap, "INBOX", (errInbox) => {
              if (errInbox) { imap.end(); return reject(errInbox); }
              proceedSearches();
            });
          } else {
            proceedSearches();
          }
        });
      });
    });

    imap.once("error", (err) => reject(err));
    imap.once("end", () => {
      if (DEBUG) console.log("IMAP connection ended");
    });
    imap.connect();
  });
}

// CLI debug
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchPlacementMails(100)
    .then(list => {
      console.log(`Fetched ${list.length} messages`);
      list.forEach(p => {
        console.log("📧 Subject:", p.subject);
        console.log("🏢 Company:", p.company);
        console.log("💰 CTC:", p.ctc);
        console.log("🔗 Apply Link:", p.link);
        console.log("🕒 Date:", p.date);
        console.log("From:", p.from);
        console.log("----------------------------------");
      });
      process.exit(0);
    })
    .catch(e => { console.error(e); process.exit(1); });
}
