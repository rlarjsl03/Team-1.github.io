/* Navigation and scroll reveal ----------------------------------------- */
const topNav = document.getElementById("topNav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navItems = Array.from(document.querySelectorAll(".nav-links a"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const sectionPanels = Array.from(document.querySelectorAll("[data-nav]"));
const paperDemoSection = document.getElementById("paper-demo");
const finalSection = document.getElementById("final");

if (paperDemoSection && finalSection) {
  finalSection.before(paperDemoSection);
}

function setActiveNavigation(activeKey) {
  navItems.forEach((item) => {
    const key = item.getAttribute("href").replace("#", "");
    item.classList.toggle("active", key === activeKey);
  });
}

function handleNavScroll() {
  topNav.classList.toggle("compact", window.scrollY > 30);

  const current = sectionPanels
    .map((section) => ({
      key: section.dataset.nav,
      distance: Math.abs(section.getBoundingClientRect().top - 120),
      top: section.getBoundingClientRect().top
    }))
    .filter((section) => section.top < window.innerHeight * 0.72)
    .sort((a, b) => a.distance - b.distance)[0];

  if (current) {
    setActiveNavigation(current.key);
  }
}

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));
window.addEventListener("scroll", handleNavScroll, { passive: true });
handleNavScroll();

/* Section keyboard navigation ------------------------------------------ */
const keyboardSections = Array.from(document.querySelectorAll("main > section.section-panel"));

function getCurrentSectionIndex() {
  const referenceY = window.scrollY + Math.min(window.innerHeight * 0.35, 260);
  let currentIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  keyboardSections.forEach((section, index) => {
    const distance = Math.abs(section.offsetTop - referenceY);
    if (distance < closestDistance) {
      closestDistance = distance;
      currentIndex = index;
    }
  });

  return currentIndex;
}

window.addEventListener("keydown", (event) => {
  const activeElement = document.activeElement;
  const isTyping = activeElement && (
    activeElement.matches("input, textarea, select") ||
    activeElement.isContentEditable
  );

  if (isTyping || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;

  const currentIndex = getCurrentSectionIndex();
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const nextIndex = Math.max(0, Math.min(keyboardSections.length - 1, currentIndex + direction));

  if (nextIndex === currentIndex) return;

  event.preventDefault();
  keyboardSections[nextIndex].scrollIntoView({ behavior: "smooth", block: "start" });
});

/* Localization sensor panel -------------------------------------------- */
const sensorDescriptions = {
  gnss: {
    title: "GNSS",
    text: "위성 신호를 이용해 전역 위치를 추정한다. 개방된 공간에서는 유용하지만 터널, 실내, 고층 건물 주변에서는 신호 품질이 떨어질 수 있다."
  },
  imu: {
    title: "IMU",
    text: "가속도와 각속도를 측정해 차량의 움직임을 추정한다. 짧은 시간에는 반응이 빠르지만 시간이 지날수록 drift가 누적될 수 있다."
  },
  lidar: {
    title: "LiDAR",
    text: "레이저로 주변의 3차원 구조를 측정해 지도와 비교한다. 차선, 벽, 건물처럼 주변 형상이 뚜렷할수록 위치 보정에 도움이 된다."
  },
  camera: {
    title: "Camera",
    text: "영상에서 차선, 표지판, 특징점을 인식해 위치추정을 보조한다. 조명 변화나 날씨의 영향을 받기 때문에 다른 센서와 함께 쓰는 것이 중요하다."
  }
};

sensorDescriptions.gnss.text = "위성 신호를 이용해 전역 위치를 추정합니다. 신호 차단과 multipath에는 취약합니다.";
sensorDescriptions.imu.text = "가속도와 회전 정보를 이용해 움직임을 추적하지만 시간이 지나면 drift가 누적됩니다.";
sensorDescriptions.lidar.text = "주변 환경의 3차원 구조와 특징을 측정해 위치 추정을 보조합니다.";
sensorDescriptions.camera.text = "주변의 시각적 특징을 인식해 위치와 움직임 추정을 보조합니다.";

const sensorInfo = document.getElementById("sensorInfo");
const sensorChips = Array.from(document.querySelectorAll(".sensor-chip"));

function updateSensor(sensorKey) {
  const selected = sensorDescriptions[sensorKey];
  if (!selected) return;

  sensorChips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.sensor === sensorKey);
  });

  sensorInfo.innerHTML = `
    <p class="info-label">Selected Sensor</p>
    <h3>${selected.title}</h3>
    <p>${selected.text}</p>
  `;
}

