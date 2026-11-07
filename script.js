
// NAVIGATION

document.querySelectorAll(".nav-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-button").forEach(b =>
      b.classList.remove("active")
    );

    document.querySelectorAll(".page").forEach(p =>
      p.classList.remove("active")
    );

    button.classList.add("active");
    document.getElementById(button.dataset.page).classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});


// 1. MEMORY

const memoryGrid = document.getElementById("memory-grid");

let memoryOpen = [];
let memoryMoves = 0;
let memoryMatched = 0;
let memoryLocked = false;
let memoryTimer;

function startMemory() {
  clearTimeout(memoryTimer);

  memoryOpen = [];
  memoryMoves = 0;
  memoryMatched = 0;
  memoryLocked = false;

  document.getElementById("moves").textContent = "0";
  document.getElementById("pairs").textContent = "0";
  document.getElementById("memory-message").textContent =
    "Wähle zwei Karten aus.";

  const cards = [
    { text: "10. August 1792", pair: 0 },
    { text: "Hinrichtung Ludwig XVI.", pair: 1 },
    { text: "14. Juli 1789", pair: 2 },
    { text: "Erklärung der Menschen- und Bürgerrechte", pair: 3 },
    { text: "Napoleons Machtübernahme", pair: 4 },
    { text: "26. August 1789", pair: 3 },
    { text: "Sturz der Monarchie", pair: 0 },
    { text: "Schreckensherrschaft", pair: 5 },
    { text: "Sturm auf die Bastille", pair: 2 },
    { text: "1793 bis 1794", pair: 5 },
    { text: "1799", pair: 4 },
    { text: "21. Januar 1793", pair: 1 }
  ];

  const shuffled = [...cards].sort(() => Math.random() - 0.5);

  memoryGrid.innerHTML = "";

  shuffled.forEach(card => {
    const button = document.createElement("button");

    button.className = "memory-card";
    button.type = "button";
    button.textContent = card.text;
    button.setAttribute("aria-label", "Verdeckte Memory-Karte");

    button.addEventListener("click", () =>
      flipMemory(button, card)
    );

    memoryGrid.appendChild(button);
  });
}

function flipMemory(button, card) {
  if (
    memoryLocked ||
    button.classList.contains("revealed") ||
    button.classList.contains("matched")
  ) return;

  button.classList.add("revealed");
  button.setAttribute("aria-label", card.text);

  memoryOpen.push({ button, card });

  if (memoryOpen.length !== 2) return;

  memoryMoves++;
  document.getElementById("moves").textContent = memoryMoves;

  const [first, second] = memoryOpen;

  if (first.card.pair === second.card.pair) {
    [first, second].forEach(item => {
      item.button.classList.add("matched");
      item.button.classList.remove("revealed");
      item.button.disabled = true;
    });

    memoryMatched++;

    document.getElementById("pairs").textContent = memoryMatched;

    document.getElementById("memory-message").textContent =
      memoryMatched === 6
        ? "🎉 Du hast alle sechs Paare gefunden!"
        : "Richtiges Paar!";

    memoryOpen = [];

  } else {
    memoryLocked = true;

    document.getElementById("memory-message").textContent =
      "Leider falsch. Die Karten drehen sich in zwei Sekunden wieder um.";

    memoryTimer = setTimeout(() => {
      [first, second].forEach(item => {
        item.button.classList.remove("revealed");
        item.button.setAttribute(
          "aria-label",
          "Verdeckte Memory-Karte"
        );
      });

      memoryOpen = [];
      memoryLocked = false;

      document.getElementById("memory-message").textContent =
        "Versuche es weiter.";
    }, 2000);
  }
}

document.getElementById("memory-reset")
  .addEventListener("click", startMemory);

startMemory();


// 2. SUCHSEL – FRANZÖSISCHE REVOLUTION

