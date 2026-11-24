/*
  The Leistungen voice demo ("Branded Genius Voice Engine", src/components/pages/leistungen/callbots.tsx): two short
  calls per language, Inbound and Outbound, spoken by ElevenLabs voices.

  Each line is spoken on its own (Eleven v4, with timestamps); the caller's lines go through ElevenLabs' phone filter,
  the assistant's stay clean. The lines are joined with short pauses into one MP3 per call, and voice-demo/manifest.json
  records when each line and each word is spoken, so the page's transcript and topics can follow the real audio.

  Usage (the key is read from .env.local by Node, never written in code):
    node --env-file=.env.local scripts/voice-demo.mjs voices        premade voices, credits left, the filter presets
    node --env-file=.env.local scripts/voice-demo.mjs make [ids]    all four calls, or some (de-inbound en-outbound ...)
    node scripts/voice-demo.mjs site                                 the calls onto the page (no key, no credits)
  make writes voice-demo/<id>.mp3 and voice-demo/manifest.json (git ignores the folder; needs ffmpeg and ffprobe).
  site copies the MP3s to public/media/voice/ and writes src/content/voice-demo.json, the timing the page reads: per
  language and direction the file, its length, and each line's speaker, topic (the page's own chip label), start, end
  and words with their start and end.

  Round 5 (2026-11-24): made on the developer's free ElevenLabs account for the client to listen to first. The free
  plan can only use premade voices through the API and allows no commercial use, so the files on the live site need a
  paid plan (and can then use native German voices from the Voice Library: change VOICES and run make again).
*/
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("voice-demo");
const MODEL = "eleven_v4";
const RATE = 44100;
const GAP = 0.42; // seconds between two turns of the call
const SETTINGS = { stability: 0.45, similarityBoost: 0.75 }; // the skill's conversational preset, a touch steadier

/*
  Premade voices only (see above), picked by their descriptions: the assistant is Sarah ("Mature, Reassuring,
  Confident") in both calls and both languages; the inbound caller is Chris ("Charming, Down-to-Earth"), Herr Weber in
  the outbound call is Eric ("Smooth, Trustworthy").
*/
const SARAH = "EXAVITQu4vr4xnSDxMaL";
const CHRIS = "iP95p4xoKVk53GoZ742B";
const ERIC = "cjVigY5qzO86Huf0OWal";
const VOICES = {
  de: { agent: SARAH, inbound: CHRIS, outbound: ERIC },
  en: { agent: SARAH, inbound: CHRIS, outbound: ERIC },
};

/* The approved scripts (round5/voice-scripts.md), with the outbound callee as Herr Weber / Mr. Weber (a male voice). */
const CALLS = {
  "de-inbound": {
    lang: "de",
    caller: "inbound",
    end: "transfer",
    lines: [
      ["agent", "Guten Tag, hier ist der KI-Assistent von Branded Genius. Wie kann ich Ihnen helfen?", "Kundenanfragen"],
      ["caller", "Hallo. Wir wollen unseren Kundenservice mit KI entlasten. Geht das bei uns?"],
      ["agent", "Sehr gern, das schauen wir uns an. Wie viele Anfragen bekommen Sie ungefähr pro Woche?", "Qualifizierung"],
      ["caller", "So um die zweihundert. Meistens per Telefon und E-Mail."],
      ["agent", "Danke. Dann besprechen wir das am besten in einem Erstgespräch. Passt Ihnen Donnerstag um zehn Uhr?", "Terminanfragen"],
      ["caller", "Ja, passt. Und eine Frage zu unserer letzten Rechnung hätte ich noch.", "Support"],
      ["agent", "Ihr Termin am Donnerstag steht, die Bestätigung kommt per E-Mail. Für die Rechnung verbinde ich Sie jetzt mit der Buchhaltung.", "Anrufweiterleitung"],
    ],
  },
  "de-outbound": {
    lang: "de",
    caller: "outbound",
    start: "ring",
    lines: [
      ["agent", "Guten Tag, Herr Weber, hier ist der KI-Assistent von Branded Genius. Sie haben gestern unseren KI-Potenzial-Check ausgefüllt. Haben Sie kurz zwei Minuten?", "Follow-ups"],
      ["caller", "Ja, zwei Minuten habe ich."],
      ["agent", "Sie schreiben, dass Ihr Vertrieb viel Zeit mit dem Nachfassen verliert. Wie viele Angebote gehen bei Ihnen pro Monat raus?", "Lead-Qualifizierung"],
      ["caller", "Etwa fünfzig."],
      ["agent", "Danke. Dann zeigen wir Ihnen gern, wie das Nachfassen automatisch läuft. Passt Ihnen Dienstag um vierzehn Uhr?", "Terminvereinbarung"],
      ["caller", "Ja, das passt."],
      ["agent", "Prima, der Termin ist eingetragen. Sie bekommen gleich eine Einladung per E-Mail."],
    ],
  },
  "en-inbound": {
    lang: "en",
    caller: "inbound",
    end: "transfer",
    lines: [
      ["agent", "Hello, this is the AI assistant at Branded Genius. How can I help you?", "Customer inquiries"],
      ["caller", "Hi. We'd like AI to take some load off our customer service. Would that work for us?"],
      ["agent", "Happy to look into that. Roughly how many requests do you get each week?", "Qualification"],
      ["caller", "Around two hundred. Mostly by phone and email."],
      ["agent", "Thanks. Then an initial consultation is the best next step. Does Thursday at ten work for you?", "Appointment requests"],
      ["caller", "Yes, that works. And I have a question about our last invoice.", "Support"],
      ["agent", "Your Thursday appointment is booked, and the confirmation is on its way by email. For the invoice, I'll put you through to accounting now.", "Call forwarding"],
    ],
  },
  "en-outbound": {
    lang: "en",
    caller: "outbound",
    start: "ring",
    lines: [
      ["agent", "Hello, Mr. Weber, this is the AI assistant at Branded Genius. You filled in our AI potential check yesterday. Do you have two minutes?", "Follow-ups"],
      ["caller", "Yes, I have two minutes."],
      ["agent", "You mentioned your sales team loses a lot of time on follow-ups. How many quotes do you send each month?", "Lead qualification"],
      ["caller", "About fifty."],
      ["agent", "Thanks. Then we'd like to show you how follow-ups can run on their own. Does Tuesday at two work?", "Appointment setting"],
      ["caller", "Yes, that's fine."],
      ["agent", "Great, it's in the calendar. You'll get an invitation by email in a moment."],
    ],
  },
};

