/* Navigation and scroll reveal ----------------------------------------- */
const topNav = document.getElementById("topNav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navItems = Array.from(document.querySelectorAll(".nav-links a"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const sectionPanels = Array.from(document.querySelectorAll("[data-nav]"));

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
  cooperativeLayer.style.width = `${value}%`;
  compareDivider.style.left = `${value}%`;
}

compareSlider.addEventListener("input", (event) => updateComparison(event.target.value));
updateComparison(compareSlider.value);

/* Interactive simulator ------------------------------------------------- */
const simStage = document.getElementById("simStage");
const simObjects = Array.from(document.querySelectorAll(".sim-object"));
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

  vehicles.forEach((vehicle, index) => {
    const wave = Math.sin(elapsed * 0.75 + vehicle.phase);
    const wave2 = Math.cos(elapsed * 0.52 + vehicle.phase);
    const actualX = vehicle.baseX + wave * 5;
    const actualY = vehicle.baseY + wave2 * 5;
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

/* Application cards ----------------------------------------------------- */
const applicationCards = Array.from(document.querySelectorAll(".application-card"));

applicationCards.forEach((card) => {
  card.addEventListener("click", () => {
    const wasActive = card.classList.contains("active");
    applicationCards.forEach((item) => item.classList.remove("active"));
    card.classList.toggle("active", !wasActive);
  });
});
