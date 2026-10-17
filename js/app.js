/* ===== Paso a Paso: Leo Puerto Rico — Lógica de la aplicación ===== */
(function () {
  "use strict";

  /* ---------- Storage ---------- */
  const Store = {
    get(key, def) {
      try { const v = localStorage.getItem("pasoapaso_" + key); return v ? JSON.parse(v) : def; }
      catch (e) { return def; }
    },
    set(key, val) {
      try { localStorage.setItem("pasoapaso_" + key, JSON.stringify(val)); } catch (e) {}
    },
    remove(key) { try { localStorage.removeItem("pasoapaso_" + key); } catch (e) {} },
    clearAll() {
      Object.keys(localStorage).filter(k => k.startsWith("pasoapaso_")).forEach(k => localStorage.removeItem(k));
    },
  };

  /* ---------- Voice ---------- */
  const Voice = {
    synth: window.speechSynthesis,
    enabled: true,
    rate: 0.9,
    voice: null,

    init() {
      this.enabled = Store.get("soundEnabled", true);
      this.rate = Store.get("voiceRate", 0.9);
      this.loadVoices();
      if (this.synth) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    },

    loadVoices() {
      if (!this.synth) return;
      const voices = this.synth.getVoices();
      // Prefer Spanish female voice
      this.voice = voices.find(v => /es[-_]?(PR|MX|ES|US)/i.test(v.lang) && /female|mujer|google|mónica|paulina|helena/i.test(v.name))
        || voices.find(v => v.lang && v.lang.startsWith("es"))
        || null;
      const status = document.getElementById("voice-status");
      if (status) {
        if (this.voice) {
          status.textContent = "Voz disponible: " + this.voice.name + " (" + this.voice.lang + ")";
        } else {
          status.textContent = "La voz en español depende de las opciones disponibles en este dispositivo. Puedes leer las instrucciones en pantalla o pedir apoyo a una persona adulta.";
        }
      }
    },

    speak(text) {
      if (!this.synth || !this.enabled) return;
      this.synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-PR";
      u.rate = this.rate;
      if (this.voice) u.voice = this.voice;
      u.pitch = 1.1;
      this.synth.speak(u);
    },

    toggle() {
      this.enabled = !this.enabled;
      Store.set("soundEnabled", this.enabled);
      if (!this.enabled) this.synth.cancel();
      return this.enabled;
    },

    setRate(r) { this.rate = r; Store.set("voiceRate", r); },
  };

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function today() { return new Date().toLocaleDateString("es-PR"); }

  function showToast(msg, ms) {
    const t = $("#feedback-toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.hidden = true; }, ms || 2500);
  }

  function feedback(msg, type) {
    const icon = type === "success" ? "✅" : "💡";
    return `<div class="act-feedback ${type}" role="status"><span class="feedback-icon" aria-hidden="true">${icon}</span> ${msg}</div>`;
  }

  /* ---------- Progress ---------- */
  const Progress = {
    data: null,
    init() {
      this.data = Store.get("progress", {
        sonidos: { count: 0, lastDate: null },
        silabas: { count: 0, lastDate: null },
        palabras: { count: 0, lastDate: null },
        frases: { count: 0, lastDate: null },
        biblioteca: { count: 0, lastDate: null },
      });
    },
    record(skill) {
      if (!this.data[skill]) this.data[skill] = { count: 0, lastDate: null };
      this.data[skill].count++;
      this.data[skill].lastDate = today();
      Store.set("progress", this.data);
      this.updateRuta();
    },
    clear() {
      this.data = {};
      ["sonidos","silabas","palabras","frases","biblioteca"].forEach(s => { this.data[s] = { count:0, lastDate:null }; });
      Store.set("progress", this.data);
      this.updateRuta();
    },
    updateRuta() {
      const steps = DATA.rutaSteps;
      const skillMap = { sonidos:["sonidos","sonidos"], silabas:["silabas"], palabras:["palabras"], frases:["frases"], biblioteca:["biblioteca"] };
      const list = $("#ruta-list");
      if (!list) return;
      list.innerHTML = "";
      steps.forEach(step => {
        const skills = skillMap[step.section] || [];
        const total = skills.reduce((a, s) => a + (this.data[s]?.count || 0), 0);
        let status = "pendiente", statusText = "Listo para practicar";
        if (total > 0) { status = "en-practica"; statusText = "En práctica"; }
        if (total >= 3) { status = "completado"; statusText = "Completado"; }
        const li = el("li", "ruta-step");
        li.innerHTML = `
          <span class="ruta-step-num">${step.num}</span>
          <span class="ruta-step-text">${step.text}</span>
          <span class="ruta-status ${status}">${statusText}</span>
          <button class="btn-secondary" data-nav="${step.section}">Practicar</button>`;
        list.appendChild(li);
      });
    },
    render() {
      const grid = $("#progress-grid");
      if (!grid) return;
      grid.innerHTML = "";
      const skills = [
        { key:"sonidos", icon:"🔤", label:"Sonidos y letras" },
        { key:"silabas", icon:"🧩", label:"Sílabas" },
        { key:"palabras", icon:"📖", label:"Palabras" },
        { key:"frases", icon:"✏️", label:"Frases" },
        { key:"biblioteca", icon:"📚", label:"Biblioteca" },
      ];
      skills.forEach(s => {
        const d = this.data[s.key] || { count:0, lastDate:null };
        const card = el("div", "progress-card");
        card.innerHTML = `
          <div class="progress-icon" aria-hidden="true">${s.icon}</div>
          <div class="progress-count">${d.count}</div>
          <div class="progress-label">${s.label}</div>
          <div class="progress-date">${d.lastDate ? "Última práctica: " + d.lastDate : "Sin práctica aún"}</div>`;
        grid.appendChild(card);
      });
    },
  };

  /* ---------- Observation records ---------- */
  const Observations = {
    list: null,
    init() { this.list = Store.get("observations", []); },
    add(obs) { this.list.push(obs); Store.set("observations", this.list); this.render(); },
    remove(idx) { this.list.splice(idx, 1); Store.set("observations", this.list); this.render(); },
    render() {
      const c = $("#observation-list");
      if (!c) return;
      c.innerHTML = "";
      if (this.list.length === 0) {
        c.innerHTML = "<p style=\"color:var(--terracota);font-size:0.9rem\">No hay registros guardados.</p>";
        return;
      }
      this.list.forEach((o, i) => {
        const d = el("div", "obs-item");
        d.innerHTML = `<span><strong>${o.date}</strong> — ${o.skill} | Apoyo: ${o.support} | ${o.response} | Próximo: ${o.next}</span>
          <button class="btn-secondary" data-obs-del="${i}" aria-label="Borrar registro">🗑️ Borrar</button>`;
        c.appendChild(d);
      });
    },
    exportCSV() {
      let csv = "Fecha,Habilidad,Apoyo,Respuesta,Proximo paso\n";
      this.list.forEach(o => {
        csv += `"${o.date}","${o.skill}","${o.support}","${o.response}","${o.next}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "registro_observacion.csv";
      a.click();
    },
  };

  /* ---------- Navigation ---------- */
  function navigate(sectionId) {
    $all(".page-section").forEach(s => s.classList.remove("active"));
    const sec = document.getElementById(sectionId);
    if (sec) sec.classList.add("active");
    $all(".nav-link").forEach(l => l.classList.toggle("active", l.dataset.section === sectionId));
    const indicator = $("#section-indicator");
    if (indicator) {
      const link = $(`.nav-link[data-section="${sectionId}"]`);
      indicator.textContent = link ? link.textContent : sectionId;
    }
    // Close mobile menu
    const nav = $("#main-nav");
    if (window.innerWidth < 768) nav.hidden = true;
    // Scroll to top of main
    $("#main-content").scrollIntoView({ behavior: "smooth", block: "start" });
    // Section-specific renders
    if (sectionId === "ruta") Progress.updateRuta();
    if (sectionId === "progreso") Progress.render();
    if (sectionId === "maestra") Observations.render();
    if (sectionId === "sonidos") Sonidos.renderGroups();
    if (sectionId === "palabras") Palabras.renderLevels();
    if (sectionId === "frases") Frases.render();
    if (sectionId === "biblioteca") Biblioteca.renderBooks();
  }

  /* ---------- Sonidos y Letras ---------- */
  const Sonidos = {
    currentGroup: 0,

    renderGroups() {
      const container = $("#sonidos-groups");
      container.innerHTML = "";
      const groups = Store.get("consonantGroups", DATA.consonantGroups);
      groups.forEach((g, i) => {
        if (!g.active) return;
        const btn = el("button", "group-btn" + (i === this.currentGroup ? " active" : ""), g.name);
        btn.dataset.group = i;
        btn.setAttribute("role", "tab");
        btn.addEventListener("click", () => { this.currentGroup = i; this.renderGroups(); this.renderCards(); });
        container.appendChild(btn);
      });
      this.renderCards();
    },

    renderCards() {
      const container = $("#sonidos-cards");
      const actArea = $("#sonidos-activity");
      container.innerHTML = "";
      actArea.innerHTML = "";
      const groups = Store.get("consonantGroups", DATA.consonantGroups);
      const activeGroups = groups.filter(g => g.active);
      if (activeGroups.length === 0) return;
      const group = activeGroups[this.currentGroup] || activeGroups[0];
      group.letters.forEach(letterKey => {
        const lt = DATA.letters[letterKey];
        if (!lt) return;
        const card = el("div", "letter-card");
        card.innerHTML = `
          <div class="letter-big" aria-label="Letra ${lt.upper} ${lt.lower}">${lt.upper} ${lt.lower}</div>
          <span class="model-emoji" aria-hidden="true">${lt.emoji}</span>
          <div class="word-model">${lt.words[0]}</div>
          <div class="card-btns">
            <button class="btn-secondary" data-speak="${lt.upper}. ${lt.words[0]}">🔊 Escuchar</button>
            <button class="btn-secondary" data-act="sonido-quiz" data-letter="${letterKey}">Practicar</button>
          </div>`;
        container.appendChild(card);
      });
    },

    quiz(letterKey) {
      const lt = DATA.letters[letterKey];
      if (!lt) return;
      const groups = Store.get("consonantGroups", DATA.consonantGroups);
      const allLetters = groups.filter(g => g.active).flatMap(g => g.letters)
        .map(k => DATA.letters[k]).filter(Boolean);
      const distractors = shuffle(allLetters.filter(l => l.upper !== lt.upper)).slice(0, 2);
      const options = shuffle([lt, ...distractors]);
      const maxOpts = parseInt(Store.get("maxOptions", "3"));
      const finalOpts = options.slice(0, Math.min(maxOpts, options.length));

      const area = $("#sonidos-activity");
      area.innerHTML = `
        <p class="act-question">¿Cuál letra hace el sonido /${lt.sound}/?</p>
        <div class="act-options" role="group" aria-label="Opciones de respuesta"></div>
        <div class="act-hints">
          <button class="btn-secondary" data-speak="${lt.upper}. ${lt.words[0]}">🔊 Escuchar de nuevo</button>
          <button class="btn-secondary" data-act="sonido-show-example" data-letter="${letterKey}">Ver ejemplo</button>
        </div>`;
      const optsContainer = $(".act-options", area);
      finalOpts.forEach(opt => {
        const btn = el("button", "act-option", opt.upper);
        btn.setAttribute("aria-label", "Letra " + opt.upper);
        btn.addEventListener("click", () => {
          if (opt.upper === lt.upper) {
            btn.classList.add("correct");
            area.insertAdjacentHTML("beforeend", feedback(pick(DATA.feedback.correct), "success"));
            this.addContinueBtn(area, "sonidos");
            Progress.record("sonidos");
            Voice.speak("¡Muy bien! Encontraste la letra " + lt.upper);
          } else {
            btn.classList.add("incorrect");
            area.insertAdjacentHTML("beforeend", feedback(pick(DATA.feedback.retry), "retry"));
            Voice.speak("Intentémoslo otra vez. Escucha el sonido y mira la letra.");
          }
          $all(".act-option", area).forEach(b => b.disabled = true);
        });
        optsContainer.appendChild(btn);
      });
      Voice.speak("¿Cuál letra hace el sonido " + lt.sound + "?");
    },

    showExample(letterKey) {
      const lt = DATA.letters[letterKey];
      if (!lt) return;
      const area = $("#sonidos-activity");
      area.insertAdjacentHTML("beforeend",
        `<div class="act-feedback success"><span class="feedback-icon">💡</span> Ejemplo: La letra ${lt.upper} suena en la palabra <strong>${lt.words[0]}</strong> ${lt.emoji}</div>`);
      Voice.speak(lt.upper + ". " + lt.words[0]);
    },

    addContinueBtn(area, section) {
      const btn = el("button", "btn-primary", "Continuar");
      btn.addEventListener("click", () => navigate(section));
      area.appendChild(el("div", "", "")).appendChild(btn);
    },
  };

  /* ---------- Sílabas ---------- */
  const Silabas = {
    currentTab: "construir",

    init() {
      $all("[data-silaba-tab]").forEach(btn => {
        btn.addEventListener("click", () => {
          this.currentTab = btn.dataset.silabaTab;
          $all("[data-silaba-tab]").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected","false"); });
          btn.classList.add("active"); btn.setAttribute("aria-selected","true");
          this.render();
        });
      });
      this.render();
    },

    getActiveConsonants() {
      const groups = Store.get("consonantGroups", DATA.consonantGroups);
      return groups.filter(g => g.active).flatMap(g => g.letters).filter(k => DATA.letters[k]);
    },

    render() {
      if (this.currentTab === "construir") this.renderBuilder();
      else if (this.currentTab === "completar") this.renderComplete();
      else if (this.currentTab === "encontrar") this.renderFind();
    },

    renderBuilder() {
      const area = $("#silabas-activity");
      const consonants = this.getActiveConsonants();
      const vowels = DATA.vowels;
      area.innerHTML = `
        <p class="act-question">Construyo una sílaba: Selecciona una consonante y una vocal.</p>
        <div class="silaba-builder">
          <label for="sel-consonant">Consonante</label>
          <select id="sel-consonant" aria-label="Seleccionar consonante">
            ${consonants.map(c => `<option value="${c}">${DATA.letters[c].upper}</option>`).join("")}
          </select>
          <span style="font-size:2rem;font-weight:700">+</span>
          <label for="sel-vowel">Vocal</label>
          <select id="sel-vowel" aria-label="Seleccionar vocal">
            ${vowels.map(v => `<option value="${v}">${v.toUpperCase()}</option>`).join("")}
          </select>
          <span style="font-size:2rem;font-weight:700">=</span>
        </div>
        <div class="silaba-result" id="silaba-result" aria-live="polite"></div>
        <div style="text-align:center;display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" id="btn-speak-silaba">🔊 Escuchar sílaba</button>
          <button class="btn-secondary" id="btn-new-silaba">Intentar otra combinación</button>
        </div>`;

      const update = () => {
        const c = $("#sel-consonant").value;
        const v = $("#sel-vowel").value;
        const lt = DATA.letters[c];
        const syllable = lt.lower + v;
        $("#silaba-result").textContent = syllable.toUpperCase();
        $("#btn-speak-silaba").onclick = () => { Voice.speak(syllable); Progress.record("silabas"); };
      };
      $("#sel-consonant").addEventListener("change", update);
      $("#sel-vowel").addEventListener("change", update);
      $("#btn-new-silaba").addEventListener("click", () => {
        $("#sel-consonant").value = pick(consonants);
        $("#sel-vowel").value = pick(vowels);
        update();
      });
      update();
    },

    renderComplete() {
      const area = $("#silabas-activity");
      const words = DATA.words[1].concat(DATA.words[2]);
      const word = pick(words.filter(w => w.syllables.length >= 2));
      if (!word) { area.innerHTML = "<p>No hay palabras disponibles.</p>"; return; }
      const missingIdx = 0;
      const missing = word.syllables[missingIdx];
      const otherSyllables = ["ma","pa","sa","la","ta","na","da","ca","ba","lo","to","no","de","se","me"];
      const distractors = shuffle(otherSyllables.filter(s => s !== missing)).slice(0, 2);
      const maxOpts = parseInt(Store.get("maxOptions", "3"));
      const options = shuffle([missing, ...distractors]).slice(0, Math.min(maxOpts, 3));

      area.innerHTML = `
        <p class="act-question">Completa la palabra: <span style="font-size:2rem;font-weight:700">_ ${word.syllables.slice(1).join(" ")}</span></p>
        <div style="text-align:center;font-size:4rem;margin:1rem 0">${word.emoji}</div>
        <p style="text-align:center;font-size:1.1rem">¿Cuál sílaba falta al principio?</p>
        <div class="act-options" role="group" aria-label="Opciones de sílaba"></div>`;
      const optsC = $(".act-options", area);
      options.forEach(opt => {
        const btn = el("button", "act-option", opt.toUpperCase());
        btn.addEventListener("click", () => {
          $all(".act-option", area).forEach(b => b.disabled = true);
          if (opt === missing) {
            btn.classList.add("correct");
            area.insertAdjacentHTML("beforeend", feedback("¡Muy bien! La palabra es " + word.text + ".", "success"));
            Voice.speak(word.text);
            Progress.record("silabas");
          } else {
            btn.classList.add("incorrect");
            area.insertAdjacentHTML("beforeend", feedback(pick(DATA.feedback.retry) + " La sílaba correcta es " + missing.toUpperCase() + ".", "retry"));
            Voice.speak("Intentémoslo otra vez");
          }
          area.appendChild(this.againBtn());
        });
        optsC.appendChild(btn);
      });
      Voice.speak("Completa la palabra. " + word.text);
    },

    renderFind() {
      const area = $("#silabas-activity");
      const consonants = this.getActiveConsonants();
      const c = pick(consonants);
      const v = pick(DATA.vowels);
      const target = DATA.letters[c].lower + v;
      const others = ["ma","pa","sa","la","ta","na","de","se","lo","to","ca","ba","no","me"];
      const distractors = shuffle(others.filter(s => s !== target)).slice(0, 2);
      const maxOpts = parseInt(Store.get("maxOptions", "3"));
      const options = shuffle([target, ...distractors]).slice(0, Math.min(maxOpts, 3));

      area.innerHTML = `
        <p class="act-question">Encuentra la sílaba que escuchas.</p>
        <div class="act-hints" style="margin-bottom:1rem">
          <button class="btn-secondary" id="btn-find-listen">🔊 Escuchar la sílaba</button>
        </div>
        <div class="act-options" role="group" aria-label="Opciones de sílaba"></div>`;
      $("#btn-find-listen").addEventListener("click", () => Voice.speak(target));
      const optsC = $(".act-options", area);
      options.forEach(opt => {
        const btn = el("button", "act-option", opt.toUpperCase());
        btn.addEventListener("click", () => {
          $all(".act-option", area).forEach(b => b.disabled = true);
          if (opt === target) {
            btn.classList.add("correct");
            area.insertAdjacentHTML("beforeend", feedback("¡Muy bien! Esa es la sílaba " + target.toUpperCase() + ".", "success"));
            Voice.speak("¡Muy bien!");
            Progress.record("silabas");
          } else {
            btn.classList.add("incorrect");
            area.insertAdjacentHTML("beforeend", feedback(pick(DATA.feedback.retry) + " Escucha otra vez.", "retry"));
            Voice.speak("Intentémoslo otra vez");
          }
          area.appendChild(this.againBtn());
        });
        optsC.appendChild(btn);
      });
      Voice.speak(target);
    },

    againBtn() {
      const btn = el("button", "btn-primary", "Practicar otra vez");
      btn.addEventListener("click", () => this.render());
      return btn;
    },
  };

  /* ---------- Palabras ---------- */
  const Palabras = {
    currentLevel: 1,
    currentTab: "une",

    renderLevels() {
      const container = $("#palabras-levels");
      container.innerHTML = "";
      Object.keys(DATA.words).forEach(lvl => {
        const btn = el("button", "level-btn" + (parseInt(lvl) === this.currentLevel ? " active" : ""), "Nivel " + lvl);
        btn.addEventListener("click", () => { this.currentLevel = parseInt(lvl); this.renderLevels(); this.renderDisplay(); this.renderActivity(); });
        container.appendChild(btn);
      });
      this.renderDisplay();
      this.renderActivity();
    },

    renderDisplay() {
      const container = $("#palabras-display");
      const words = DATA.words[this.currentLevel] || [];
      if (words.length === 0) { container.innerHTML = ""; return; }
      const word = words[0];
      container.innerHTML = `
        <span class="word-emoji" aria-hidden="true">${word.emoji}</span>
        <span class="word-text">${word.text}</span>
        <div class="word-btns">
          <button class="btn-secondary" data-speak="${word.text}">🔊 Escuchar palabra</button>
          <button class="btn-secondary" data-speak="${word.syllables.join('... ')}">📖 Leer conmigo</button>
        </div>`;
    },

    init() {
      $all("[data-palabra-tab]").forEach(btn => {
        btn.addEventListener("click", () => {
          this.currentTab = btn.dataset.palabraTab;
          $all("[data-palabra-tab]").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected","false"); });
          btn.classList.add("active"); btn.setAttribute("aria-selected","true");
          this.renderActivity();
        });
      });
    },

    renderActivity() {
      if (this.currentTab === "une") this.renderUne();
      else if (this.currentTab === "ordena") this.renderOrdena();
      else if (this.currentTab === "escucha") this.renderEscucha();
      else if (this.currentTab === "lee") this.renderLee();
    },

    renderUne() {
      const area = $("#palabras-activity");
      const words = DATA.words[this.currentLevel] || [];
      const word = pick(words);
      const distractors = shuffle(words.filter(w => w.text !== word.text)).slice(0, 2);
      const maxOpts = parseInt(Store.get("maxOptions", "3"));
      const options = shuffle([word, ...distractors]).slice(0, Math.min(maxOpts, 3));

      area.innerHTML = `<p class="act-question">¿Cuál palabra corresponde a la imagen?</p>
        <div style="text-align:center;font-size:4rem;margin:1rem 0">${word.emoji}</div>
        <div class="act-options" role="group" aria-label="Opciones de palabra"></div>`;
      const optsC = $(".act-options", area);
      options.forEach(opt => {
        const btn = el("button", "act-option", opt.text);
        btn.style.fontSize = "1.3rem";
        btn.addEventListener("click", () => {
          $all(".act-option", area).forEach(b => b.disabled = true);
          if (opt.text === word.text) {
            btn.classList.add("correct");
            area.insertAdjacentHTML("beforeend", feedback("¡Muy bien! Esa es la palabra " + word.text + ".", "success"));
            Voice.speak(word.text);
            Progress.record("palabras");
          } else {
            btn.classList.add("incorrect");
            area.insertAdjacentHTML("beforeend", feedback(pick(DATA.feedback.retry) + " La palabra es " + word.text + ".", "retry"));
            Voice.speak("Intentémoslo otra vez");
          }
          area.appendChild(this.againBtn());
        });
        optsC.appendChild(btn);
      });
    },

    renderOrdena() {
      const area = $("#palabras-activity");
      const words = (DATA.words[this.currentLevel] || []).filter(w => w.syllables.length >= 2);
      const word = pick(words);
      if (!word) { area.innerHTML = "<p>No hay palabras disponibles.</p>"; return; }
      const syls = shuffle(word.syllables.slice());

      area.innerHTML = `
        <p class="act-question">Ordena las sílabas para formar la palabra.</p>
        <div style="text-align:center;font-size:4rem;margin:1rem 0">${word.emoji}</div>
        <div class="act-options" id="ordena-syls" role="group" aria-label="Sílabas para ordenar"></div>
        <div class="silaba-result" id="ordena-result" aria-live="polite"></div>
        <div style="text-align:center;display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" id="btn-check-ordena">Comprobar</button>
          <button class="btn-secondary" id="btn-reset-ordena">Empezar de nuevo</button>
        </div>`;
      const sylsC = $("#ordena-syls");
      const selected = [];
      const renderSyls = () => {
        sylsC.innerHTML = "";
        syls.forEach((s, i) => {
          if (selected.includes(i)) return;
          const btn = el("button", "act-option", s.toUpperCase());
          btn.addEventListener("click", () => { selected.push(i); updateResult(); renderSyls(); });
          sylsC.appendChild(btn);
        });
      };
      const updateResult = () => {
        $("#ordena-result").textContent = selected.map(i => syls[i].toUpperCase()).join(" + ");
      };
      renderSyls();
      $("#btn-check-ordena").addEventListener("click", () => {
        const result = selected.map(i => syls[i]).join("");
        if (result === word.text) {
          area.insertAdjacentHTML("beforeend", feedback("¡Muy bien! Formaste la palabra " + word.text + ".", "success"));
          Voice.speak(word.text);
          Progress.record("palabras");
        } else {
          area.insertAdjacentHTML("beforeend", feedback(pick(DATA.feedback.retry) + " La palabra es " + word.text + ".", "retry"));
          Voice.speak("Intentémoslo otra vez");
        }
        area.appendChild(this.againBtn());
      });
      $("#btn-reset-ordena").addEventListener("click", () => this.renderOrdena());
    },

    renderEscucha() {
      const area = $("#palabras-activity");
      const words = DATA.words[this.currentLevel] || [];
      const word = pick(words);
      const distractors = shuffle(words.filter(w => w.text !== word.text)).slice(0, 2);
      const maxOpts = parseInt(Store.get("maxOptions", "3"));
      const options = shuffle([word, ...distractors]).slice(0, Math.min(maxOpts, 3));

      area.innerHTML = `
        <p class="act-question">Escucha la palabra y selecciona la imagen correcta.</p>
        <div class="act-hints" style="margin-bottom:1rem">
          <button class="btn-secondary" id="btn-escucha-listen">🔊 Escuchar palabra</button>
        </div>
        <div class="act-options" role="group" aria-label="Opciones de imagen"></div>`;
      $("#btn-escucha-listen").addEventListener("click", () => Voice.speak(word.text));
      const optsC = $(".act-options", area);
      options.forEach(opt => {
        const btn = el("button", "act-option", opt.emoji);
        btn.style.fontSize = "3rem";
        btn.setAttribute("aria-label", "Imagen de " + opt.text);
        btn.addEventListener("click", () => {
          $all(".act-option", area).forEach(b => b.disabled = true);
          if (opt.text === word.text) {
            btn.classList.add("correct");
            area.insertAdjacentHTML("beforeend", feedback("¡Muy bien! Esa es " + word.text + ".", "success"));
            Voice.speak("¡Muy bien! " + word.text);
            Progress.record("palabras");
          } else {
            btn.classList.add("incorrect");
            area.insertAdjacentHTML("beforeend", feedback(pick(DATA.feedback.retry) + " La palabra era " + word.text + ".", "retry"));
            Voice.speak("Intentémoslo otra vez");
          }
          area.appendChild(this.againBtn());
        });
        optsC.appendChild(btn);
      });
      Voice.speak(word.text);
    },

    renderLee() {
      const area = $("#palabras-activity");
      const words = DATA.words[this.currentLevel] || [];
      const word = pick(words);
      area.innerHTML = `
        <p class="act-question">Lee la palabra. Puedes escuchar el modelo y luego intentarlo.</p>
        <div style="text-align:center;font-size:4rem;margin:1rem 0">${word.emoji}</div>
        <div class="silaba-result">${word.text}</div>
        <div style="text-align:center;display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" id="btn-lee-model">🔊 Escuchar modelo</button>
          <button class="btn-secondary" id="btn-lee-silabas">📖 Leer por sílabas</button>
          <button class="btn-secondary" id="btn-lee-again">Practicar otra vez</button>
        </div>`;
      $("#btn-lee-model").addEventListener("click", () => { Voice.speak(word.text); Progress.record("palabras"); });
      $("#btn-lee-silabas").addEventListener("click", () => Voice.speak(word.syllables.join("... ")));
      $("#btn-lee-again").addEventListener("click", () => this.renderLee());
      Voice.speak(word.text);
    },

    againBtn() {
      const btn = el("button", "btn-primary", "Practicar otra vez");
      btn.addEventListener("click", () => this.renderActivity());
      return btn;
    },
  };

  /* ---------- Frases ---------- */
  const Frases = {
    currentIdx: 0,

    render() {
      this.currentIdx = 0;
      this.showCurrent();
    },

    showCurrent() {
      const area = $("#frases-activity");
      const phrase = DATA.phrases[this.currentIdx];
      if (!phrase) { area.innerHTML = "<p>No hay frases disponibles.</p>"; return; }

      area.innerHTML = `
        <p class="act-question">Frase ${this.currentIdx + 1} de ${DATA.phrases.length}</p>
        <div style="text-align:center;font-size:4rem;margin:1rem 0">${phrase.emoji}</div>
        <p class="silaba-result" style="font-size:1.8rem">${phrase.text}</p>
        <div style="text-align:center;margin:1rem 0">
          <button class="btn-primary" data-speak="${phrase.text}">🔊 Escuchar frase</button>
        </div>
        <div class="transcript" style="margin:1rem 0"><p><strong>Transcripción:</strong> ${phrase.text}</p></div>
        <h3 style="font-size:1.15rem;margin:1rem 0">${phrase.question}</h3>
        <div class="act-options" role="group" aria-label="Opciones de respuesta"></div>
        <div id="frase-feedback"></div>
        <div style="text-align:center;display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;margin-top:1rem">
          <button class="btn-secondary" id="btn-frase-prev" ${this.currentIdx === 0 ? "disabled" : ""}>⬅ Anterior</button>
          <button class="btn-secondary" id="btn-frase-repeat">Repetir frase</button>
          <button class="btn-primary" id="btn-frase-next" ${this.currentIdx === DATA.phrases.length - 1 ? "disabled" : ""}>Siguiente ➡</button>
        </div>`;

      const optsC = $(".act-options", area);
      phrase.options.forEach((opt, i) => {
        const btn = el("button", "act-option", opt);
        btn.style.fontSize = "1.1rem";
        btn.addEventListener("click", () => {
          $all(".act-option", area).forEach(b => b.disabled = true);
          const fb = $("#frase-feedback");
          if (i === phrase.answer) {
            btn.classList.add("correct");
            fb.innerHTML = feedback("¡Muy bien! " + opt + " es la respuesta correcta.", "success");
            Voice.speak("¡Muy bien! " + opt);
            Progress.record("frases");
          } else {
            btn.classList.add("incorrect");
            fb.innerHTML = feedback(pick(DATA.feedback.retry) + " Escucha la frase otra vez.", "retry");
            Voice.speak("Intentémoslo otra vez");
          }
        });
        optsC.appendChild(btn);
      });

      $("#btn-frase-prev").addEventListener("click", () => { if (this.currentIdx > 0) { this.currentIdx--; this.showCurrent(); } });
      $("#btn-frase-next").addEventListener("click", () => { if (this.currentIdx < DATA.phrases.length - 1) { this.currentIdx++; this.showCurrent(); } });
      $("#btn-frase-repeat").addEventListener("click", () => Voice.speak(phrase.text));
    },
  };

  /* ---------- Biblioteca ---------- */
  const Biblioteca = {
    currentBook: 0,
    currentPage: 0,

    renderBooks() {
      const container = $("#biblioteca-books");
      container.innerHTML = "";
      DATA.books.forEach((book, i) => {
        const btn = el("button", "book-btn" + (i === this.currentBook ? " active" : ""), book.title);
        btn.addEventListener("click", () => { this.currentBook = i; this.currentPage = 0; this.renderBooks(); this.renderReader(); });
        container.appendChild(btn);
      });
      this.renderReader();
    },

    renderReader() {
      const container = $("#biblioteca-reader");
      const book = DATA.books[this.currentBook];
      if (!book) { container.innerHTML = ""; return; }
      const page = book.pages[this.currentPage];
      const isLast = this.currentPage === book.pages.length - 1;

      container.innerHTML = `
        <h3 style="text-align:center;margin-bottom:1rem">${book.title}</h3>
        <p style="text-align:center;font-size:0.9rem;color:var(--terracota)">Página ${this.currentPage + 1} de ${book.pages.length}</p>
        <div class="book-page">
          <span class="page-emoji" aria-hidden="true">${page.emoji}</span>
          <p class="page-text">${page.text}</p>
        </div>
        <div class="book-controls">
          <button class="btn-secondary" id="btn-book-prev" ${this.currentPage === 0 ? "disabled" : ""}>⬅ Anterior</button>
          <button class="btn-primary" data-speak="${page.text}">🔊 Escuchar</button>
          <button class="btn-secondary" id="btn-book-replay">Volver a leer</button>
          <button class="btn-primary" id="btn-book-next" ${isLast ? "disabled" : ""}>Siguiente ➡</button>
        </div>
        <div id="book-question"></div>`;

      $("#btn-book-prev").addEventListener("click", () => { if (this.currentPage > 0) { this.currentPage--; this.renderReader(); } });
      $("#btn-book-next").addEventListener("click", () => { if (this.currentPage < book.pages.length - 1) { this.currentPage++; this.renderReader(); } });
      $("#btn-book-replay").addEventListener("click", () => Voice.speak(page.text));

      if (isLast && page.question) {
        const qArea = $("#book-question");
        qArea.innerHTML = `<h3 style="font-size:1.15rem;margin:1rem 0">${page.question}</h3>
          <div class="act-options" role="group" aria-label="Opciones de respuesta"></div>
          <div id="book-feedback"></div>`;
        const optsC = $(".act-options", qArea);
        page.options.forEach((opt, i) => {
          const btn = el("button", "act-option", opt);
          btn.addEventListener("click", () => {
            $all(".act-option", qArea).forEach(b => b.disabled = true);
            const fb = $("#book-feedback");
            if (i === page.answer) {
              btn.classList.add("correct");
              fb.innerHTML = feedback("¡Muy bien! " + opt + " es la respuesta.", "success");
              Voice.speak("¡Muy bien! " + opt);
              Progress.record("biblioteca");
            } else {
              btn.classList.add("incorrect");
              fb.innerHTML = feedback(pick(DATA.feedback.retry), "retry");
              Voice.speak("Intentémoslo otra vez");
            }
          });
          optsC.appendChild(btn);
        });
      }
    },
  };

  /* ---------- Teacher mode ---------- */
  const Teacher = {
    active: false,

    toggle() {
      this.active = !this.active;
      $("#teacher-panel").hidden = !this.active;
      $("#btn-teacher-mode").textContent = this.active ? "Desactivar Modo maestra" : "Activar Modo maestra";
      if (this.active) this.renderControls();
    },

    renderControls() {
      const groups = Store.get("consonantGroups", DATA.consonantGroups);
      const container = $("#teacher-group-toggles");
      container.innerHTML = "";
      groups.forEach((g, i) => {
        const lbl = el("label", "");
        lbl.innerHTML = `<input type="checkbox" data-group-toggle="${i}" ${g.active ? "checked" : ""}> ${g.name}`;
        container.appendChild(lbl);
      });
      $all("[data-group-toggle]", container).forEach(cb => {
        cb.addEventListener("change", () => {
          const idx = parseInt(cb.dataset.groupToggle);
          groups[idx].active = cb.checked;
          Store.set("consonantGroups", groups);
        });
      });

      const maxOpts = $("#teacher-max-options");
      maxOpts.value = Store.get("maxOptions", "3");
      maxOpts.addEventListener("change", () => Store.set("maxOptions", maxOpts.value));

      this.renderProgress();
    },

    renderProgress() {
      const container = $("#teacher-progress-view");
      const progress = Store.get("progress", {});
      const observations = Store.get("observations", []);
      let html = "<h4>Resumen de progreso local</h4><table><thead><tr><th>Habilidad</th><th>Actividades completadas</th><th>Última fecha</th></tr></thead><tbody>";
      ["sonidos","silabas","palabras","frases","biblioteca"].forEach(s => {
        const d = progress[s] || { count:0, lastDate:null };
        html += `<tr><td>${s}</td><td>${d.count}</td><td>${d.lastDate || "—"}</td></tr>`;
      });
      html += "</tbody></table>";
      html += `<h4>Registros de observación (${observations.length})</h4>`;
      if (observations.length > 0) {
        html += "<table><thead><tr><th>Fecha</th><th>Habilidad</th><th>Apoyo</th><th>Respuesta</th><th>Próximo paso</th></tr></thead><tbody>";
        observations.forEach(o => {
          html += `<tr><td>${o.date}</td><td>${o.skill}</td><td>${o.support}</td><td>${o.response}</td><td>${o.next}</td></tr>`;
        });
        html += "</tbody></table>";
      } else {
        html += "<p>No hay registros de observación.</p>";
      }
      container.innerHTML = html;
    },

    exportCSV() {
      const progress = Store.get("progress", {});
      const observations = Store.get("observations", []);
      let csv = "Tipo,Detalle\n";
      ["sonidos","silabas","palabras","frases","biblioteca"].forEach(s => {
        const d = progress[s] || { count:0, lastDate:null };
        csv += `"Progreso - ${s}","Completadas: ${d.count}, Última fecha: ${d.lastDate || '—'}"\n`;
      });
      csv += "\nFecha,Habilidad,Apoyo,Respuesta,Proximo paso\n";
      observations.forEach(o => {
        csv += `"${o.date}","${o.skill}","${o.support}","${o.response}","${o.next}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "resumen_progreso.csv";
      a.click();
    },

    resetContent() {
      Store.remove("consonantGroups");
      Store.remove("maxOptions");
      showToast("Contenido de ejemplo restablecido.");
      this.renderControls();
    },
  };

  /* ---------- Init ---------- */
  function init() {
    Voice.init();
    Progress.init();
    Observations.init();

    // Font size
    let fontSize = Store.get("fontSize", 20);
    document.documentElement.style.setProperty("--font-size", fontSize + "px");
    $("#btn-text-increase").addEventListener("click", () => {
      fontSize = Math.min(28, fontSize + 2); Store.set("fontSize", fontSize);
      document.documentElement.style.setProperty("--font-size", fontSize + "px");
    });
    $("#btn-text-decrease").addEventListener("click", () => {
      fontSize = Math.max(16, fontSize - 2); Store.set("fontSize", fontSize);
      document.documentElement.style.setProperty("--font-size", fontSize + "px");
    });

    // High contrast
    if (Store.get("highContrast", false)) document.body.classList.add("high-contrast");
    $("#btn-contrast").addEventListener("click", () => {
      document.body.classList.toggle("high-contrast");
      Store.set("highContrast", document.body.classList.contains("high-contrast"));
    });

    // Sound toggle
    const soundBtn = $("#btn-sound-toggle");
    function updateSoundBtn() {
      soundBtn.textContent = Voice.enabled ? "🔊" : "🔇";
      soundBtn.setAttribute("aria-pressed", String(Voice.enabled));
    }
    updateSoundBtn();
    soundBtn.addEventListener("click", () => { Voice.toggle(); updateSoundBtn(); showToast(Voice.enabled ? "Sonido activado" : "Sonido apagado"); });

    // Voice speed
    const speedSel = $("#voice-speed");
    speedSel.value = String(Voice.rate);
    speedSel.addEventListener("change", () => Voice.setRate(parseFloat(speedSel.value)));

    // Menu toggle
    const menuToggle = $("#menu-toggle");
    const nav = $("#main-nav");
    menuToggle.addEventListener("click", () => {
      nav.hidden = !nav.hidden;
      menuToggle.setAttribute("aria-expanded", String(!nav.hidden));
    });

    // Nav links
    $all(".nav-link").forEach(link => {
      link.addEventListener("click", () => navigate(link.dataset.section));
    });

    // Data-nav buttons (delegated)
    document.addEventListener("click", (e) => {
      const navTarget = e.target.closest("[data-nav]");
      if (navTarget) { navigate(navTarget.dataset.nav); return; }
      const speakTarget = e.target.closest("[data-speak]");
      if (speakTarget) { Voice.speak(speakTarget.dataset.speak); return; }
      const actTarget = e.target.closest("[data-act]");
      if (actTarget) {
        const act = actTarget.dataset.act;
        if (act === "sonido-quiz") Sonidos.quiz(actTarget.dataset.letter);
        else if (act === "sonido-show-example") Sonidos.showExample(actTarget.dataset.letter);
      }
      const obsDel = e.target.closest("[data-obs-del]");
      if (obsDel) { Observations.remove(parseInt(obsDel.dataset.obsDel)); }
    });

    // Keyboard nav for cards
    $all(".nav-card").forEach(card => {
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(card.dataset.nav); } });
    });

    // Welcome audio
    $("#btn-welcome-audio").addEventListener("click", () => {
      Voice.speak("Bienvenida a Paso a Paso: Leo Puerto Rico. Aquí aprendemos paso a paso. Podemos mirar, escuchar, practicar y volver a intentarlo todas las veces que necesitemos.");
      $("#welcome-transcript").hidden = false;
    });

    // Back to top
    const backBtn = $("#back-to-top");
    window.addEventListener("scroll", () => {
      backBtn.classList.toggle("visible", window.scrollY > 300);
    });
    backBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    // Observation form
    $("#observation-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const obs = {
        date: $("#obs-date").value || today(),
        skill: $("#obs-skill").value,
        support: $("#obs-support").value,
        response: $("#obs-response").value || "",
        next: $("#obs-next").value || "",
      };
      Observations.add(obs);
      e.target.reset();
      showToast("Registro guardado en este dispositivo.");
    });
    $("#btn-export-obs").addEventListener("click", () => Observations.exportCSV());
    $("#btn-print-guide").addEventListener("click", () => window.print());

    // Progress actions
    $("#btn-clear-progress").addEventListener("click", () => {
      if (confirm("¿Borrar todo el progreso guardado en este dispositivo?")) {
        Progress.clear();
        Progress.render();
        showToast("Progreso borrado.");
      }
    });
    $("#btn-print-progress").addEventListener("click", () => window.print());

    // Teacher mode
    $("#btn-teacher-mode").addEventListener("click", () => Teacher.toggle());
    $("#btn-export-progress").addEventListener("click", () => Teacher.exportCSV());
    $("#btn-clear-progress-teacher").addEventListener("click", () => {
      if (confirm("¿Borrar todo el progreso y registros de este dispositivo?")) {
        Progress.clear();
        Observations.list = []; Store.set("observations", []);
        Observations.render();
        Teacher.renderProgress();
        showToast("Datos borrados.");
      }
    });
    $("#btn-reset-content").addEventListener("click", () => Teacher.resetContent());

    // Init activities
    Silabas.init();
    Palabras.init();

    // Set default date
    const dateInput = $("#obs-date");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    // Navigate to inicio
    navigate("inicio");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