sensorChips.forEach((chip) => {
  chip.addEventListener("mouseenter", () => updateSensor(chip.dataset.sensor));
  chip.addEventListener("focus", () => updateSensor(chip.dataset.sensor));
  chip.addEventListener("click", () => updateSensor(chip.dataset.sensor));
});

/* Cooperative network --------------------------------------------------- */
const cooperationDemo = document.getElementById("cooperationDemo");
const connectButton = document.getElementById("connectButton");

connectButton.addEventListener("click", () => {
  const isConnected = cooperationDemo.classList.toggle("connected");
  connectButton.textContent = isConnected ? "Hide Cooperative Links" : "Create Cooperative Links";
});

const cooperationObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        cooperationDemo.classList.add("connected");
        connectButton.textContent = "Hide Cooperative Links";
      }
    });
  },
  { threshold: 0.45 }
);

cooperationObserver.observe(cooperationDemo);

/* Step interaction ------------------------------------------------------ */
const stepButtons = Array.from(document.querySelectorAll(".step-button"));
const stepPanels = Array.from(document.querySelectorAll("[data-step-panel]"));

function setStep(stepKey) {
  stepButtons.forEach((button) => button.classList.toggle("active", button.dataset.step === stepKey));
  stepPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.stepPanel === stepKey));
}

stepButtons.forEach((button) => {
  button.addEventListener("click", () => setStep(button.dataset.step));
});

/* Independent vs cooperative slider ------------------------------------ */
const compareSlider = document.getElementById("compareSlider");
const cooperativeLayer = document.getElementById("cooperativeLayer");
const compareDivider = document.getElementById("compareDivider");

function updateComparison(value) {
  const hiddenWidth = 100 - Number(value);
  cooperativeLayer.style.width = "100%";
  cooperativeLayer.style.clipPath = `inset(0 ${hiddenWidth}% 0 0)`;
  compareDivider.style.left = `${value}%`;
}

compareSlider.addEventListener("input", (event) => updateComparison(event.target.value));
updateComparison(compareSlider.value);

/* Interactive simulator ------------------------------------------------- */
const simStage = document.getElementById("simStage");
const simObjects = Array.from(document.querySelectorAll(".sim-object"));
const simLinks = Array.from(document.querySelectorAll(".sim-link"));
const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
const errorValue = document.getElementById("errorValue");
const errorBar = document.getElementById("errorBar");
const errorChart = document.getElementById("errorChart");
const chartContext = errorChart.getContext("2d");

let simulatorMode = "independent";
let simulatorStart = performance.now();
let errorHistory = [];

const vehicles = [
  { baseX: 22, baseY: 26, phase: 0, driftX: 26, driftY: 14 },
  { baseX: 53, baseY: 47, phase: 1.8, driftX: -20, driftY: 20 },
  { baseX: 76, baseY: 70, phase: 3.4, driftX: 17, driftY: -19 }
];

function setSimulatorMode(mode) {
  simulatorMode = mode;
  simulatorStart = performance.now();
  errorHistory = [];
  simStage.classList.toggle("cooperative", mode === "cooperative");
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setSimulatorMode(button.dataset.mode));
});

