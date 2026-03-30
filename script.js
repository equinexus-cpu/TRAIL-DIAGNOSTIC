// ============================================================
// CONFIGURATION
// ============================================================

// Steps:Connecting Front-end and back-end
// Apps Script → Deploy → New Deployment → Web App
//        Execute as: Me | Who has access: Anyone → Deploy → Copy URL
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwKuXevzoCWV2MXXsrnNnFYaVltEElomV5Da7lpoCWWLHrANDMS8wKz48qZiZ2E2ynE/exec';

// ============================================================
// SURVEY DATA
// ============================================================

const DIMENSIONS = [
  {
    id: "T",
    name: "Trust",
    code: "T",
    section: 1,
    desc: "How relational capital, psychological safety, and behavioural consistency function in your organisation.",
    questions: [
      { id: "T1", text: "Leaders in this organisation consistently do what they say they will do." },
      { id: "T2", text: "It is safe to raise concerns or share a dissenting view without fear of repercussion." },
      { id: "T3", text: "Conflicts in this organisation are addressed directly rather than managed around or ignored." },
      { id: "T4", text: "Trust between teams and across functions is strong enough to support honest collaboration." },
      { id: "T5", text: "The way decisions are made here feels fair and transparent to those affected by them." }
    ]
  },
  {
    id: "R",
    name: "Resilience",
    code: "R",
    section: 2,
    desc: "The organisation's structural capacity to absorb pressure, recover from shocks, and sustain functioning.",
    questions: [
      { id: "R1", text: "People in this organisation have the time and space they need to do their best work." },
      { id: "R2", text: "When the organisation goes through significant change, people are supported to absorb it well." },
      { id: "R3", text: "Workloads here are sustainable over the long term, not just in the short term." },
      { id: "R4", text: "There are practices, rhythms, or systems in this organisation that help people recover and restore." },
      { id: "R5", text: "Leaders model sustainable working practices rather than only demanding them of others." }
    ]
  },
  {
    id: "A",
    name: "Alignment",
    code: "A",
    section: 3,
    desc: "Coherence between strategic priorities, actual working priorities, and resource allocation.",
    questions: [
      { id: "A1", text: "The stated strategic priorities of this organisation are the same as the actual working priorities." },
      { id: "A2", text: "Teams across this organisation work in a coordinated way toward shared goals." },
      { id: "A3", text: "When different parts of the organisation have competing priorities, there is a clear way to resolve them." },
      { id: "A4", text: "Resource allocation reflects the stated strategic priorities." },
      { id: "A5", text: "Leaders speak about organisational priorities in a consistent and coherent way." }
    ]
  },
  {
    id: "I",
    name: "Identity",
    code: "I",
    section: 4,
    desc: "Connection to purpose, lived values, and the founding narrative that gives the culture its definition.",
    questions: [
      { id: "I1", text: "The values of this organisation are visibly lived in everyday behaviour, not just stated in documents." },
      { id: "I2", text: "People in this organisation feel a strong sense of connection to what we stand for." },
      { id: "I3", text: "There is a clear and compelling sense of organisational identity that people can articulate." },
      { id: "I4", text: "Our culture is strong enough to remain intact during significant change or leadership transition." },
      { id: "I5", text: "When faced with a difficult decision, our values are a genuinely useful guide." }
    ]
  },
  {
    id: "L",
    name: "Leadership Clarity",
    code: "L",
    section: 5,
    desc: "Clarity of direction, decision rights, and the shared framework for how leadership shows up.",
    questions: [
      { id: "L1", text: "Leaders in this organisation make decisions clearly and in a timely manner." },
      { id: "L2", text: "There is a shared understanding of how leadership is expected to show up in this organisation." },
      { id: "L3", text: "Leaders communicate direction in a way that is clear enough for people to act on confidently." },
      { id: "L4", text: "Leadership in this organisation is distributed enough that it does not depend on one or two individuals." },
      { id: "L5", text: "When people do not meet leadership expectations here, there is a clear and respectful accountability process." }
    ]
  },
  {
    id: "P",
    name: "Power & Stewardship",
    code: "P",
    section: 6,
    desc: "How authority is exercised, whether decisions are experienced as legitimate, and whether people have genuine agency.",
    questions: [
      { id: "P1", text: "Authority in this organisation is exercised in ways that the people it affects experience as legitimate." },
      { id: "P2", text: "The way decisions are actually made matches the way they are supposed to be made." },
      { id: "P3", text: "Power is distributed widely enough that no single individual or group holds it inappropriately." },
      { id: "P4", text: "Leaders here are genuinely accountable — not just in formal processes, but in practice." },
      { id: "P5", text: "People here have genuine agency: the ability to influence outcomes that affect them." }
    ]
  }
];

const SCALE = [
  { val: 1, label: "Not at all true" },
  { val: 2, label: "Rarely true" },
  { val: 3, label: "Sometimes true" },
  { val: 4, label: "Often true" },
  { val: 5, label: "Almost always true" }
];

// ============================================================
// STATE
// ============================================================

let currentSection = 0;
const answers = {};

// ============================================================
// BUILD SURVEY SECTIONS
// ============================================================

