/* Navigation and scroll reveal ----------------------------------------- */
const topNav = document.getElementById("topNav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navItems = Array.from(document.querySelectorAll(".nav-links a"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const sectionPanels = Array.from(document.querySelectorAll("[data-nav]"));
const paperDemoSection = document.getElementById("paper-demo");
const interactiveLabSection = document.getElementById("interactive-lab");
const finalSection = document.getElementById("final");

if (paperDemoSection && finalSection) {
  finalSection.before(paperDemoSection);
}
if (interactiveLabSection && finalSection) {
  finalSection.before(interactiveLabSection);
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
  const labBounds = interactiveLabSection?.getBoundingClientRect();
  const labIsActive = labBounds && labBounds.top < window.innerHeight * 0.68 && labBounds.bottom > window.innerHeight * 0.32;

  if (isTyping || (labIsActive && ["ArrowLeft", "ArrowRight"].includes(event.key)) || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;

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

/* Interactive Cooperative Localization Lab ----------------------------- */
const labStage = document.getElementById("labStage");
const labActualPath = document.getElementById("labActualPath");
const labDrPath = document.getElementById("labDrPath");
const labCoopPath = document.getElementById("labCoopPath");
const labCandidateLayer = document.getElementById("labCandidateLayer");
const labActualAuv = document.getElementById("labActualAuv");
const labDrAuv = document.getElementById("labDrAuv");
const labCoopAuv = document.getElementById("labCoopAuv");
const labCnas = {
  A: document.getElementById("labCnaA"),
  B: document.getElementById("labCnaB")
};
const labRangeCircles = {
  A: document.getElementById("labRangeCircleA"),
  B: document.getElementById("labRangeCircleB")
};
const labRangeBands = {
  A: document.getElementById("labRangeBandA"),
  B: document.getElementById("labRangeBandB")
};
const labPingLines = {
  A: document.getElementById("labPingLineA"),
  B: document.getElementById("labPingLineB")
};
const labPingButtons = {
  A: document.getElementById("labPingA"),
  B: document.getElementById("labPingB")
};
const labRunUpdate = document.getElementById("labRunUpdate");
const labReset = document.getElementById("labReset");
const labNoise = document.getElementById("labNoise");
const labNoiseValue = document.getElementById("labNoiseValue");
const labDelay = document.getElementById("labDelay");
const labActualReadout = document.getElementById("labActualReadout");
const labDrReadout = document.getElementById("labDrReadout");
const labDrError = document.getElementById("labDrError");
const labCoopError = document.getElementById("labCoopError");
const labStageMessage = document.getElementById("labStageMessage");
const labStaleWarning = document.getElementById("labStaleWarning");
const labCandidateList = document.getElementById("labCandidateList");
const labBestCandidate = document.getElementById("labBestCandidate");
const labImprovement = document.getElementById("labImprovement");
const LAB_SCALE = 10;
const LAB_BOUNDS = { minX: 55, maxX: 845, minY: 65, maxY: 485 };
const labInitialState = {
  actual: { x: 450, y: 340 },
  cnaA: { x: 180, y: 145 },
  cnaB: { x: 720, y: 165 }
};

let labState;
let labDraggingCna = null;
const labPingTokens = { A: 0, B: 0 };

function labClonePoint(point) {
  return { x: point.x, y: point.y };
}

function labDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function labClampPoint(point) {
  return {
    x: Math.max(LAB_BOUNDS.minX, Math.min(LAB_BOUNDS.maxX, point.x)),
    y: Math.max(LAB_BOUNDS.minY, Math.min(LAB_BOUNDS.maxY, point.y))
  };
}

function labPathFromPoints(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
}

function labMeters(value) {
  return `${(value / LAB_SCALE).toFixed(1)} m`;
}

function labPosition(point) {
  return `(${(point.x / LAB_SCALE).toFixed(1)}, ${(point.y / LAB_SCALE).toFixed(1)}) m`;
}

function labNoiseSigma() {
  return 1.2 + (Number(labNoise.value) / 100) * 20;
}

function labRandomNoise(sigma = labNoiseSigma()) {
  labState.noiseSeed = (labState.noiseSeed * 1664525 + 1013904223) >>> 0;
  const uniform = labState.noiseSeed / 4294967296;
  labState.noiseSeed = (labState.noiseSeed * 1664525 + 1013904223) >>> 0;
  const second = labState.noiseSeed / 4294967296;
  const gaussian = Math.sqrt(-2 * Math.log(Math.max(uniform, 0.0001))) * Math.cos(2 * Math.PI * second);
  return gaussian * sigma * 0.55;
}

function labSeedCnaHistory(point) {
  const now = Date.now();
  return [2000, 1200, 400, 0].map((age) => ({ ...labClonePoint(point), time: now - age }));
}

function labRecordCnaPosition(key) {
  labState.cnaHistory[key].push({ ...labClonePoint(labState.cnas[key]), time: Date.now() });
  if (labState.cnaHistory[key].length > 120) labState.cnaHistory[key].shift();
}

function labDelayedCnaPosition(key) {
  const delay = Number(labDelay.value);
  const targetTime = Date.now() - delay;
  const history = labState.cnaHistory[key];
  let selected = history[0];
  history.forEach((sample) => {
    if (sample.time <= targetTime && sample.time >= selected.time) selected = sample;
  });
  return { position: { x: selected.x, y: selected.y }, age: Math.max(delay, Date.now() - selected.time) };
}

function labMeasurementPanel(key) {
  return document.querySelectorAll(`#labMeasure${key} dd`);
}

function labClearMeasurement(key) {
  labState.measurements[key] = null;
  labRangeCircles[key].classList.remove("visible");
  labRangeBands[key].classList.remove("visible");
  labMeasurementPanel(key).forEach((value) => { value.textContent = "—"; });
  labRunUpdate.disabled = !(labState.measurements.A && labState.measurements.B);
  labStaleWarning.classList.toggle("visible", Object.values(labState.measurements).some((item) => item && item.age > 150));
}

function labRenderBaselineCandidates() {
  const baselineCosts = [5.4, 1.8, 0, 1.8, 5.4];
  Array.from(labCandidateList.children).forEach((item, index) => {
    item.classList.toggle("selected", index === 2);
    item.querySelector("b").textContent = `Prior ${baselineCosts[index].toFixed(1)}`;
  });
  labBestCandidate.textContent = "DR prior only";
}

function labResetState() {
  labPingTokens.A += 1;
  labPingTokens.B += 1;
  labPingButtons.A.disabled = false;
  labPingButtons.B.disabled = false;
  const actual = labClonePoint(labInitialState.actual);
  labState = {
    actual,
    dr: labClonePoint(actual),
    cooperative: null,
    cnas: { A: labClonePoint(labInitialState.cnaA), B: labClonePoint(labInitialState.cnaB) },
    cnaHistory: { A: labSeedCnaHistory(labInitialState.cnaA), B: labSeedCnaHistory(labInitialState.cnaB) },
    actualHistory: [labClonePoint(actual)],
    drHistory: [labClonePoint(actual)],
    cooperativeHistory: [],
    measurements: { A: null, B: null },
    moveCount: 0,
    headingBias: 0,
    scaleBias: 0,
    noiseSeed: 20250924
  };
  ["A", "B"].forEach(labClearMeasurement);
  labCandidateLayer.replaceChildren();
  labCoopAuv.classList.remove("visible");
  labImprovement.innerHTML = "<span>Before / After</span><strong>Run an update</strong>";
  labStageMessage.textContent = "Move the AUV to accumulate dead-reckoning drift.";
  labRenderBaselineCandidates();
  labRender();
}

function labRenderRange(key) {
  const measurement = labState.measurements[key];
  if (!measurement) return;
  const circle = labRangeCircles[key];
  const band = labRangeBands[key];
  [circle, band].forEach((element) => {
    element.setAttribute("cx", measurement.navPosition.x);
    element.setAttribute("cy", measurement.navPosition.y);
    element.setAttribute("r", measurement.measuredRange);
    element.classList.add("visible");
  });
  band.style.strokeWidth = `${Math.max(7, measurement.sigma * 2.8)}px`;
}

function labRender() {
  labActualPath.setAttribute("d", labPathFromPoints(labState.actualHistory));
  labDrPath.setAttribute("d", labPathFromPoints(labState.drHistory));
  labCoopPath.setAttribute("d", labState.cooperativeHistory.length ? labPathFromPoints(labState.cooperativeHistory) : "");
  labActualAuv.setAttribute("transform", `translate(${labState.actual.x} ${labState.actual.y})`);
  labDrAuv.setAttribute("transform", `translate(${labState.dr.x} ${labState.dr.y})`);
  labCnas.A.setAttribute("transform", `translate(${labState.cnas.A.x} ${labState.cnas.A.y})`);
  labCnas.B.setAttribute("transform", `translate(${labState.cnas.B.x} ${labState.cnas.B.y})`);
  if (labState.cooperative) {
    labCoopAuv.setAttribute("transform", `translate(${labState.cooperative.x} ${labState.cooperative.y})`);
    labCoopAuv.classList.add("visible");
  }
  labActualReadout.textContent = labPosition(labState.actual);
  labDrReadout.textContent = labPosition(labState.dr);
  labDrError.textContent = labMeters(labDistance(labState.actual, labState.dr));
  labCoopError.textContent = labState.cooperative ? labMeters(labDistance(labState.actual, labState.cooperative)) : "—";
  labRenderRange("A");
  labRenderRange("B");
}

function labMoveAuv(dx, dy) {
  const nextActual = labClampPoint({ x: labState.actual.x + dx, y: labState.actual.y + dy });
  const appliedDx = nextActual.x - labState.actual.x;
  const appliedDy = nextActual.y - labState.actual.y;
  if (!appliedDx && !appliedDy) return;

  labState.moveCount += 1;
  labState.headingBias = Math.min(0.24, labState.headingBias + 0.0045);
  labState.scaleBias = Math.min(0.09, labState.scaleBias + 0.0014);
  const cosine = Math.cos(labState.headingBias);
  const sine = Math.sin(labState.headingBias);
  const scale = 1 + labState.scaleBias;
  const drDx = (appliedDx * cosine - appliedDy * sine) * scale;
  const drDy = (appliedDx * sine + appliedDy * cosine) * scale;

  labState.actual = nextActual;
  labState.dr = labClampPoint({ x: labState.dr.x + drDx, y: labState.dr.y + drDy });
  if (labState.cooperative) {
    labState.cooperative = labClampPoint({ x: labState.cooperative.x + drDx, y: labState.cooperative.y + drDy });
    labState.cooperativeHistory.push(labClonePoint(labState.cooperative));
  }
  labState.actualHistory.push(labClonePoint(labState.actual));
  labState.drHistory.push(labClonePoint(labState.dr));
  labStageMessage.textContent = "Dead-reckoning drift is accumulating. Acquire ranges to add geometric constraints.";
  labRender();
}

function labMoveCna(key, point) {
  labPingTokens[key] += 1;
  labPingButtons[key].disabled = false;
  labState.cnas[key] = labClampPoint(point);
  labRecordCnaPosition(key);
  labClearMeasurement(key);
  labCandidateLayer.replaceChildren();
  labBestCandidate.textContent = "Re-acquire ranges";
  labStageMessage.textContent = `CNA ${key} moved. Its previous range was invalidated; PING again.`;
  labRender();
}

function labUpdateNoiseLabel() {
  const value = Number(labNoise.value);
  labNoiseValue.textContent = value < 34 ? "Low" : value < 68 ? "Medium" : "High";
}

function labTriggerPingAnimation(key) {
  const line = labPingLines[key];
  const cna = labState.cnas[key];
  line.setAttribute("x1", cna.x);
  line.setAttribute("y1", cna.y);
  line.setAttribute("x2", labState.actual.x);
  line.setAttribute("y2", labState.actual.y);
  line.classList.remove("active");
  void line.getBoundingClientRect();
  line.classList.add("active");
  window.setTimeout(() => line.classList.remove("active"), 2250);
}

function labPing(key) {
  const token = ++labPingTokens[key];
  const pingCna = labClonePoint(labState.cnas[key]);
  const pingActual = labClonePoint(labState.actual);
  const delayed = labDelayedCnaPosition(key);
  const sigma = labNoiseSigma();
  const pathIndex = labState.drHistory.length - 1;
  labPingButtons[key].disabled = true;
  labTriggerPingAnimation(key);
  labStageMessage.textContent = `CNA ${key}: acoustic ping is propagating through the water...`;

  window.setTimeout(() => {
    if (token !== labPingTokens[key]) return;
    const trueRange = labDistance(pingCna, pingActual);
    const noise = labRandomNoise(sigma);
    const measurement = {
      trueRange,
      measuredRange: Math.max(5, trueRange + noise),
      error: noise,
      sigma,
      navPosition: delayed.position,
      age: delayed.age,
      pathIndex
    };
    labState.measurements[key] = measurement;
    const values = labMeasurementPanel(key);
    values[0].textContent = labMeters(measurement.trueRange);
    values[1].textContent = labMeters(measurement.measuredRange);
    values[2].textContent = `${measurement.error >= 0 ? "+" : ""}${(measurement.error / LAB_SCALE).toFixed(2)} m`;
    values[3].textContent = `${Math.round(measurement.age)} ms`;
    labStaleWarning.classList.toggle("visible", Object.values(labState.measurements).some((item) => item && item.age > 150));
    labRunUpdate.disabled = !(labState.measurements.A && labState.measurements.B);
    labPingButtons[key].disabled = false;
    labStageMessage.textContent = `CNA ${key}: range-only constraint acquired. One range does not uniquely determine position.`;
    labRender();
  }, 700);
}

function labTrajectoryForOffset(offset) {
  const denominator = Math.max(labState.drHistory.length - 1, 1);
  return labState.drHistory.map((point, index) => {
    const ratio = index / denominator;
    return { x: point.x + offset.x * ratio, y: point.y + offset.y * ratio };
  });
}

function labCandidateCost(offset) {
  const trajectory = labTrajectoryForOffset(offset);
  let cost = 0.0015 * (offset.x ** 2 + offset.y ** 2);
  Object.values(labState.measurements).forEach((measurement) => {
    if (!measurement) return;
    const index = Math.min(measurement.pathIndex, trajectory.length - 1);
    const predictedRange = labDistance(trajectory[index], measurement.navPosition);
    const residual = predictedRange - measurement.measuredRange;
    cost += (residual ** 2) / (measurement.sigma ** 2 + 9);
  });
  return cost;
}

function labFindBestOffset() {
  let best = { x: 0, y: 0, cost: Number.POSITIVE_INFINITY };
  for (let x = -120; x <= 120; x += 12) {
    for (let y = -120; y <= 120; y += 12) {
      const cost = labCandidateCost({ x, y });
      if (cost < best.cost) best = { x, y, cost };
    }
  }
  return best;
}

function labRunCooperativeUpdate() {
  if (!(labState.measurements.A && labState.measurements.B)) return;
  const best = labFindBestOffset();
  const variations = [
    { x: best.x - 38, y: best.y - 20 },
    { x: best.x - 20, y: best.y + 24 },
    { x: best.x, y: best.y },
    { x: best.x + 22, y: best.y - 22 },
    { x: best.x + 40, y: best.y + 22 }
  ].map((offset, index) => ({ offset, index, cost: labCandidateCost(offset), trajectory: labTrajectoryForOffset(offset) }));
  const selected = variations.reduce((lowest, candidate) => candidate.cost < lowest.cost ? candidate : lowest, variations[0]);

  labCandidateLayer.replaceChildren();
  variations.forEach((candidate) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", labPathFromPoints(candidate.trajectory));
    path.setAttribute("class", `lab-candidate-path${candidate === selected ? " selected" : ""}`);
    labCandidateLayer.append(path);
  });
  Array.from(labCandidateList.children).forEach((item, index) => {
    item.classList.toggle("selected", variations[index] === selected);
    item.querySelector("b").textContent = `Cost ${variations[index].cost.toFixed(2)}`;
  });

  labState.cooperativeHistory = selected.trajectory.map(labClonePoint);
  labState.cooperative = labClonePoint(selected.trajectory[selected.trajectory.length - 1]);
  const beforeError = labDistance(labState.actual, labState.dr);
  const afterError = labDistance(labState.actual, labState.cooperative);
  const improvement = beforeError > 0.01 ? (1 - afterError / beforeError) * 100 : 0;
  labBestCandidate.textContent = `MINIMUM COST · ${String.fromCharCode(65 + selected.index)}`;
  labImprovement.innerHTML = `<span>DR ${labMeters(beforeError)} → Cooperative ${labMeters(afterError)}</span><strong>${improvement >= 0 ? "Improvement" : "Change"} ${improvement.toFixed(0)}%</strong>`;
  labStageMessage.textContent = "Best consistent trajectory selected from DR prior + acoustic range residual cost.";
  labRender();
}

function labPointerPosition(event) {
  const point = labStage.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = labStage.getScreenCTM();
  return matrix ? point.matrixTransform(matrix.inverse()) : { x: 450, y: 270 };
}

labStage.addEventListener("pointerdown", (event) => {
  const target = event.target.closest?.(".lab-cna");
  if (!target) return;
  event.preventDefault();
  labDraggingCna = { key: target.dataset.cna, pointerId: event.pointerId };
  labStage.setPointerCapture(event.pointerId);
});

labStage.addEventListener("pointermove", (event) => {
  if (!labDraggingCna || labDraggingCna.pointerId !== event.pointerId) return;
  labMoveCna(labDraggingCna.key, labPointerPosition(event));
});

function labEndPointer(event) {
  if (!labDraggingCna || labDraggingCna.pointerId !== event.pointerId) return;
  labDraggingCna = null;
  if (labStage.hasPointerCapture(event.pointerId)) labStage.releasePointerCapture(event.pointerId);
}

labStage.addEventListener("pointerup", labEndPointer);
labStage.addEventListener("pointercancel", labEndPointer);

document.querySelectorAll("[data-lab-move]").forEach((button) => {
  button.addEventListener("click", () => {
    const moves = { up: [0, -16], down: [0, 16], left: [-16, 0], right: [16, 0] };
    labMoveAuv(...moves[button.dataset.labMove]);
  });
});

window.addEventListener("keydown", (event) => {
  const bounds = interactiveLabSection.getBoundingClientRect();
  const labIsActive = bounds.top < window.innerHeight * 0.68 && bounds.bottom > window.innerHeight * 0.32;
  if (!labIsActive) return;
  const focusedCna = event.target.closest?.("[data-cna]");
  const activeElement = document.activeElement;
  const isControl = activeElement && (activeElement.matches("input, button, select, textarea, summary") || activeElement.isContentEditable);
  const keyMoves = {
    ArrowUp: [0, -16], w: [0, -16], W: [0, -16],
    ArrowDown: [0, 16], s: [0, 16], S: [0, 16],
    ArrowLeft: [-16, 0], a: [-16, 0], A: [-16, 0],
    ArrowRight: [16, 0], d: [16, 0], D: [16, 0]
  };
  const movement = keyMoves[event.key];
  if (!movement) return;
  if (focusedCna) {
    event.preventDefault();
    const key = focusedCna.dataset.cna;
    labMoveCna(key, { x: labState.cnas[key].x + movement[0], y: labState.cnas[key].y + movement[1] });
    return;
  }
  if (isControl) return;
  event.preventDefault();
  labMoveAuv(...movement);
});

labPingButtons.A.addEventListener("click", () => labPing("A"));
labPingButtons.B.addEventListener("click", () => labPing("B"));
labRunUpdate.addEventListener("click", labRunCooperativeUpdate);
labReset.addEventListener("click", labResetState);
labNoise.addEventListener("input", labUpdateNoiseLabel);
labDelay.addEventListener("change", () => {
  labStageMessage.textContent = Number(labDelay.value) ? "Communication delay enabled: future pings may use stale CNA navigation states." : "Communication delay disabled.";
});
labUpdateNoiseLabel();
labResetState();

/* Application cards ----------------------------------------------------- */
const applicationCards = Array.from(document.querySelectorAll(".application-card"));

applicationCards.forEach((card) => {
  card.addEventListener("click", () => {
    const wasActive = card.classList.contains("active");
    applicationCards.forEach((item) => item.classList.remove("active"));
    card.classList.toggle("active", !wasActive);
  });
});