const searchWords = [
  "STEUERN",
  "STÄNDEGESELLSCHAFT",
  "DRITTERSTAND",
  "MENSCHENRECHTE",
  "MONARCHIE",
  "REPUBLIK",
  "STAATSVERSCHULDUNG",
  "HUNGERSNOT",
  "GLEICHHEIT",
  "GESELLSCHAFT"
];

const searchSize = 18;

const crosswordGrid = document.getElementById("crossword-grid");
const crosswordWordList = document.getElementById("crossword-word-list");
const crosswordMessage = document.getElementById("crossword-message");
const crosswordProgress = document.getElementById("crossword-progress");

let searchBoard = [];
let searchPositions = {};
let foundWords = new Set();
let firstSelected = null;

const searchDirections = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
];

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function createSearchBoard() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ";

  for (let attempt = 0; attempt < 1000; attempt++) {
    const board = Array.from(
      { length: searchSize },
      () => Array(searchSize).fill("")
    );

    const positions = {};
    let success = true;

    // Lange Wörter zuerst einsetzen
    const sortedWords = [...searchWords].sort(
      (a, b) => b.length - a.length
    );

    for (const word of sortedWords) {
      const candidates = [];

      for (const [dr, dc] of searchDirections) {
        for (let row = 0; row < searchSize; row++) {
          for (let col = 0; col < searchSize; col++) {
            const endRow = row + (word.length - 1) * dr;
            const endCol = col + (word.length - 1) * dc;

            if (
              endRow < 0 || endRow >= searchSize ||
              endCol < 0 || endCol >= searchSize
            ) continue;

            const cells = [];
            let valid = true;

            for (let i = 0; i < word.length; i++) {
              const r = row + i * dr;
              const c = col + i * dc;

              // Wörter dürfen sich nicht überlagern
              if (board[r][c] !== "") {
                valid = false;
                break;
              }

              cells.push([r, c]);
            }

            if (valid) candidates.push(cells);
          }
        }
      }

      if (candidates.length === 0) {
        success = false;
        break;
      }

      const chosen = shuffleArray(candidates)[0];

      chosen.forEach(([r, c], i) => {
        board[r][c] = word[i];
      });

      positions[word] = chosen;
    }

    if (success) {
      // Freie Felder mit Zufallsbuchstaben auffüllen
      for (let r = 0; r < searchSize; r++) {
        for (let c = 0; c < searchSize; c++) {
          if (!board[r][c]) {
            board[r][c] =
              alphabet[Math.floor(Math.random() * alphabet.length)];
          }
        }
      }

      searchBoard = board;
      searchPositions = positions;

      return;
    }
  }

  throw new Error("Das Suchsel konnte nicht erstellt werden.");
}

function renderSearchBoard() {
  crosswordGrid.innerHTML = "";
  crosswordWordList.innerHTML = "";
  firstSelected = null;

  searchBoard.forEach((row, r) => {
    row.forEach((letter, c) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "crossword-cell";
      button.textContent = letter;

      button.dataset.row = r;
      button.dataset.col = c;

      button.setAttribute(
        "aria-label",
        `Zeile ${r + 1}, Spalte ${c + 1}: ${letter}`
      );

      button.addEventListener("click", () => {
        selectSearchCell(r, c, button);
      });

      crosswordGrid.appendChild(button);
    });
  });

  searchWords.forEach(word => {
    const item = document.createElement("span");

    item.className = "crossword-word";
    item.id = `search-word-${word}`;
    item.textContent = word;

    crosswordWordList.appendChild(item);
  });

  updateSearchProgress();
}