function drawErrorChart() {
  const width = errorChart.width;
  const height = errorChart.height;
  chartContext.clearRect(0, 0, width, height);

  chartContext.strokeStyle = "rgba(232, 246, 255, 0.14)";
  chartContext.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = 20 + i * 28;
    chartContext.beginPath();
    chartContext.moveTo(0, y);
    chartContext.lineTo(width, y);
    chartContext.stroke();
  }

  if (errorHistory.length < 2) return;

  chartContext.strokeStyle = simulatorMode === "cooperative" ? "#63e6be" : "#ff7d8b";
  chartContext.lineWidth = 3;
  chartContext.beginPath();

  errorHistory.forEach((value, index) => {
    const x = (index / Math.max(errorHistory.length - 1, 1)) * width;
    const y = height - Math.min(value / 20, 1) * (height - 12) - 6;
    if (index === 0) {
      chartContext.moveTo(x, y);
    } else {
      chartContext.lineTo(x, y);
    }
  });

  chartContext.stroke();
}

function animateSimulator(now) {
  const elapsed = (now - simulatorStart) / 1000;
  const stageWidth = simStage.clientWidth;
  const stageHeight = simStage.clientHeight;
  let errorSum = 0;
  const actualPositions = [];

  vehicles.forEach((vehicle, index) => {
    const wave = Math.sin(elapsed * 0.75 + vehicle.phase);
    const wave2 = Math.cos(elapsed * 0.52 + vehicle.phase);
    const actualX = vehicle.baseX + wave * 5;
    const actualY = vehicle.baseY + wave2 * 5;
    actualPositions.push({ x: actualX, y: actualY });
    const driftScale = simulatorMode === "cooperative"
      ? 0.28 + Math.sin(elapsed * 2 + index) * 0.04
      : Math.min(1.15, 0.28 + elapsed * 0.075);

    const estimatedXOffset = vehicle.driftX * driftScale;
    const estimatedYOffset = vehicle.driftY * driftScale;
    const errorMeters = Math.hypot(estimatedXOffset, estimatedYOffset) * 0.32;
    errorSum += errorMeters;

    const object = simObjects[index];
    object.style.left = `${(actualX / 100) * stageWidth}px`;
    object.style.top = `${(actualY / 100) * stageHeight}px`;

    const estimatedDot = object.querySelector(".estimated-dot");
    estimatedDot.style.transform = `translate(calc(-50% + ${estimatedXOffset}px), calc(-50% + ${estimatedYOffset}px))`;
  });

  // Keep the SVG links in the same coordinate system as the moving AUVs.
  const linkPairs = [[0, 1], [1, 2], [0, 2]];
  simLinks.forEach((line, index) => {
    const [from, to] = linkPairs[index];
    if (!actualPositions[from] || !actualPositions[to]) return;

    line.setAttribute("x1", String((actualPositions[from].x / 100) * 900));
    line.setAttribute("y1", String((actualPositions[from].y / 100) * 420));
    line.setAttribute("x2", String((actualPositions[to].x / 100) * 900));
    line.setAttribute("y2", String((actualPositions[to].y / 100) * 420));
  });

  const averageError = errorSum / vehicles.length;
  const displayedError = simulatorMode === "cooperative"
    ? Math.max(2.8, averageError)
    : Math.min(16.5, averageError + elapsed * 0.48);

  errorValue.textContent = displayedError.toFixed(1);
  errorBar.style.width = `${Math.min((displayedError / 18) * 100, 100)}%`;

  errorHistory.push(displayedError);
  if (errorHistory.length > 70) {
    errorHistory.shift();
  }
  drawErrorChart();

  requestAnimationFrame(animateSimulator);
}

setSimulatorMode("independent");
requestAnimationFrame(animateSimulator);