function buildSections() {
  const main = document.querySelector('.main');
  const submitSection = document.getElementById('sec-7');

  DIMENSIONS.forEach((dim, idx) => {
    const secId = `sec-${idx + 1}`;
    const div = document.createElement('div');
    div.className = 'section-card';
    div.id = secId;

    const qHtml = dim.questions.map(q => `
      <div class="question-block" id="qb-${q.id}">
        <div class="question-code">${q.id}</div>
        <div class="question-text">${q.text}</div>
        <div class="likert-row">
          ${SCALE.map(s => `
            <div class="likert-option">
              <input type="radio" name="${q.id}" id="${q.id}_${s.val}" value="${s.val}" onchange="recordAnswer('${q.id}',${s.val})">
              <label for="${q.id}_${s.val}">
                <span class="likert-num">${s.val}</span>
                <span class="likert-label">${s.label}</span>
              </label>
            </div>`).join('')}
        </div>
        <div class="scale-labels"><span>Not at all true</span><span>Almost always true</span></div>
      </div>`).join('');

    div.innerHTML = `
      <div class="dim-banner">
        <div class="dim-code">${dim.code}</div>
        <div class="dim-info">
          <div class="dim-name">${dim.name}</div>
          <div class="dim-desc">${dim.desc}</div>
        </div>
      </div>
      <div class="section-header">
        <div class="section-eyebrow">Dimension ${idx + 1} of 6</div>
        <h2>${dim.name}</h2>
        <p>Rate each statement on a scale of 1 (Not at all true) to 5 (Almost always true) as it applies to your organisation today.</p>
      </div>
      ${qHtml}
      <div id="err-${idx + 1}" class="error-msg"></div>
      <div class="nav-row">
        <button class="btn btn-secondary" onclick="prevSection(${idx + 1})">← Back</button>
        <button class="btn btn-primary" onclick="nextSection(${idx + 1})">Continue →</button>
      </div>`;

    main.insertBefore(div, submitSection);
  });
}

function recordAnswer(qid, val) {
  answers[qid] = val;
}

// ============================================================
// VALIDATION
// ============================================================

function validateSection(sectionNum) {
  const errorEl = document.getElementById(`err-${sectionNum}`);

  if (sectionNum === 0) {
    const name = document.getElementById('f-name').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const role = document.getElementById('f-role').value.trim();
    const org = document.getElementById('f-orgName').value.trim();

    if (!name || !email || !role || !org) {
      showError(sectionNum, 'Please complete all required fields (Name, Email, Role, Organisation)');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError(sectionNum, 'Please enter a valid email address');
      return false;
    }

    hideError(sectionNum);
    return true;
  }

  if (sectionNum >= 1 && sectionNum <= 6) {
    const dim = DIMENSIONS[sectionNum - 1];
    const unanswered = dim.questions.filter(q => !answers[q.id]);

    if (unanswered.length > 0) {
      unanswered.forEach(q => {
        const qBlock = document.getElementById(`qb-${q.id}`);
        if (qBlock) qBlock.classList.add('highlight-error');
      });

      showError(
        sectionNum,
        `Please answer all ${unanswered.length} remaining question${unanswered.length > 1 ? 's' : ''} before continuing`
      );
      return false;
    }

    dim.questions.forEach(q => {
      const qBlock = document.getElementById(`qb-${q.id}`);
      if (qBlock) qBlock.classList.remove('highlight-error');
    });

    hideError(sectionNum);
    return true;
  }

  return true;
}