function selectSearchCell(row, col, button) {
  if (button.classList.contains("found")) return;

  // Ersten Buchstaben auswählen
  if (!firstSelected) {
    firstSelected = { row, col, button };

    button.classList.add("selected");

    crosswordMessage.textContent =
      "Wähle jetzt den letzten Buchstaben des Wortes.";

    return;
  }

  const first = firstSelected;

  const dr = row - first.row;
  const dc = col - first.col;

  const isStraight =
    dr === 0 ||
    dc === 0 ||
    Math.abs(dr) === Math.abs(dc);

  // Ungültige Auswahl wird zum neuen Startpunkt
  if (!isStraight || (dr === 0 && dc === 0)) {
    first.button.classList.remove("selected");

    firstSelected = { row, col, button };
    button.classList.add("selected");

    crosswordMessage.textContent =
      "Wähle einen gültigen Anfangs- und Endpunkt.";

    return;
  }

  const stepRow = Math.sign(dr);
  const stepCol = Math.sign(dc);
  const length = Math.max(Math.abs(dr), Math.abs(dc)) + 1;

  let selectedLetters = "";
  const selectedCells = [];

  for (let i = 0; i < length; i++) {
    const r = first.row + i * stepRow;
    const c = first.col + i * stepCol;

    selectedLetters += searchBoard[r][c];

    const cell = crosswordGrid.querySelector(
      `[data-row="${r}"][data-col="${c}"]`
    );

    selectedCells.push(cell);
  }

  const reversedLetters =
    [...selectedLetters].reverse().join("");

  const matchingWord = searchWords.find(word =>
    !foundWords.has(word) &&
    (
      word === selectedLetters ||
      word === reversedLetters
    )
  );

  first.button.classList.remove("selected");
  firstSelected = null;

  if (matchingWord) {
    foundWords.add(matchingWord);

    selectedCells.forEach(cell => {
      cell.classList.add("found");
    });

    document
      .getElementById(`search-word-${matchingWord}`)
      .classList.add("solved");

    crosswordMessage.textContent =
      `Richtig! Du hast "${matchingWord}" gefunden!`;

    updateSearchProgress();

    if (foundWords.size === searchWords.length) {
      crosswordMessage.textContent =
        "🎉 Glückwunsch! Du hast alle zehn Wörter gefunden!";
    }

  } else {
    crosswordMessage.textContent =
      "Kein passendes Wort gefunden. Versuche es erneut.";
  }
}

function updateSearchProgress() {
  crosswordProgress.textContent = foundWords.size;
}

function resetSearch() {
  foundWords = new Set();
  firstSelected = null;

  createSearchBoard();
  renderSearchBoard();

  crosswordMessage.textContent =
    "Finde alle zehn Wörter im Buchstabenfeld!";
}

document.getElementById("crossword-reset")
  .addEventListener("click", resetSearch);

resetSearch();


// 3. PERSONEN-ZUORDNUNGSSPIEL

const people = [
  { id: "louis", text: "Ludwig XVI." },
  { id: "marie", text: "Marie Antoinette" },
  { id: "robespierre", text: "Maximilien de Robespierre" },
  { id: "danton", text: "Georges Jacques Danton" },
  { id: "napoleon", text: "Napoleon Bonaparte" }
];

const descriptions = [
  { id: "louis", text: "Flucht nach Varennes und Anklage als Bürger Capet" },
  { id: "marie", text: "Anklage wegen Hochverrats" },
  { id: "robespierre", text: "Revolutionsführer und Unterstützer der Schreckensherrschaft" },
  { id: "danton", text: "Revolutionsführer und Gegner der Schreckensherrschaft" },
  { id: "napoleon", text: "Alleinherrscher und später Kaiser" }
];

const peopleGrid = document.getElementById("people-grid");

let firstPersonCard = null;
let peopleLocked = false;
let peopleMatched = new Set();
let peopleTimer;

function startPeople() {
  clearTimeout(peopleTimer);

  firstPersonCard = null;
  peopleLocked = false;
  peopleMatched = new Set();

  document.getElementById("people-pairs").textContent = "0";

  document.getElementById("people-message").textContent =
    "Wähle zwei passende Kärtchen aus.";

  const cards = [
    ...people.map(item => ({ ...item, kind: "person" })),
    ...descriptions.map(item => ({ ...item, kind: "description" }))
  ];

  const shuffled = [...cards].sort(() => Math.random() - 0.5);

  peopleGrid.innerHTML = "";

  shuffled.forEach(item => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "match-card";
    button.textContent = item.text;
    button.dataset.id = item.id;
    button.dataset.kind = item.kind;

    button.addEventListener("click", () =>
      choosePersonCard(button)
    );

    peopleGrid.appendChild(button);
  });
}