// Made on first use (it reads ELEVENLABS_API_KEY from the environment), so `site` runs without a key.
let client;
const api = () => (client ??= new ElevenLabsClient());

const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const duration = (file) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());
const mono = ["-ar", String(RATE), "-ac", "1", "-c:a", "pcm_s16le"];

/** A pause, the German ring-back tone (425 Hz) before an outbound call is answered, or the transfer beeps. */
function sound(kind, file, seconds = GAP) {
  const src = {
    gap: `anullsrc=r=${RATE}:cl=mono,atrim=0:${seconds}`,
    ring: `aevalsrc='0.10*sin(2*PI*425*t)':s=${RATE}:d=1.0,afade=t=in:d=0.03,afade=t=out:st=0.95:d=0.05,apad=pad_dur=0.55`,
    transfer: `aevalsrc='0.12*sin(2*PI*880*t)*lt(mod(t,0.26),0.13)':s=${RATE}:d=0.52,apad=pad_dur=0.3`,
  }[kind];
  ff(["-f", "lavfi", "-i", src, ...mono, file]);
  return duration(file);
}

/** Words with their start and end, from the character timing of one line. */
function words(alignment, offset) {
  const out = [];
  if (!alignment) return out;
  const { characters, characterStartTimesSeconds: s, characterEndTimesSeconds: e } = alignment;
  let word = "";
  let from = 0;
  characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (word) out.push({ w: word, s: +(offset + from).toFixed(3), e: +(offset + e[i - 1]).toFixed(3) });
      word = "";
      return;
    }
    if (!word) from = s[i];
    word += ch;
    if (i === characters.length - 1) out.push({ w: word, s: +(offset + from).toFixed(3), e: +(offset + e[i]).toFixed(3) });
  });
  return out;
}