/* Paper-based cooperative navigation demo ------------------------------ */
const paperDemoStage = document.querySelector(".paper-demo-stage");
const paperDemoStatus = document.getElementById("paperDemoStatus");
const paperRestart = document.getElementById("paperRestart");
const paperDrOnly = document.getElementById("paperDrOnly");
const paperEnable = document.getElementById("paperEnable");
const paperActualPath = document.getElementById("paperActualPath");
const paperDeadPath = document.getElementById("paperDeadPath");
const paperRangeA = document.getElementById("paperRangeA");
const paperRangeB = document.getElementById("paperRangeB");
const paperPingA = document.getElementById("paperPingA");
const paperPingB = document.getElementById("paperPingB");
const paperCnaA = document.querySelector(".paper-cna.cna-a");
const paperCnaB = document.querySelector(".paper-cna.cna-b");
const paperUncertainty = document.getElementById("paperUncertainty");
const paperDeadTarget = document.getElementById("paperDeadTarget");
const paperCorrectedTarget = document.getElementById("paperCorrectedTarget");
const paperActualTarget = document.getElementById("paperActualTarget");
const paperCandidatePaths = [
  document.getElementById("paperCandidateOne"),
  document.getElementById("paperCandidateTwo"),
  document.getElementById("paperCandidateThree")
];

let paperDemoStart = performance.now();
let paperDemoMode = "cooperative";

function paperPoint(progress, variant = "actual") {
  const x = 300 + progress * 132;
  const y = 390 - progress * 104 + Math.sin(progress * Math.PI) * 10;
  if (variant === "dead") {
    return { x: x + progress ** 1.55 * 92, y: y + progress ** 1.45 * 60 };
  }
  if (variant === "corrected") {
    const dead = paperPoint(progress, "dead");
    const correction = Math.max(0, (progress - 0.7) / 0.3);
    return { x: dead.x + (x - dead.x) * correction, y: dead.y + (y - dead.y) * correction };
  }
  return { x, y };
}

function paperPath(variant, offset = 0, maxProgress = 1) {
  const points = [];
  const pointCount = Math.max(1, Math.round(28 * maxProgress));
  for (let index = 0; index <= pointCount; index += 1) {
    const progress = index / 28;
    const point = paperPoint(progress, variant);
    points.push(`${index === 0 ? "M" : "L"} ${point.x + offset * progress} ${point.y - offset * progress * 0.35}`);
  }
  return points.join(" ");
}

function setPaperButtonState() {
  paperDrOnly.classList.toggle("active", paperDemoMode === "dead-reckoning");
  paperEnable.classList.toggle("active", paperDemoMode === "cooperative");
}

function resetPaperDemo(mode = "cooperative") {
  paperDemoMode = mode;
  paperDemoStart = performance.now();
  paperDemoStage.classList.remove("ranges-visible", "pings-visible", "candidates-visible", "drift-visible");
  paperDeadTarget.classList.remove("visible");
  paperCorrectedTarget.classList.remove("visible");
  paperActualTarget.classList.remove("visible");
  setPaperButtonState();
}