function choosePersonCard(card) {
  if (
    peopleLocked ||
    card.disabled ||
    card === firstPersonCard
  ) return;

  card.classList.add("selected");

  if (!firstPersonCard) {
    firstPersonCard = card;
    return;
  }

  const first = firstPersonCard;
  const second = card;

  if (
    first.dataset.id === second.dataset.id &&
    first.dataset.kind !== second.dataset.kind
  ) {
    [first, second].forEach(item => {
      item.classList.remove("selected");
      item.classList.add("matched");
      item.disabled = true;
    });

    peopleMatched.add(first.dataset.id);

    document.getElementById("people-pairs").textContent =
      peopleMatched.size;

    document.getElementById("people-message").textContent =
      peopleMatched.size === 5
        ? "🎉 Alle fünf Personen richtig zugeordnet!"
        : "Richtiges Paar! Suche das nächste.";

    firstPersonCard = null;

  } else {
    first.classList.add("wrong");
    second.classList.add("wrong");

    peopleLocked = true;

    document.getElementById("people-message").textContent =
      "Das passt nicht. Versuche es erneut.";

    peopleTimer = setTimeout(() => {
      first.classList.remove("selected", "wrong");
      second.classList.remove("selected", "wrong");

      firstPersonCard = null;
      peopleLocked = false;
    }, 1000);
  }
}

document.getElementById("people-reset")
  .addEventListener("click", startPeople);

startPeople();


// 4. LÜCKENTEXTE ÜBER FRAUEN DER REVOLUTION

const womenData = [
  {
    title: "Die Marktfrauen",
    text: "Die Marktfrauen waren Frauen, die auf den Pariser {{Lebensmittel}}- und {{Fischmärkten}} arbeiteten. Sie waren bekannt für ihre {{Direktheit}}, Schlagfertigkeit und ihren starken {{sozialen}} Zusammenhalt. Am 5. Oktober 1789 begann der {{Frauenmarsch}} nach Versailles, der berühmte {{Zug der Marktfrauen}}. Eine wichtige {{Massendemonstration}}. Der Auslöser für den Marsch waren eine schwere {{Hungersnot}} und extrem hohe Brotpreise. Es nahmen etwa {{7000}} Frauen teil. Die Marktfrauen forderten {{billiges Brot}} und die Abschaffung der feudalen Vorrechte.",
    words: [
      "Lebensmittel", "Fischmärkten", "Direktheit", "sozialen",
      "Frauenmarsch", "Zug der Marktfrauen", "Massendemonstration",
      "Hungersnot", "7000", "billiges Brot"
    ]
  },
  {
    title: "Olympe de Gouges",
    text: "{{Olympe de Gouges}} war eine {{Schriftstellerin}} und stand politisch für {{Gleichheit und Frauenrechte}}. Sie forderte {{Steuergerechtigkeit}}: Da Frauen ebenso wie Männer Steuern zahlten, sollten sie auch bei der Verwaltung und {{Gesetzgebung}} mitbestimmen. Olympe de Gouges forderte die Abschaffung des {{patriarchalen}} Eheschutzes, das Recht auf {{Ehescheidung}} und eine bessere Stellung {{unverheirateter}} Mütter und unehelicher Kinder. Ihre Zeitgenossen lehnten ihre Forderungen ab und reagierten mit {{Feindseligkeit}}. Olympe de Gouges wurde als Verschwörerin bezeichnet und am 3. November 1793 hingerichtet.",
    words: [
      "Olympe de Gouges", "Schriftstellerin",
      "Gleichheit und Frauenrechte", "Steuergerechtigkeit",
      "Gesetzgebung", "patriarchalen", "Ehescheidung",
      "unverheirateter", "Feindseligkeit"
    ]
  },
  {
    title: "Madame Roland",
    text: "{{Madame Roland}} hatte Einfluss auf die Politik durch ihren Mann, der {{Innenminister}} war. Madame Roland führte einen Salon, der ein zentraler Treffpunkt für führende Köpfe der {{Girondisten}} war, darunter Jacques Pierre Brissot und François Buzot. Dort wurden {{politische}} Reden, {{Strategien}} und Schriften mitgestaltet. Madame Roland wurde wegen des Machtkampfs zwischen den Girondisten und den {{radikalen}} Jakobinern am {{8. November 1793}} hingerichtet. Sie galt trotzdem als {{Seele}} und {{Vordenkerin}} der Girondisten.",
    words: [
      "Madame Roland", "Innenminister", "Girondisten",
      "politische", "Strategien", "radikalen",
      "8. November 1793", "Seele", "Vordenkerin"
    ]
  }
];