function showError(sectionNum, message) {
  const errorEl = document.getElementById(`err-${sectionNum}`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function hideError(sectionNum) {
  const errorEl = document.getElementById(`err-${sectionNum}`);
  if (errorEl) {
    errorEl.style.display = 'none';
  }
}

// ============================================================
// NAVIGATION
// ============================================================

function updateProgress() {
  const total = 8;
  const pct = (currentSection / (total - 1)) * 100;
  document.getElementById('progressBar').style.width = pct + '%';

  for (let i = 0; i < 8; i++) {
    const el = document.getElementById('ph' + i);
    if (!el) continue;
    el.className = 'phase-step' + (i < currentSection ? ' done' : i === currentSection ? ' active' : '');
  }
}

function showSection(n) {
  document.querySelectorAll('.section-card').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('sec-' + n);
  if (sec) {
    sec.classList.add('active');
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  currentSection = n;
  updateProgress();
}

function nextSection(from) {
  if (!validateSection(from)) return;
  showSection(from + 1);
}

function prevSection(from) {
  if (from > 0) showSection(from - 1);
}

// ============================================================
// SUBMIT SURVEY
// ============================================================
// WHY THIS CHANGED (only this function changed):
//
// Google Apps Script redirects every POST request (302 → final URL).
// Browsers refuse to follow cross-origin redirects when reading the
// response, so fetch() always throws "Failed to fetch" regardless of
// CORS headers — GAS simply cannot send those headers on the redirect.
//
// The fix: fetch with redirect:'follow' and manually follow the
// redirect URL using a GET. GAS's redirect lands on a URL that IS
// same-origin to GAS (script.googleusercontent.com), which DOES
// return the JSON body with proper headers.
//
// Everything else — scoring, AI, HTML report, email, Drive, the
// success screen — is completely unchanged.
// ============================================================

async function submitSurvey() {
  const data = {
    name: document.getElementById('f-name').value.trim(),
    email: document.getElementById('f-email').value.trim(),
    role: document.getElementById('f-role').value.trim(),
    orgName: document.getElementById('f-orgName').value.trim(),
    country: document.getElementById('f-country').value.trim(),
    sector: document.getElementById('f-sector').value,
    orgSize: document.getElementById('f-orgSize').value,
    challenge: document.getElementById('f-challenge').value.trim(),
    answers: answers
  };

  document.getElementById('loadingOverlay').classList.add('active');
  document.getElementById('submitBtn').disabled = true;
  hideError(7);
  startLoadingAnimation();

  try {
    // Step 1: POST with manual redirect handling.
    // 'manual' mode captures the redirect response without following it,
    // giving us the final destination URL from the Location header.
    // We then GET that URL directly — that final URL is served by
    // script.googleusercontent.com which correctly returns JSON.
    const postResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data)
    });

    // GAS responds with a 302. Extract the redirect destination.
    // In opaque-redirect responses the url property holds it.
    const redirectUrl = postResponse.url || postResponse.headers.get('Location');

    let result;

    if (redirectUrl && redirectUrl !== BACKEND_URL) {
      // Step 2: GET the final URL — this one returns the JSON cleanly.
      const getResponse = await fetch(redirectUrl, { method: 'GET' });
      result = await getResponse.json();
    } else {
      // Fallback: try reading the post response body directly
      // (works if GAS ever fixes its CORS handling)
      const text = await postResponse.text();
      result = JSON.parse(text);
    }

    if (result.success) {
      showSuccess(result, data.email);
    } else {
      showErrorMessage(result.error || 'Unknown error occurred');
    }

  } catch (error) {
    console.error('Submission error:', error);

    let errorMsg = 'We encountered an issue generating your report. ';

    if (error.message.includes('Failed to fetch')) {
      errorMsg += 'Please check your internet connection and try again. ';
    } else if (error.message.includes('429')) {
      errorMsg += 'Our AI service is processing many requests. Please wait 2 minutes and try again. ';
    } else if (error.message.includes('500')) {
      errorMsg += 'Something went wrong on our end. Your responses are saved. Please try again or ';
    } else {
      errorMsg += 'Please try again in a few minutes, or ';
    }

    errorMsg += 'contact delivery@equinexuspartners.com if this persists.';
    showErrorMessage(errorMsg);

  } finally {
    stopLoadingAnimation();
  }
}

// ============================================================
// LOADING ANIMATION
// ============================================================

function startLoadingAnimation() {
  const steps = ['lstep-1', 'lstep-2', 'lstep-3', 'lstep-4', 'lstep-5', 'lstep-6', 'lstep-7'];
  const messages = [
    'Saving your responses...',
    'Scoring six TRAIL dimensions...',
    'Applying Power & Stewardship modifier...',
    'Identifying coherence conditions...',
    'Generating AI narrative (~30 seconds)...',
    'Building report document...',
    'Sending to your email...'
  ];

  let stepIndex = 0;
  window.loadingInterval = setInterval(() => {
    if (stepIndex > 0) {
      const prevStep = document.getElementById(steps[stepIndex - 1]);
      if (prevStep) {
        prevStep.classList.add('done');
        prevStep.classList.remove('active');
      }
    }

    if (stepIndex < steps.length) {
      const currentStep = document.getElementById(steps[stepIndex]);
      if (currentStep) currentStep.classList.add('active');
      document.getElementById('loadingStatus').textContent = messages[stepIndex];
      stepIndex++;
    }

    if (stepIndex >= steps.length) clearInterval(window.loadingInterval);
  }, 5000);
}

function stopLoadingAnimation() {
  if (window.loadingInterval) clearInterval(window.loadingInterval);
  document.getElementById('loadingOverlay').classList.remove('active');
}

// ============================================================
// SUCCESS & ERROR DISPLAY
// ============================================================

function showSuccess(result, userEmail) {
  document.querySelectorAll('.section-card').forEach(s => s.classList.remove('active'));
  document.getElementById('phaseIndicator').style.display = 'none';

  document.getElementById('result-sdi').textContent = result.sdi || '—';
  document.getElementById('result-level-label').textContent = result.debtLevel || 'Report Generated';
  document.getElementById('result-arch').textContent = result.archetype ? `Archetype: ${result.archetype}` : '';

  const emailMsg = `Your full report has been sent to ${userEmail} and is available at the link below.`;
  document.getElementById('result-email-sent').textContent = emailMsg;

  const reportLink = document.getElementById('reportLink');
  reportLink.href = result.reportUrl;
  reportLink.textContent = 'View Your Full Report →';

  document.getElementById('resultCard').classList.add('active');
  document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth' });
}

function showErrorMessage(message) {
  document.getElementById('submitBtn').disabled = false;
  showError(7, message);
}

// ============================================================
// INITIALIZATION
// ============================================================

buildSections();
updateProgress();