function animatePaperDemo(now) {
  const cycle = ((now - paperDemoStart) / 18000) % 1;
  const progress = Math.min(cycle / 0.78, 1);
  const actual = paperPoint(progress, "actual");
  const dead = paperPoint(progress, "dead");
  const corrected = paperPoint(progress, "corrected");
  const cooperativeEnabled = paperDemoMode === "cooperative";
  const cnaA = { x: 205 + Math.sin(now / 4200) * 8, y: 165 + Math.cos(now / 5200) * 6 };
  const cnaB = { x: 705 + Math.sin(now / 4700 + 1.4) * 9, y: 185 + Math.cos(now / 5600 + 1.2) * 7 };

  paperActualPath.setAttribute("d", paperPath("actual", 0, progress));
  paperDeadPath.setAttribute("d", paperPath("dead", 0, progress));
  paperCandidatePaths[0].setAttribute("d", paperPath("dead", 48));
  paperCandidatePaths[1].setAttribute("d", paperPath("corrected", 0));
  paperCandidatePaths[2].setAttribute("d", paperPath("dead", -34));
  paperActualTarget.setAttribute("transform", `translate(${actual.x} ${actual.y})`);
  paperDeadTarget.setAttribute("transform", `translate(${dead.x} ${dead.y})`);
  paperCorrectedTarget.setAttribute("transform", `translate(${corrected.x} ${corrected.y})`);
  paperCnaA.setAttribute("transform", `translate(${cnaA.x} ${cnaA.y})`);
  paperCnaB.setAttribute("transform", `translate(${cnaB.x} ${cnaB.y})`);
  paperUncertainty.setAttribute("cx", dead.x);
  paperUncertainty.setAttribute("cy", dead.y);
  paperUncertainty.setAttribute("r", String(28 + progress * 48));

  const rangeProgress = Math.min(Math.max((cycle - 0.16) / 0.24, 0), 1);
  paperRangeA.setAttribute("cx", String(cnaA.x));
  paperRangeA.setAttribute("cy", String(cnaA.y));
  paperRangeB.setAttribute("cx", String(cnaB.x));
  paperRangeB.setAttribute("cy", String(cnaB.y));
  paperRangeA.setAttribute("r", String(rangeProgress * 290));
  paperRangeB.setAttribute("r", String(rangeProgress * 330));
  paperPingA.setAttribute("x1", cnaA.x);
  paperPingA.setAttribute("y1", cnaA.y);
  paperPingA.setAttribute("x2", actual.x);
  paperPingA.setAttribute("y2", actual.y);
  paperPingB.setAttribute("x1", cnaB.x);
  paperPingB.setAttribute("y1", cnaB.y);
  paperPingB.setAttribute("x2", actual.x);
  paperPingB.setAttribute("y2", actual.y);

  paperActualTarget.classList.add("visible");
  paperDeadTarget.classList.toggle("visible", progress > 0.03);
  paperDemoStage.classList.toggle("drift-visible", progress > 0.12);
  paperDemoStage.classList.toggle("ranges-visible", cooperativeEnabled && cycle > 0.16);
  paperDemoStage.classList.toggle("pings-visible", cooperativeEnabled && cycle > 0.16 && cycle < 0.54);
  paperDemoStage.classList.toggle("candidates-visible", cooperativeEnabled && cycle > 0.43);
  paperCorrectedTarget.classList.toggle("visible", cooperativeEnabled && cycle > 0.7);

  if (!cooperativeEnabled) {
    paperDemoStatus.textContent = "Dead Reckoning Only: 시간이 지날수록 추정 오차가 누적됩니다.";
  } else if (cycle < 0.16) {
    paperDemoStatus.textContent = "STEP 1 · INS / DVL Dead Reckoning — Error accumulates over time.";
  } else if (cycle < 0.43) {
    paperDemoStatus.textContent = "STEP 2 · Acoustic Time-of-Flight — CNA A/B가 range-only measurement를 보냅니다.";
  } else if (cycle < 0.7) {
    paperDemoStatus.textContent = "STEP 3 · Constraint Evaluation — candidate trajectory의 residual/cost를 비교합니다.";
  } else {
    paperDemoStatus.textContent = "STEP 4 · Position Correction — minimum-cost trajectory에 cooperative estimate를 보정합니다.";
  }

  requestAnimationFrame(animatePaperDemo);
}

paperRestart.addEventListener("click", () => resetPaperDemo("cooperative"));
paperDrOnly.addEventListener("click", () => resetPaperDemo("dead-reckoning"));
paperEnable.addEventListener("click", () => resetPaperDemo("cooperative"));
resetPaperDemo();
requestAnimationFrame(animatePaperDemo);

/* Application cards ----------------------------------------------------- */
const applicationCards = Array.from(document.querySelectorAll(".application-card"));

applicationCards.forEach((card) => {
  card.addEventListener("click", () => {
    const wasActive = card.classList.contains("active");
    applicationCards.forEach((item) => item.classList.remove("active"));
    card.classList.toggle("active", !wasActive);
  });
});