const womenExercises = document.getElementById("women-exercises");
const womenScore = document.getElementById("women-score");
const womenTotal = document.getElementById("women-total");
const womenMessage = document.getElementById("women-message");

let selectedWordChip = null;

function renderWomen() {
  selectedWordChip = null;
  womenExercises.innerHTML = "";

  womenData.forEach(exercise => {
    const card = document.createElement("article");
    card.className = "women-card";

    const heading = document.createElement("h3");
    heading.textContent = exercise.title;

    const text = document.createElement("p");
    text.className = "women-text";

    exercise.text.split(/(\{\{.*?\}\})/g).forEach(part => {
      const match = part.match(/^\{\{(.*?)\}\}$/);

      if (!match) {
        text.appendChild(document.createTextNode(part));
        return;
      }

      const answer = match[1];

      const slot = document.createElement("button");

      slot.type = "button";
      slot.className = "drop-slot empty";
      slot.textContent = "________";
      slot.dataset.answer = answer;
      slot.dataset.filled = "";

      slot.setAttribute("aria-label", "Lücke");

      slot.addEventListener("click", () =>
        placeSelectedWord(slot)
      );

      slot.addEventListener("dragover", event =>
        event.preventDefault()
      );

      slot.addEventListener("drop", event => {
        event.preventDefault();

        placeWordInSlot(
          slot,
          event.dataTransfer.getData("text/plain")
        );
      });

      text.appendChild(slot);
    });

    const bank = document.createElement("div");
    bank.className = "word-bank";

    [...exercise.words]
      .sort(() => Math.random() - 0.5)
      .forEach(word => {
        const chip = document.createElement("button");

        chip.type = "button";
        chip.className = "word-chip";
        chip.textContent = word;
        chip.dataset.word = word;
        chip.draggable = true;

        chip.addEventListener("click", () => {
          if (chip.classList.contains("used")) return;

          if (selectedWordChip) {
            selectedWordChip.classList.remove("selected");
          }

          selectedWordChip = chip;
          chip.classList.add("selected");

          womenMessage.textContent =
            `„${word}“ ausgewählt. Tippe jetzt auf die passende Lücke.`;
        });

        chip.addEventListener("dragstart", event => {
          event.dataTransfer.setData("text/plain", word);
        });

        bank.appendChild(chip);
      });

    card.append(heading, text, bank);
    womenExercises.appendChild(card);
  });

  womenTotal.textContent =
    womenExercises.querySelectorAll(".drop-slot").length;

  updateWomenScore();

  womenMessage.textContent =
    "Ziehe ein Wort in eine Lücke oder tippe erst das Wort und dann die Lücke an.";
}

