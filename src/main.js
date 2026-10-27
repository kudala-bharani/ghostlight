import "./style.css";
import {
  MODEL,
  SETTINGS,
  MOODS,
  SAMPLE,
  validateInput,
  readCabinet,
  writeCabinet,
  toMarkdown,
} from "./core.js";
const icons = { key: "⚿", watch: "◷", letter: "✉", bell: "♧" };
const $ = (s) => document.querySelector(s);
$("#app").innerHTML = `
<header class="topbar"><a href="#" class="brand" aria-label="Ghostlight home"><span class="brand-mark">✧</span> ghostlight<span class="brand-dot">.</span></a><a class="cabinet-link" href="#cabinet">Your cabinet <span id="count">0</span><span aria-hidden="true">↗</span></a></header>
<main><section class="hero" aria-labelledby="title"><div class="hero-copy"><p class="eyebrow"><span></span> A LITTLE FICTION. A LINGERING FEELING.</p><h1 id="title">Some things<br>still have a <em>story.</em></h1><p class="intro">A key without a door. A watch that stopped.<br>Give a forgotten object a fictional afterlife.</p><div class="hero-meta"><span>✦ Open-weight AI</span><span>◌ Made on your device</span><span>No account</span></div></div><div class="illustration" role="img" aria-label="A glowing antique key suspended in a glass bell jar"><div class="orbit o1"></div><div class="orbit o2"></div><span class="star s1">✧</span><span class="star s2">✦</span><span class="star s3">·</span><div class="jar-knob"></div><div class="jar"><div class="jar-shine"></div><div class="key-art"><div class="key-bow"></div><div class="key-shaft"></div><div class="key-tooth t1"></div><div class="key-tooth t2"></div></div><div class="jar-glow"></div><span class="jar-speck sp1">·</span><span class="jar-speck sp2">·</span></div><div class="jar-base"></div><p class="artifact-label">EXHIBIT 001 <span>A key with nowhere to go</span></p></div></section>
<section class="workbench" aria-labelledby="make-title"><div class="section-label"><span>01 / THE AWAKENING</span><span>Ordinary things. Extraordinary echoes.</span></div><div class="workspace"><form id="story-form"><div class="step-heading"><h2 id="make-title">What did you find?</h2><span aria-hidden="true">✳</span></div><label for="object">Your forgotten object</label><input id="object" name="object" maxlength="80" required minlength="2" placeholder="e.g. a pocket watch that runs backwards" value="A brass key" autocomplete="off"><div class="suggestions" aria-label="Object suggestions"><button type="button" data-object="A brass key">⚿ Brass key</button><button type="button" data-object="A stopped pocket watch">◷ Pocket watch</button><button type="button" data-object="An unopened letter">✉ Old letter</button></div><label for="setting">Where does its story begin?</label><select id="setting">${SETTINGS.map((x) => `<option>${x}</option>`).join("")}</select><fieldset><legend>Choose the feeling</legend><div class="mood-options">${MOODS.map((x, i) => `<label class="mood"><input type="radio" name="mood" value="${x}" ${i === 0 ? "checked" : ""}><span>${["☾", "✧", "◈"][i]} ${x}</span></label>`).join("")}</div></fieldset><button class="primary" id="generate" type="submit">Awaken this object <span>↗</span></button><button id="cancel" class="cancel" type="button" hidden>Stop awakening</button><p class="download-note">First awakening downloads an open model (~550 MB). Runs on your CPU; allow a few minutes. No API key or paid credits.</p><button class="sample-link" type="button" id="sample">Just looking? Read an included sample →</button><div id="progress-wrap" hidden><progress id="progress" max="100"></progress><p id="progress-text"></p></div><p id="status" role="status" aria-live="polite"></p></form><div class="story-panel" id="story-panel" tabindex="-1"><div id="empty-state"><p class="panel-kicker">THE STORY WAITING INSIDE</p><div class="empty-ghost" aria-hidden="true"><span>· ·</span></div><h3>Every object leaves an echo.</h3><p>Choose an object, a place, a feeling.<br>Then let something unexpected find you.</p><span class="empty-rule"></span><p class="small-note">Fictional ghosts only. Nothing here speaks<br>for a real person, living or remembered.</p></div><article id="story" hidden><div class="story-top"><span id="story-source" class="source-pill"></span><span class="story-number">GHOSTLIGHT / FIELD NOTES</span></div><h2 id="story-title"></h2><p class="story-meta" id="story-meta"></p><div id="story-body"></div><div class="story-actions"><button type="button" id="save">+ Keep in cabinet</button><button type="button" id="export">Export .md ↗</button></div><p class="story-footnote">An imagined fragment, not a factual account. Long outputs stop at the last complete sentence. AI can be strange in unintentional ways. Read before sharing.</p></article></div></div></section>
<section id="cabinet" aria-labelledby="cabinet-title"><div class="section-label"><span>02 / YOUR COLLECTION</span><span>Stored only in this browser</span></div><div class="cabinet-heading"><h2 id="cabinet-title">Things worth keeping.</h2><p>No cloud. No audience. Just your cabinet.</p></div><div id="cabinet-grid"></div><p id="storage-status" role="status"></p></section>
<section class="about"><span class="about-spark">✳</span><div><h2>The machine is open.<br>The mystery is yours.</h2><p>Ghostlight runs Qwen2.5, an Apache 2.0 open-weight language model, in your browser with Transformers.js. Your object and story aren't sent to an AI server. Model files download from Hugging Face; your browser may cache them. An internet connection is needed on first use.</p><a href="https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct" target="_blank" rel="noreferrer">Meet the model ↗</a></div></section></main><footer><span class="brand">✧ ghostlight.</span><span>A small cabinet of impossible things.</span><span>Made for Ghost in the Machine · 2026</span></footer><dialog id="remove-dialog"><h2>Let this story go?</h2><p>It will leave this browser’s cabinet. Export it first if you want a copy.</p><div><button id="keep-entry" type="button">Keep it</button><button id="confirm-remove" type="button">Remove story</button></div></dialog>`;
let worker = null,
  busy = false,
  current = null,
  pendingRemove = null,
  requestTimer = null,
  generationId = 0;
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
  };
}
let { entries, error } = readCabinet(storage);
$("#storage-status").textContent = error || "";
function renderCabinet() {
  const grid = $("#cabinet-grid");
  grid.replaceChildren();
  $("#count").textContent = String(entries.length);
  if (!entries.length) {
    const p = document.createElement("p");
    p.className = "cabinet-empty";
    p.textContent =
      "Your cabinet is quiet for now. Keep a story to give it a home.";
    grid.append(p);
    return;
  }
  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    const pill = document.createElement("span");
    pill.className = "card-source";
    pill.textContent =
      entry.source === "ai" ? "LOCAL AI FICTION" : "PRESET SAMPLE";
    const title = document.createElement("h3");
    title.textContent = entry.object;
    const excerpt = document.createElement("p");
    excerpt.textContent = entry.story.slice(0, 120) + "…";
    const buttons = document.createElement("div");
    const open = document.createElement("button");
    open.textContent = "Read story ↗";
    open.onclick = () => {
      display(entry);
      $("#story-panel").scrollIntoView({ behavior: "smooth", block: "center" });
      $("#story-panel").focus({ preventScroll: true });
    };
    const remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.className = "remove";
    remove.setAttribute("aria-label", `Remove ${entry.object}`);
    remove.onclick = () => {
      pendingRemove = entry.id;
      $("#remove-dialog").showModal();
    };
    buttons.append(open, remove);
    card.append(pill, title, excerpt, buttons);
    grid.append(card);
  });
}
function setBusy(value) {
  busy = value;
  $("#generate").disabled = value;
  $("#cancel").hidden = !value;
  $("#sample").disabled = value;
  $("#story-form").setAttribute("aria-busy", String(value));
  $("#progress-wrap").hidden = !value;
  if (!value) {
    clearTimeout(requestTimer);
    $("#progress").removeAttribute("value");
    $("#progress-text").textContent = "";
  }
}
function display(entry) {
  current = entry;
  $("#empty-state").hidden = true;
  $("#story").hidden = false;
  $("#story-title").textContent = entry.object;
  $("#story-meta").textContent = `${entry.setting} · ${entry.mood}`;
  $("#story-source").textContent =
    entry.source === "ai"
      ? "GENERATED ON YOUR DEVICE"
      : "PRESET SAMPLE · NOT GENERATED HERE";
  $("#story-body").replaceChildren();
  entry.story.split(/\n\s*\n/).forEach((t) => {
    const p = document.createElement("p");
    p.textContent = t;
    $("#story-body").append(p);
  });
  $("#save").disabled = entries.some((e) => e.id === entry.id);
  $("#save").textContent = $("#save").disabled
    ? "✓ In your cabinet"
    : "+ Keep in cabinet";
}
function stop(text) {
  generationId++;
  worker?.terminate();
  worker = null;
  setBusy(false);
  $("#status").textContent = text;
}
$("#cancel").onclick = () =>
  stop("Awakening stopped. Your existing stories are safe. You can try again.");