async function makeCall(id) {
  const call = CALLS[id];
  const voices = VOICES[call.lang];
  if (!voices.agent || !voices[call.caller]) throw new Error(`Set VOICES.${call.lang} first (node --env-file=.env.local scripts/voice-demo.mjs voices)`);
  const work = path.join(OUT, "work", id);
  fs.mkdirSync(work, { recursive: true });
  const parts = [];
  let at = 0;
  let chars = 0;
  const lines = [];
  const add = (file, dur) => {
    parts.push(file);
    at += dur;
  };

  if (call.start) add(path.join(work, "start.wav"), sound(call.start, path.join(work, "start.wav")));
  for (let i = 0; i < call.lines.length; i++) {
    const [who, text, topic] = call.lines[i];
    const { data, rawResponse } = await api().textToSpeech
      .convertWithTimestamps(who === "agent" ? voices.agent : voices[call.caller], {
        text,
        modelId: MODEL,
        languageCode: call.lang,
        outputFormat: "mp3_44100_128",
        voiceSettings: SETTINGS,
        previousText: call.lines[i - 1]?.[1],
        nextText: call.lines[i + 1]?.[1],
        ...(who === "caller" ? { audioEffects: { filterPresetId: "phone" } } : {}),
      })
      .withRawResponse();
    chars += Number(rawResponse.headers.get("x-character-count") ?? text.length);
    const mp3 = path.join(work, `${String(i).padStart(2, "0")}-${who}.mp3`);
    const wav = mp3.replace(/\.mp3$/, ".wav");
    fs.writeFileSync(mp3, Buffer.from(data.audioBase64, "base64"));
    ff(["-i", mp3, ...mono, wav]);
    const dur = duration(wav);
    lines.push({ who, text, topic: topic ?? null, start: +at.toFixed(3), end: +(at + dur).toFixed(3), words: words(data.alignment, at) });
    add(wav, dur);
    if (i < call.lines.length - 1) add(path.join(work, `gap-${i}.wav`), sound("gap", path.join(work, `gap-${i}.wav`)));
  }
  if (call.end) add(path.join(work, "end.wav"), sound(call.end, path.join(work, "end.wav")));

  // One file: the parts in order, then one loudness pass for the web (-16 LUFS), as a mono 128 kbps MP3.
  const list = path.join(work, "parts.txt");
  fs.writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n"));
  const file = path.join(OUT, `${id}.mp3`);
  ff(["-f", "concat", "-safe", "0", "-i", list, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", String(RATE), "-ac", "1", "-c:a", "libmp3lame", "-b:a", "128k", file]);
  console.log(`${id}: ${duration(file).toFixed(1)} s, ${lines.length} lines, ${chars} characters billed`);
  return { id, lang: call.lang, file: `${id}.mp3`, duration: +duration(file).toFixed(3), lines };
}

async function listVoices() {
  const sub = await api().user.subscription.get();
  console.log(`plan ${sub.tier}: ${sub.characterCount} of ${sub.characterLimit} credits used this month`);
  const { voices } = await api().voices.getAll();
  for (const v of voices.filter((x) => x.category === "premade")) {
    const l = v.labels ?? {};
    console.log([v.voiceId, v.name, l.gender, l.age, l.accent, l.descriptive ?? l.description, l.use_case].filter(Boolean).join(" | "));
  }
  const catalog = await api().audioEffects.getCatalog();
  console.log("filter presets:", JSON.stringify(catalog.filterPresets ?? catalog.filter_presets ?? Object.keys(catalog)));
}

/** The made calls onto the page: the MP3s into public/media/voice/, the timing into src/content/voice-demo.json. */
function toSite() {
  const manifest = JSON.parse(fs.readFileSync(path.join(OUT, "manifest.json"), "utf8"));
  const media = path.resolve("public/media/voice");
  fs.mkdirSync(media, { recursive: true });
  const site = {};
  for (const [id, call] of Object.entries(CALLS)) {
    const made = manifest[id];
    if (!made) throw new Error(`${id} is not made yet (make ${id})`);
    fs.copyFileSync(path.join(OUT, made.file), path.join(media, made.file));
    const [lang, direction] = id.split("-");
    site[lang] ??= {};
    site[lang][direction] = {
      src: `/media/voice/${made.file}`,
      duration: made.duration,
      lines: made.lines.map((line, i) => ({
        who: line.who,
        // The topic from the script above (the page's chip label), so a renamed chip needs no new audio.
        topic: call.lines[i][2] ?? null,
        start: line.start,
        end: line.end,
        words: line.words.map((w) => [w.w, w.s, w.e]),
      })),
    };
  }
  fs.writeFileSync(path.resolve("src/content/voice-demo.json"), JSON.stringify(site));
  console.log(`site: ${Object.keys(CALLS).length} calls in public/media/voice, timing in src/content/voice-demo.json`);
}

const [mode, ...ids] = process.argv.slice(2);
if (mode === "site") {
  toSite();
} else if (mode === "voices") {
  await listVoices();
} else if (mode === "make") {
  fs.mkdirSync(OUT, { recursive: true });
  const manifestFile = path.join(OUT, "manifest.json");
  const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : {};
  for (const id of ids.length ? ids : Object.keys(CALLS)) {
    if (!CALLS[id]) throw new Error(`Unknown call ${id}; one of ${Object.keys(CALLS).join(", ")}`);
    manifest[id] = await makeCall(id);
  }
  fs.writeFileSync(manifestFile, JSON.stringify({ model: MODEL, voices: VOICES, ...manifest }, null, 1));
} else {
  console.log("Usage: node --env-file=.env.local scripts/voice-demo.mjs voices | make [de-inbound de-outbound en-inbound en-outbound]");
}