function placeSelectedWord(slot) {
  if (selectedWordChip) {
    placeWordInSlot(slot, selectedWordChip.dataset.word);

    selectedWordChip.classList.remove("selected");
    selectedWordChip = null;
    return;
  }

  if (slot.dataset.filled) {
    const usedChip = [
      ...womenExercises.querySelectorAll(".word-chip.used")
    ].find(chip => chip.dataset.word === slot.dataset.filled);

    if (usedChip) usedChip.classList.remove("used");

    slot.dataset.filled = "";
    slot.textContent = "________";

    slot.classList.add("empty");
    slot.classList.remove("correct", "wrong");

    updateWomenScore();

  } else {
    womenMessage.textContent =
      "Wähle zuerst ein Wort aus der Wortleiste aus.";
  }
}

function placeWordInSlot(slot, word) {
  if (slot.dataset.filled) {
    womenMessage.textContent =
      "Entferne zuerst das Wort, das bereits in dieser Lücke liegt.";
    return;
  }

  const chip = [
    ...womenExercises.querySelectorAll(".word-chip")
  ].find(item =>
    item.dataset.word === word &&
    !item.classList.contains("used")
  );

  if (!chip) {
    womenMessage.textContent =
      "Dieses Wort wurde bereits verwendet.";
    return;
  }

  slot.dataset.filled = word;
  slot.textContent = word;

  slot.classList.remove("empty", "correct", "wrong");
  chip.classList.add("used");

  updateWomenScore();
}

function updateWomenScore() {
  const slots = [
    ...womenExercises.querySelectorAll(".drop-slot")
  ];

  const correct = slots.filter(slot =>
    slot.dataset.filled &&
    slot.dataset.filled === slot.dataset.answer
  ).length;

  womenScore.textContent = correct;
}

function checkWomen() {
  const slots = [
    ...womenExercises.querySelectorAll(".drop-slot")
  ];

  let correct = 0;

  slots.forEach(slot => {
    slot.classList.remove("correct", "wrong");

    if (slot.dataset.filled === slot.dataset.answer) {
      slot.classList.add("correct");
      correct++;
    } else {
      slot.classList.add("wrong");
    }
  });

  womenScore.textContent = correct;

  womenMessage.textContent =
    correct === slots.length
      ? "🎉 Alle Lücken sind richtig ausgefüllt!"
      : `${correct} von ${slots.length} Lücken sind richtig. Prüfe die roten Felder.`;
}

document.getElementById("women-check")
  .addEventListener("click", checkWomen);

document.getElementById("women-reset")
  .addEventListener("click", renderWomen);

renderWomen();


// 5. GUILLOTINEN-QUIZ