$("#story-form").onsubmit = (e) => {
  e.preventDefault();
  if (busy) return;
  let input;
  try {
    input = validateInput({
      object: $("#object").value,
      setting: $("#setting").value,
      mood: /** @type {HTMLInputElement} */ (
        document.querySelector("[name=mood]:checked")
      ).value,
    });
  } catch (err) {
    $("#status").textContent = err.message;
    return;
  }
  if (!window.Worker || !window.WebAssembly) {
    $("#status").textContent =
      "This browser does not support local AI workers. Try a current browser, or read the clearly labeled sample.";
    return;
  }
  const run = ++generationId;
  setBusy(true);
  $("#status").textContent = "Opening the cabinet…";
  try {
    worker ??= new Worker(new URL("./ai.worker.js", import.meta.url), {
      type: "module",
    });
    worker.onmessage = ({ data }) => {
      if (!busy || run !== generationId) return;
      if (data.type === "status") $("#status").textContent = data.text;
      if (data.type === "progress") {
        if (Number.isFinite(data.progress))
          $("#progress").value = data.progress;
        $("#progress-text").textContent =
          `Loading model file${Number.isFinite(data.progress) ? ` · ${Math.floor(data.progress)}%` : ""}`;
      }
      if (data.type === "complete") {
        setBusy(false);
        display({
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          source: "ai",
          story: data.story,
        });
        $("#status").textContent =
          "Your story is here. Read it, keep it, or awaken another.";
        $("#story-panel").focus({ preventScroll: true });
      }
      if (data.type === "error") {
        console.warn("Local model error:", data.text);
        stop(
          "The local model could not finish. Check your connection and available memory, then retry. No story was saved. You can also read the included sample.",
        );
      }
    };
    worker.onerror = () => {
      if (run === generationId)
        stop(
          "Local AI could not start in this browser. Retry in a current browser or read the included sample.",
        );
    };
    worker.postMessage({ type: "generate", input });
    requestTimer = setTimeout(
      () =>
        stop(
          "This awakening took too long and was stopped. Try again with a shorter object name or a faster device.",
        ),
      300000,
    );
  } catch {
    stop(
      "Local AI could not start. Your existing stories are safe. Try the sample instead.",
    );
  }
};
$("#sample").onclick = () => {
  if (busy) return;
  display({
    ...SAMPLE,
    id: "sample-brass-key",
    createdAt: new Date().toISOString(),
  });
  $("#status").textContent =
    "This is a preset example, not a result from your device. No model was downloaded.";
};
document.querySelectorAll("[data-object]").forEach((element) => {
  const button = /** @type {HTMLButtonElement} */ (element);
  button.onclick = () => {
    $("#object").value = button.dataset.object;
    $("#object").focus();
  };
});
$("#save").onclick = () => {
  if (!current || entries.some((e) => e.id === current.id)) return;
  if (entries.length >= 30) {
    $("#storage-status").textContent =
      "Your cabinet holds 30 stories. Remove one or export this story.";
    return;
  }
  const next = [current, ...entries];
  const err = writeCabinet(storage, next);
  $("#storage-status").textContent = err || "Story saved in this browser.";
  if (err) return;
  entries = next;
  renderCabinet();
  display(current);
};
$("#export").onclick = () => {
  if (!current) return;
  const blob = new Blob([toMarkdown(current)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ghostlight-${current.object.replace(/[^a-z0-9]/gi, "-").slice(0, 50)}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$("#keep-entry").onclick = () => {
  $("#remove-dialog").close();
  pendingRemove = null;
};
$("#remove-dialog").onclose = () => {
  pendingRemove = null;
};
$("#confirm-remove").onclick = () => {
  const next = entries.filter((e) => e.id !== pendingRemove);
  const err = writeCabinet(storage, next);
  $("#storage-status").textContent = err
    ? "This browser could not remove the saved story. It remains in your cabinet."
    : "Story removed.";
  if (!err) {
    entries = next;
    renderCabinet();
    if (current) display(current);
  }
  $("#remove-dialog").close();
};
renderCabinet();