const quizQuestions = [
  {
    q: "Wofür wurde die Guillotine hauptsächlich verwendet?",
    options: [
      "Zum Schreiben von Gesetzen",
      "Zur Hinrichtung von Menschen",
      "Als Kriegswaffe"
    ],
    answer: 1
  },
  {
    q: "In welcher Revolution wurde die Guillotine besonders bekannt?",
    options: [
      "Amerikanische Revolution",
      "Französische Revolution",
      "Industrielle Revolution"
    ],
    answer: 1
  },
  {
    q: "Warum wurde die Guillotine ursprünglich als humaner angesehen?",
    options: [
      "Sie sollte eine schnelle Hinrichtung ermöglichen",
      "Sie sollte niemanden verletzen",
      "Sie wurde nur zur Abschreckung benutzt"
    ],
    answer: 0
  },
  {
    q: "Wie hieß der Arzt, nach dem die Guillotine benannt wurde?",
    options: [
      "Ludwig XVI.",
      "Joseph-Ignace Guillotin",
      "Napoleon Bonaparte"
    ],
    answer: 1
  },
  {
    q: "In welcher Zeit wurden während der Revolution besonders viele Menschen hingerichtet?",
    options: [
      "Während der Terrorherrschaft",
      "Während der Renaissance",
      "Während des Mittelalters"
    ],
    answer: 0
  },
  {
    q: "Welcher französische König wurde während der Revolution mit der Guillotine hingerichtet?",
    options: [
      "Ludwig XVI.",
      "Ludwig XIV.",
      "Karl der Große"
    ],
    answer: 0
  },
  {
    q: "Wo fanden die Hinrichtungen in Paris statt?",
    options: [
      "Auf öffentlichen Plätzen",
      "Nur im Gefängnis",
      "Ausschließlich in Schlössern"
    ],
    answer: 0
  },
  {
    q: "Wer wurde ebenfalls während der Terrorherrschaft hingerichtet?",
    options: [
      "Maximilien de Robespierre",
      "Julius Caesar",
      "Napoleon Bonaparte"
    ],
    answer: 0
  },
  {
    q: "Was sollte die Guillotine auch symbolisieren?",
    options: [
      "Gleichheit bei der Bestrafung",
      "Reichtum des Königs",
      "Die Macht der Kirche"
    ],
    answer: 0
  },
  {
    q: "Was geschah mit der Guillotine nach der Französischen Revolution?",
    options: [
      "Sie wurde sofort weltweit verboten",
      "Sie blieb in Frankreich noch lange als Hinrichtungsinstrument in Gebrauch",
      "Sie wurde nur noch als Dekoration benutzt"
    ],
    answer: 1
  }
];

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const quizSubmit = document.getElementById("quiz-submit");
const quizNext = document.getElementById("quiz-next");
const quizRestart = document.getElementById("quiz-restart");

function renderQuiz() {
  quizAnswered = false;

  const item = quizQuestions[quizIndex];

  document.getElementById("quiz-progress").textContent =
    quizIndex + 1;

  document.getElementById("quiz-score").textContent =
    quizScore;

  quizQuestion.textContent =
    `${quizIndex + 1}. ${item.q}`;

  quizOptions.innerHTML = "";

  item.options.forEach((option, index) => {
    const label = document.createElement("label");
    label.className = "quiz-option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "quiz-answer";
    radio.value = index;

    const text = document.createElement("span");

    text.textContent =
      `${String.fromCharCode(65 + index)}: ${option}`;

    label.append(radio, text);
    quizOptions.appendChild(label);
  });

  quizFeedback.textContent = "";

  quizSubmit.hidden = false;
  quizNext.hidden = true;
  quizRestart.hidden = true;
}

quizSubmit.addEventListener("click", () => {
  if (quizAnswered) return;

  const selected = quizOptions.querySelector(
    'input[name="quiz-answer"]:checked'
  );

  if (!selected) {
    quizFeedback.textContent =
      "Bitte wähle zuerst eine Antwort aus.";
    return;
  }

  quizAnswered = true;

  const chosen = Number(selected.value);
  const correct = quizQuestions[quizIndex].answer;

  [...quizOptions.children].forEach((label, index) => {
    label.querySelector("input").disabled = true;

    if (index === correct) {
      label.classList.add("correct");
    }

    if (index === chosen && chosen !== correct) {
      label.classList.add("incorrect");
    }
  });

  if (chosen === correct) {
    quizScore++;

    quizFeedback.textContent =
      "✓ Richtig! Du erhältst einen Punkt.";

  } else {
    quizScore--;

    quizFeedback.textContent =
      "✕ Leider falsch. Ein Punkt wird abgezogen.";
  }

  document.getElementById("quiz-score").textContent =
    quizScore;

  quizSubmit.hidden = true;

  if (quizIndex < quizQuestions.length - 1) {
    quizNext.hidden = false;

  } else {
    quizFeedback.textContent +=
      ` Quiz beendet! Dein Endstand: ${quizScore} Punkt(e).`;

    quizRestart.hidden = false;
  }
});

quizNext.addEventListener("click", () => {
  quizIndex++;
  renderQuiz();
});

quizRestart.addEventListener("click", () => {
  quizIndex = 0;
  quizScore = 0;
  renderQuiz();
});

renderQuiz();
