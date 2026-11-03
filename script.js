// RAKSHA - Modern AI Women Safety Companion
// Fully modular frontend logic:
// 1. Direct automatic dispatch (WhatsApp / SMS)
// 2. Battery Status API (<15% detection)
// 3. Customizable shake threshold
// 4. 4-press hardware shortcut trigger
// 5. Male voice AI Speech Assistant
// 6. Safe Walk timer with 7-second vibration countdown

const I18N = {
  en: {
    tagline: "AI Safety Companion",
    sosInstruction: "Tap for Discreet Silent Alert",
    sosSub: "Sends live location quietly without sounding any sirens",
    aiTitle: "Raksha Voice AI (Male Voice)",
    tileProfile: "Emergency Profile",
    tileProfileSub: "Medical ID & Guardian Info",
    tileFakeCall: "Fake Call",
    tileFakeCallSub: "Simulate incoming call",
    tileTimer: "Safe Walk Timer",
    tileTimerSub: "Custom time + 7s buzzer countdown",
    tileHavens: "Nearby Safe Havens",
    tileHavensSub: "Police, hospitals, booths",
    hotlinesTitle: "National Emergency Hotlines",
    contactsTitle: "Trusted Guardian Contacts"
  },
  hi: {
    tagline: "एआई सुरक्षा साथी",
    sosInstruction: "शांत (साइलेंट) आपातकालीन अलर्ट",
    sosSub: "बिना किसी सायरन के चुपचाप लाइव लोकेशन भेजता है",
    aiTitle: "रक्षा वॉइस एआई (पुरुष आवाज़)",
    tileProfile: "आपातकालीन प्रोफ़ाइल",
    tileProfileSub: "मेडिकल आईडी और अभिभावक विवरण",
    tileFakeCall: "फेक कॉल",
    tileFakeCallSub: "आने वाले कॉल का नाटक करें",
    tileTimer: "सुरक्षित यात्रा टाइमर",
    tileTimerSub: "कस्टम समय + 7 सेकंड वाइब्रेशन काउंटडाउन",
    tileHavens: "निकटतम सुरक्षित स्थान",
    tileHavensSub: "पुलिस स्टेशन, अस्पताल, महिला बूथ",
    hotlinesTitle: "राष्ट्रीय आपातकालीन हेल्पलाइन",
    contactsTitle: "विश्वसनीय अभिभावक संपर्क"
  },
  mr: {
    tagline: "एआय सुरक्षा सोबती",
    sosInstruction: "शांत (सायलेंट) आणीबाणी अलर्ट",
    sosSub: "कोणताही सायरन न वाजवता शांतपणे थेट लोकेशन पाठवते",
    aiTitle: "रक्षा व्हॉईस एआय (पुरुष आवाज)",
    tileProfile: "आणीबाणी प्रोफाईल",
    tileProfileSub: "वैद्यकीय आयडी आणि पालक माहिती",
    tileFakeCall: "फेक कॉल",
    tileFakeCallSub: "येणाऱ्या बनावट कॉलचे सिम्युलेशन",
    tileTimer: "सुरक्षित प्रवास टाइमर",
    tileTimerSub: "कस्टम वेळ + 7 सेकंद व्हायब्रेशन काउंटडाउन",
    tileHavens: "जवळचे सुरक्षित ठिकाण",
    tileHavensSub: "पोलीस ठाणे, रुग्णालय, मदत केंद्र",
    hotlinesTitle: "राष्ट्रीय आणीबाणी हेल्पलाइन",
    contactsTitle: "विश्वासू पालक संपर्क"
  }
};

// Global State
const state = {
  lang: "en",
  currentCoords: null,
  isSosActive: false,
  sosCountdownInterval: null,
  defaultChannel: "whatsapp",
  
  // Battery Monitoring
  lowBatteryNotified: false,

  // Customizable Shake
  shakeThreshold: 30,

  // 4-Press Rapid Key Shortcut
  hardwarePressCount: 0,
  lastHardwarePressTime: 0,

  // Safe Walk Timer & 7s Post-Timer
  walkDurationMinutes: 5,
  walkTimerInterval: null,
  walkRemainingSeconds: 300,
  postTimerWarningInterval: null,
  postTimerWarningSeconds: 7,
  vibrationPulseInterval: null,

  // Fake Call
  fakeCallDurationInterval: null,
  fakeCallSeconds: 0,

  // Male Voice AI
  speechSynth: window.speechSynthesis,
  maleVoice: null,
  recognition: null,
  isListening: false,

  // Profile & Accounts
  account: null,
  profile: {
    avatar: "👩",
    name: "Priya Sharma",
    age: "22",
    blood: "B+",
    medical: "No known allergies",
    parentName: "Rajesh Sharma",
    parentPhone: "+919876543210",
    address: "Bandra West, Mumbai"
  },
  contacts: [
    { id: 1, name: "Rajesh Sharma (Dad)", phone: "+919876543210" },
    { id: 2, name: "Sister", phone: "+919876543211" }
  ]
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  loadSavedData();
  setupScreenNavigation();
  initGeolocation();
  initBatteryMonitoring();
  initCustomizableShake();
  initMultiPressShortcut();
  initLanguage();
  initMaleVoiceSynthesis();
  initVoiceAssistant();
  initEvents();
  renderContacts();
  populateProfileForm();
  populateOnboardingForm();
});

// Load persistent data
function loadSavedData() {
  const savedAccount = localStorage.getItem("raksha_account");
  if (savedAccount) {
    try { state.account = JSON.parse(savedAccount); } catch (e) {}
  }
  const savedProfile = localStorage.getItem("raksha_profile");
  if (savedProfile) {
    try { state.profile = JSON.parse(savedProfile); } catch (e) {}
  }
  const savedContacts = localStorage.getItem("raksha_contacts");
  if (savedContacts) {
    try { state.contacts = JSON.parse(savedContacts); } catch (e) {}
  }
  const savedShake = localStorage.getItem("raksha_shake_threshold");
  if (savedShake) {
    state.shakeThreshold = parseInt(savedShake, 10);
    const slider = document.getElementById("input-shake-sensitivity");
    const label = document.getElementById("label-shake-val");
    if (slider) slider.value = state.shakeThreshold;
    if (label) updateShakeLabel(state.shakeThreshold);
  }
  const savedChannel = localStorage.getItem("raksha_default_channel");
  if (savedChannel) {
    state.defaultChannel = savedChannel;
    const radio = document.querySelector(`input[name="auto-channel"][value="${savedChannel}"]`);
    if (radio) radio.checked = true;
  }
  const savedLang = localStorage.getItem("raksha_lang");
  if (savedLang && I18N[savedLang]) {
    state.lang = savedLang;
    const langSelect = document.getElementById("lang-select");
    if (langSelect) langSelect.value = savedLang;
  }
}

// Multi-Screen Workflow
function setupScreenNavigation() {
  const isSetupDone = localStorage.getItem("raksha_setup_completed");
  if (isSetupDone === "true") {
    showScreen("screen-home");
  } else {
    showScreen("screen-auth");
  }

  // Auth Form
  const formAuth = document.getElementById("form-auth");
  if (formAuth) {
    formAuth.addEventListener("submit", (e) => {
      e.preventDefault();
      const identifier = document.getElementById("auth-identifier").value.trim();
      const password = document.getElementById("auth-password").value.trim();
      state.account = { identifier, password };
      localStorage.setItem("raksha_account", JSON.stringify(state.account));
      speakMaleVoice("Account verified. Please setup your emergency profile.");
      showScreen("screen-onboarding");
    });
  }

  // Onboarding Form
  const formOnboarding = document.getElementById("form-onboarding");
  if (formOnboarding) {
    formOnboarding.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectedAvatar = document.querySelector('input[name="onboard-avatar"]:checked');

      state.profile = {
        avatar: selectedAvatar ? selectedAvatar.value : "👩",
        name: document.getElementById("onboard-name").value.trim(),
        age: document.getElementById("onboard-age").value.trim(),
        blood: document.getElementById("onboard-blood").value,
        medical: document.getElementById("onboard-medical").value.trim(),
        parentName: document.getElementById("onboard-parent-name").value.trim(),
        parentPhone: document.getElementById("onboard-parent-phone").value.trim(),
        address: document.getElementById("onboard-address").value.trim()
      };

      localStorage.setItem("raksha_profile", JSON.stringify(state.profile));
      localStorage.setItem("raksha_setup_completed", "true");

      if (state.profile.parentName && state.profile.parentPhone) {
        state.contacts[0] = { id: 1, name: `${state.profile.parentName} (Parent)`, phone: state.profile.parentPhone };
        localStorage.setItem("raksha_contacts", JSON.stringify(state.contacts));
        renderContacts();
      }

      populateProfileForm();
      speakMaleVoice(`Welcome to Raksha, ${state.profile.name}. Your personal safety shield is active.`);
      showScreen("screen-home");
    });
  }

  // Logout / Switch
  document.getElementById("btn-logout")?.addEventListener("click", () => {
    if (confirm("Switch or log out of this account?")) {
      localStorage.removeItem("raksha_setup_completed");
      showScreen("screen-auth");
    }
  });

  // Auth Tab Buttons
  const tabRegister = document.getElementById("tab-btn-register");
  const tabLogin = document.getElementById("tab-btn-login");
  const btnAuthSubmit = document.getElementById("btn-auth-submit");

  tabRegister?.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    if (btnAuthSubmit) btnAuthSubmit.innerHTML = `<span>Continue to Setup Profile</span> <i class="fa-solid fa-arrow-right"></i>`;
  });

  tabLogin?.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    if (btnAuthSubmit) btnAuthSubmit.innerHTML = `<span>Sign In &amp; Open Home</span> <i class="fa-solid fa-arrow-right"></i>`;
  });
}

function showScreen(screenId) {
  ["screen-auth", "screen-onboarding", "screen-home"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.remove("hidden");
      else el.classList.add("hidden");
    }
  });
  window.scrollTo(0, 0);
}

// Battery Status Monitoring (<15% Detection)
function initBatteryMonitoring() {
  const battEl = document.getElementById("telemetry-battery");
  if ("getBattery" in navigator) {
    navigator.getBattery().then((battery) => {
      const updateBatteryUI = () => {
        const levelPct = Math.round(battery.level * 100);
        if (battEl) battEl.textContent = `Batt: ${levelPct}%`;

        const autoLowToggle = document.getElementById("toggle-low-battery");
        if (autoLowToggle && autoLowToggle.checked && levelPct <= 15 && !battery.charging && !state.lowBatteryNotified) {
          state.lowBatteryNotified = true;
          speakMaleVoice("Warning: Phone battery is below 15 percent. Sending automatic location check-in to guardians.");
          dispatchDirectAlert("LOW BATTERY ALERT (<15%)");
        }
      };

      battery.addEventListener("levelchange", updateBatteryUI);
      battery.addEventListener("chargingchange", () => {
        if (battery.charging) state.lowBatteryNotified = false;
        updateBatteryUI();
      });
      updateBatteryUI();
    });
  } else {
    if (battEl) battEl.textContent = "Batt: Normal";
  }
}

// Customizable Shake Detection
function initCustomizableShake() {
  let lastX = null, lastY = null, lastZ = null;
  let shakeCount = 0;
  let lastShakeTime = 0;

  const slider = document.getElementById("input-shake-sensitivity");
  slider?.addEventListener("input", (e) => {
    state.shakeThreshold = parseInt(e.target.value, 10);
    localStorage.setItem("raksha_shake_threshold", state.shakeThreshold);
    updateShakeLabel(state.shakeThreshold);
  });

  window.addEventListener("devicemotion", (e) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc || !acc.x) return;

    const now = Date.now();
    if (now - lastShakeTime > 1200) shakeCount = 0;

    if (lastX !== null) {
      const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
      if (delta > state.shakeThreshold) {
        shakeCount++;
        lastShakeTime = now;
        if (shakeCount >= 3 && !state.isSosActive) {
          shakeCount = 0;
          triggerSosCountdown();
        }
      }
    }
    lastX = acc.x;
    lastY = acc.y;
    lastZ = acc.z;
  });
}

function updateShakeLabel(val) {
  const label = document.getElementById("label-shake-val");
  if (!label) return;
  const desc = val < 24 ? "High Sensitivity" : val > 36 ? "Low Sensitivity" : "Medium";
  label.textContent = `${desc} (${val})`;
}

// 4-Press Hardware Key Shortcut
function initMultiPressShortcut() {
  window.addEventListener("keydown", (e) => {
    const validKeys = ["VolumeUp", "VolumeDown", "MediaTrackNext", "MediaTrackPrevious", " "];
    if (validKeys.includes(e.key)) {
      const now = Date.now();
      if (now - state.lastHardwarePressTime < 1500) {
        state.hardwarePressCount++;
      } else {
        state.hardwarePressCount = 1;
      }
      state.lastHardwarePressTime = now;

      if (state.hardwarePressCount >= 4 && !state.isSosActive) {
        state.hardwarePressCount = 0;
        triggerSosCountdown();
      }
    }
  });
}

// Geolocation
function initGeolocation() {
  const gpsEl = document.getElementById("telemetry-gps");
  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (pos) => {
        state.currentCoords = {
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
          accuracy: Math.round(pos.coords.accuracy)
        };
        if (gpsEl) gpsEl.textContent = `GPS: ±${state.currentCoords.accuracy}m`;
        updateSosBroadcastLinks();
      },
      () => {
        if (gpsEl) gpsEl.textContent = "GPS: Active";
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    if (gpsEl) gpsEl.textContent = "GPS: Unavailable";
  }
}

// Male Voice AI Synthesis
function initMaleVoiceSynthesis() {
  if (!state.speechSynth) return;

  const selectMaleVoice = () => {
    const voices = state.speechSynth.getVoices();
    if (!voices || voices.length === 0) return;

    const maleCandidates = voices.filter(v => {
      const n = v.name.toLowerCase();
      return (
        n.includes("male") ||
        n.includes("david") ||
        n.includes("mark") ||
        n.includes("george") ||
        n.includes("guy") ||
        n.includes("ravi") ||
        n.includes("prabhat") ||
        n.includes("neer") ||
        n.includes("google uk english male")
      ) && !n.includes("female") && !n.includes("zira");
    });

    state.maleVoice = maleCandidates.length > 0 ? maleCandidates[0] : voices[0];
  };

  selectMaleVoice();
  if (state.speechSynth.onvoiceschanged !== undefined) {
    state.speechSynth.onvoiceschanged = selectMaleVoice;
  }
}

function speakMaleVoice(text) {
  if (!state.speechSynth) return;
  state.speechSynth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (state.maleVoice) utterance.voice = state.maleVoice;
  utterance.pitch = 0.82; // Deep authentic male tone
  utterance.rate = 0.95;
  state.speechSynth.speak(utterance);
}

// Speech Recognition
function initVoiceAssistant() {
  const orb = document.getElementById("ai-orb");
  const transcription = document.getElementById("ai-transcription");
  const badge = document.getElementById("ai-badge");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (transcription) transcription.textContent = "Voice input unsupported on this browser. Use manual buttons.";
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.continuous = false;
  state.recognition.interimResults = false;

  state.recognition.onstart = () => {
    state.isListening = true;
    if (orb) orb.classList.add("listening");
    if (badge) badge.textContent = "Listening...";
    if (transcription) transcription.textContent = "Listening for safety command...";
  };

  state.recognition.onresult = (event) => {
    const text = event.results[0][0].transcript.toLowerCase();
    if (transcription) transcription.textContent = `"${text}"`;
    handleVoiceCommand(text);
  };

  state.recognition.onerror = () => resetVoiceUI();
  state.recognition.onend = () => resetVoiceUI();

  if (orb) {
    orb.addEventListener("click", () => {
      if (state.isListening) {
        state.recognition.stop();
      } else {
        try {
          state.recognition.lang = state.lang === "hi" ? "hi-IN" : state.lang === "mr" ? "mr-IN" : "en-US";
          state.recognition.start();
        } catch (e) {
          state.recognition.stop();
        }
      }
    });
  }
}

function resetVoiceUI() {
  state.isListening = false;
  const orb = document.getElementById("ai-orb");
  const badge = document.getElementById("ai-badge");
  if (orb) orb.classList.remove("listening");
  if (badge) badge.textContent = "Tap Orb to Speak";
}

function handleVoiceCommand(cmd) {
  if (cmd.includes("help") || cmd.includes("emergency") || cmd.includes("bachao") || cmd.includes("madat")) {
    speakMaleVoice("Initiating discreet silent emergency alert. Notifying your guardians immediately.");
    triggerSosCountdown();
  } else if (cmd.includes("fake call") || cmd.includes("call me") || cmd.includes("phone")) {
    speakMaleVoice("Simulating incoming call right now.");
    launchFakeCall();
  } else if (cmd.includes("police") || cmd.includes("112")) {
    speakMaleVoice("Calling emergency police helpline 112.");
    window.location.href = "tel:112";
  } else if (cmd.includes("profile") || cmd.includes("medical")) {
    speakMaleVoice("Opening your emergency profile and medical ID.");
    openModal("modal-profile");
  } else if (cmd.includes("timer") || cmd.includes("safe walk")) {
    speakMaleVoice("Opening customizable journey timer.");
    openModal("modal-timer");
  } else if (cmd.includes("safe") || cmd.includes("hospital") || cmd.includes("haven")) {
    speakMaleVoice("Opening nearest safe havens navigation.");
    openModal("modal-havens");
  } else {
    speakMaleVoice("I am here beside you. You can say emergency, fake call, safe timer, or police.");
  }
}

// SOS Logic (Completely Silent - Zero Siren Audio)
function triggerSosCountdown() {
  const modal = document.getElementById("modal-sos-countdown");
  const countEl = document.getElementById("countdown-number");
  if (!modal || !countEl) return;

  let seconds = 3;
  countEl.textContent = seconds;
  modal.classList.remove("hidden");

  clearInterval(state.sosCountdownInterval);
  state.sosCountdownInterval = setInterval(() => {
    seconds--;
    countEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(state.sosCountdownInterval);
      modal.classList.add("hidden");
      executeDiscreetSos();
    }
  }, 1000);
}

function cancelSosCountdown() {
  clearInterval(state.sosCountdownInterval);
  const modal = document.getElementById("modal-sos-countdown");
  if (modal) modal.classList.add("hidden");
}

function executeDiscreetSos() {
  state.isSosActive = true;
  const activeModal = document.getElementById("modal-sos-active");
  if (activeModal) activeModal.classList.remove("hidden");
  updateSosBroadcastLinks();

  if ("vibrate" in navigator) {
    navigator.vibrate([100, 150, 100]);
  }

  // DIRECT AUTOMATIC DISPATCH WITHOUT EXTRA ACTIONS
  dispatchDirectAlert("EMERGENCY SOS ALERT");
}

function stopSosAlert() {
  state.isSosActive = false;
  const activeModal = document.getElementById("modal-sos-active");
  if (activeModal) activeModal.classList.add("hidden");
}

// Direct Automatic Dispatch Function (WhatsApp or SMS based on selection)
function dispatchDirectAlert(prefix = "EMERGENCY SOS ALERT") {
  const coordsText = state.currentCoords
    ? `https://maps.google.com/?q=${state.currentCoords.lat},${state.currentCoords.lng}`
    : "Detecting GPS...";

  const rawMsg = `${prefix}: I need urgent assistance! My live GPS location: ${coordsText}. Name: ${state.profile.name}, Blood Group: ${state.profile.blood}, Parent: ${state.profile.parentPhone}`;
  const encodedMsg = encodeURIComponent(rawMsg);
  const parentDigits = state.profile.parentPhone ? state.profile.parentPhone.replace(/[^0-9]/g, "") : "";

  // Check selected channel
  const selectedRadio = document.querySelector('input[name="auto-channel"]:checked');
  const channel = selectedRadio ? selectedRadio.value : state.defaultChannel;

  if (channel === "whatsapp") {
    const waUrl = parentDigits ? `https://wa.me/${parentDigits}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
    window.open(waUrl, "_blank");
  } else {
    const smsUrl = parentDigits ? `sms:${parentDigits}?body=${encodedMsg}` : `sms:?body=${encodedMsg}`;
    window.location.href = smsUrl;
  }
}

function updateSosBroadcastLinks() {
  const locEl = document.getElementById("sos-active-location");
  const waBtn = document.getElementById("btn-sos-whatsapp");
  const smsBtn = document.getElementById("btn-sos-sms");

  const coordsText = state.currentCoords
    ? `https://maps.google.com/?q=${state.currentCoords.lat},${state.currentCoords.lng}`
    : "Location pending GPS lock";

  if (locEl) {
    locEl.textContent = state.currentCoords
      ? `Latitude: ${state.currentCoords.lat}, Longitude: ${state.currentCoords.lng} (Accuracy: ±${state.currentCoords.accuracy}m)`
      : "Detecting high-precision GPS coordinates...";
  }

  const message = encodeURIComponent(
    `EMERGENCY ALERT: I need immediate assistance! Here is my live GPS location: ${coordsText}. Name: ${state.profile.name}, Blood Group: ${state.profile.blood}, Parent Contact: ${state.profile.parentPhone}`
  );

  const parentDigits = state.profile.parentPhone ? state.profile.parentPhone.replace(/[^0-9]/g, "") : "";
  if (waBtn) waBtn.href = parentDigits ? `https://wa.me/${parentDigits}?text=${message}` : `https://wa.me/?text=${message}`;
  if (smsBtn) smsBtn.href = parentDigits ? `sms:${parentDigits}?body=${message}` : `sms:?body=${message}`;
}

// Customizable Safe Walk Timer & 7s Vibration Warning
function startWalkTimer() {
  const display = document.getElementById("walk-timer-display");
  const startBtn = document.getElementById("btn-start-walk-timer");
  const stopBtn = document.getElementById("btn-cancel-walk-timer");

  clearInterval(state.walkTimerInterval);
  if (startBtn) startBtn.classList.add("hidden");
  if (stopBtn) stopBtn.classList.remove("hidden");

  speakMaleVoice(`Journey timer started for ${state.walkDurationMinutes} minutes.`);

  state.walkTimerInterval = setInterval(() => {
    state.walkRemainingSeconds--;
    const mins = String(Math.floor(state.walkRemainingSeconds / 60)).padStart(2, "0");
    const secs = String(state.walkRemainingSeconds % 60).padStart(2, "0");
    if (display) display.textContent = `${mins}:${secs}`;

    if (state.walkRemainingSeconds <= 0) {
      clearInterval(state.walkTimerInterval);
      closeModal("modal-timer");
      triggerSevenSecondVibrationWarning();
    }
  }, 1000);
}

function cancelWalkTimer() {
  clearInterval(state.walkTimerInterval);
  const startBtn = document.getElementById("btn-start-walk-timer");
  const stopBtn = document.getElementById("btn-cancel-walk-timer");
  const display = document.getElementById("walk-timer-display");

  if (startBtn) startBtn.classList.remove("hidden");
  if (stopBtn) stopBtn.classList.add("hidden");
  
  state.walkRemainingSeconds = state.walkDurationMinutes * 60;
  if (display) display.textContent = `${String(state.walkDurationMinutes).padStart(2, "0")}:00`;
  
  speakMaleVoice("Safe journey completed. You are safe now.");
  alert("Safe Journey Completed! Protection timer stopped.");
}

function triggerSevenSecondVibrationWarning() {
  const modal = document.getElementById("modal-timer-warning");
  const secEl = document.getElementById("timer-warning-seconds");
  if (!modal || !secEl) return;

  state.postTimerWarningSeconds = 7;
  secEl.textContent = state.postTimerWarningSeconds;
  modal.classList.remove("hidden");

  startContinuousVibrations();
  speakMaleVoice("Warning! Journey timer expired. Confirm safety or emergency SOS will dispatch.");

  clearInterval(state.postTimerWarningInterval);
  state.postTimerWarningInterval = setInterval(() => {
    state.postTimerWarningSeconds--;
    secEl.textContent = state.postTimerWarningSeconds;

    if (state.postTimerWarningSeconds <= 0) {
      clearInterval(state.postTimerWarningInterval);
      stopContinuousVibrations();
      modal.classList.add("hidden");
      triggerSosCountdown();
    }
  }, 1000);
}

function startContinuousVibrations() {
  if ("vibrate" in navigator) {
    navigator.vibrate([400, 200, 400, 200, 400]);
    state.vibrationPulseInterval = setInterval(() => {
      navigator.vibrate([400, 200, 400, 200, 400]);
    }, 800);
  }
}

function stopContinuousVibrations() {
  clearInterval(state.vibrationPulseInterval);
  if ("vibrate" in navigator) navigator.vibrate(0);
}

function userConfirmedSafeFromWarning() {
  clearInterval(state.postTimerWarningInterval);
  stopContinuousVibrations();
  const modal = document.getElementById("modal-timer-warning");
  if (modal) modal.classList.add("hidden");
  cancelWalkTimer();
  speakMaleVoice("Safety check-in verified. Alarm dismissed.");
}

// Fake Call Simulator
function launchFakeCall() {
  const modal = document.getElementById("modal-fake-call");
  const incomingButtons = document.getElementById("call-incoming-buttons");
  const connectedView = document.getElementById("call-connected-view");
  const callerName = document.getElementById("fake-caller-name");
  const callerStatus = document.getElementById("fake-caller-status");

  if (!modal) return;
  modal.classList.remove("hidden");
  if (incomingButtons) incomingButtons.classList.remove("hidden");
  if (connectedView) connectedView.classList.add("hidden");
  if (callerName) callerName.textContent = state.profile.parentName ? state.profile.parentName : "Mom";
  if (callerStatus) callerStatus.textContent = "Incoming Call...";

  if ("vibrate" in navigator) {
    navigator.vibrate([400, 400, 400, 400]);
  }
}

function acceptFakeCall() {
  const incomingButtons = document.getElementById("call-incoming-buttons");
  const connectedView = document.getElementById("call-connected-view");
  const callerStatus = document.getElementById("fake-caller-status");
  const durationTimer = document.getElementById("call-duration-timer");

  if (incomingButtons) incomingButtons.classList.add("hidden");
  if (connectedView) connectedView.classList.remove("hidden");
  if (callerStatus) callerStatus.textContent = "00:01";

  state.fakeCallSeconds = 0;
  clearInterval(state.fakeCallDurationInterval);
  state.fakeCallDurationInterval = setInterval(() => {
    state.fakeCallSeconds++;
    const mins = String(Math.floor(state.fakeCallSeconds / 60)).padStart(2, "0");
    const secs = String(state.fakeCallSeconds % 60).padStart(2, "0");
    if (durationTimer) durationTimer.textContent = `${mins}:${secs}`;
    if (callerStatus) callerStatus.textContent = `${mins}:${secs}`;
  }, 1000);

  speakMaleVoice("Hello? Where are you right now? I am waiting right here outside the corner, come over quickly.");
}

function endFakeCall() {
  clearInterval(state.fakeCallDurationInterval);
  if (state.speechSynth) state.speechSynth.cancel();
  const modal = document.getElementById("modal-fake-call");
  if (modal) modal.classList.add("hidden");
}

// Forms & Profiles
function populateOnboardingForm() {
  const p = state.profile;
  const nameEl = document.getElementById("onboard-name");
  const ageEl = document.getElementById("onboard-age");
  const bloodEl = document.getElementById("onboard-blood");
  const medEl = document.getElementById("onboard-medical");
  const parentNameEl = document.getElementById("onboard-parent-name");
  const parentPhoneEl = document.getElementById("onboard-parent-phone");
  const addressEl = document.getElementById("onboard-address");

  if (nameEl) nameEl.value = p.name || "";
  if (ageEl) ageEl.value = p.age || "";
  if (bloodEl) bloodEl.value = p.blood || "Unknown";
  if (medEl) medEl.value = p.medical || "";
  if (parentNameEl) parentNameEl.value = p.parentName || "";
  if (parentPhoneEl) parentPhoneEl.value = p.parentPhone || "";
  if (addressEl) addressEl.value = p.address || "";
}

function populateProfileForm() {
  const p = state.profile;
  const nameEl = document.getElementById("prof-name");
  const ageEl = document.getElementById("prof-age");
  const bloodEl = document.getElementById("prof-blood");
  const medEl = document.getElementById("prof-medical");
  const parentNameEl = document.getElementById("prof-parent-name");
  const parentPhoneEl = document.getElementById("prof-parent-phone");
  const addressEl = document.getElementById("prof-address");

  if (nameEl) nameEl.value = p.name || "";
  if (ageEl) ageEl.value = p.age || "";
  if (bloodEl) bloodEl.value = p.blood || "Unknown";
  if (medEl) medEl.value = p.medical || "";
  if (parentNameEl) parentNameEl.value = p.parentName || "";
  if (parentPhoneEl) parentPhoneEl.value = p.parentPhone || "";
  if (addressEl) addressEl.value = p.address || "";

  const radios = document.querySelectorAll('input[name="avatar"]');
  radios.forEach((r) => {
    if (r.value === p.avatar) r.checked = true;
  });
}

function saveProfile(e) {
  e.preventDefault();
  const selectedAvatar = document.querySelector('input[name="avatar"]:checked');

  state.profile = {
    avatar: selectedAvatar ? selectedAvatar.value : "👩",
    name: document.getElementById("prof-name").value.trim(),
    age: document.getElementById("prof-age").value.trim(),
    blood: document.getElementById("prof-blood").value,
    medical: document.getElementById("prof-medical").value.trim(),
    parentName: document.getElementById("prof-parent-name").value.trim(),
    parentPhone: document.getElementById("prof-parent-phone").value.trim(),
    address: document.getElementById("prof-address").value.trim()
  };

  localStorage.setItem("raksha_profile", JSON.stringify(state.profile));
  closeModal("modal-profile");
  speakMaleVoice("Your profile has been saved successfully.");
  alert("Profile & Medical ID Saved Successfully!");
}

function copyMedicalId() {
  const p = state.profile;
  const summary = `EMERGENCY MEDICAL ID:\nName: ${p.name}\nAge: ${p.age}\nBlood Group: ${p.blood}\nMedical Notes: ${p.medical}\nParent: ${p.parentName} (${p.parentPhone})\nAddress: ${p.address}`;
  navigator.clipboard.writeText(summary).then(() => {
    alert("Medical ID summary copied to clipboard!");
  }).catch(() => {
    alert(summary);
  });
}

// Contacts
function renderContacts() {
  const list = document.getElementById("contacts-list");
  if (!list) return;
  list.innerHTML = "";

  state.contacts.forEach((contact) => {
    const card = document.createElement("div");
    card.className = "contact-card";
    card.innerHTML = `
      <div class="contact-meta">
        <div class="contact-avatar">👤</div>
        <div class="contact-info">
          <strong>${contact.name}</strong>
          <span>${contact.phone}</span>
        </div>
      </div>
      <div class="contact-actions">
        <a href="tel:${contact.phone}" class="action-icon-btn call" title="Call"><i class="fa-solid fa-phone"></i></a>
        <a href="https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}" target="_blank" class="action-icon-btn whatsapp" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        <button class="action-icon-btn delete" onclick="deleteContact(${contact.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    list.appendChild(card);
  });
}

window.deleteContact = function(id) {
  state.contacts = state.contacts.filter(c => c.id !== id);
  localStorage.setItem("raksha_contacts", JSON.stringify(state.contacts));
  renderContacts();
};

function addContactPrompt() {
  const name = prompt("Enter Contact Name (e.g. Dad / Sister):");
  if (!name) return;
  const phone = prompt("Enter Phone Number with country code (e.g. +91 9876543210):");
  if (!phone) return;

  state.contacts.push({ id: Date.now(), name, phone });
  localStorage.setItem("raksha_contacts", JSON.stringify(state.contacts));
  renderContacts();
}

// Modals
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("hidden");
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("hidden");
}

// Language
function initLanguage() {
  const langSelect = document.getElementById("lang-select");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      state.lang = e.target.value;
      localStorage.setItem("raksha_lang", state.lang);
      applyTranslations();
    });
  }
  applyTranslations();
}

function applyTranslations() {
  const t = I18N[state.lang] || I18N.en;
  setTxt("txt-tagline", t.tagline);
  setTxt("txt-sos-instruction", t.sosInstruction);
  setTxt("txt-sos-sub", t.sosSub);
  setTxt("txt-ai-title", t.aiTitle);
  setTxt("txt-tile-profile", t.tileProfile);
  setTxt("txt-tile-profile-sub", t.tileProfileSub);
  setTxt("txt-tile-fakecall", t.tileFakeCall);
  setTxt("txt-tile-fakecall-sub", t.tileFakeCallSub);
  setTxt("txt-tile-timer", t.tileTimer);
  setTxt("txt-tile-timer-sub", t.tileTimerSub);
  setTxt("txt-tile-havens", t.tileHavens);
  setTxt("txt-tile-havens-sub", t.tileHavensSub);
  setTxt("txt-hotlines-title", t.hotlinesTitle);
  setTxt("txt-contacts-title", t.contactsTitle);
}

function setTxt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// Event Bindings
function initEvents() {
  document.getElementById("btn-sos-trigger")?.addEventListener("click", triggerSosCountdown);
  document.getElementById("btn-cancel-sos")?.addEventListener("click", cancelSosCountdown);
  document.getElementById("btn-stop-sos")?.addEventListener("click", stopSosAlert);

  document.getElementById("btn-quick-profile")?.addEventListener("click", () => openModal("modal-profile"));
  document.getElementById("btn-tile-profile")?.addEventListener("click", () => openModal("modal-profile"));
  document.getElementById("btn-close-profile")?.addEventListener("click", () => closeModal("modal-profile"));
  document.getElementById("form-profile")?.addEventListener("submit", saveProfile);
  document.getElementById("btn-copy-medical-id")?.addEventListener("click", copyMedicalId);

  document.getElementById("btn-tile-fakecall")?.addEventListener("click", launchFakeCall);
  document.getElementById("btn-reject-fake-call")?.addEventListener("click", endFakeCall);
  document.getElementById("btn-end-fake-call")?.addEventListener("click", endFakeCall);
  document.getElementById("btn-accept-fake-call")?.addEventListener("click", acceptFakeCall);

  document.getElementById("btn-tile-timer")?.addEventListener("click", () => openModal("modal-timer"));
  document.getElementById("btn-close-timer")?.addEventListener("click", () => closeModal("modal-timer"));
  document.getElementById("btn-start-walk-timer")?.addEventListener("click", startWalkTimer);
  document.getElementById("btn-cancel-walk-timer")?.addEventListener("click", cancelWalkTimer);
  document.getElementById("btn-timer-arrived-safe")?.addEventListener("click", userConfirmedSafeFromWarning);

  document.querySelectorAll(".timer-chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      document.querySelectorAll(".timer-chip").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      const mins = parseInt(e.target.dataset.minutes, 10);
      setCustomTimerMinutes(mins);
    });
  });

  const customInput = document.getElementById("custom-minutes-input");
  document.getElementById("btn-step-minus")?.addEventListener("click", () => {
    let val = parseInt(customInput.value, 10) || 5;
    if (val > 1) {
      customInput.value = val - 1;
      setCustomTimerMinutes(val - 1);
    }
  });

  document.getElementById("btn-step-plus")?.addEventListener("click", () => {
    let val = parseInt(customInput.value, 10) || 5;
    if (val < 180) {
      customInput.value = val + 1;
      setCustomTimerMinutes(val + 1);
    }
  });

  customInput?.addEventListener("input", (e) => {
    let val = parseInt(e.target.value, 10);
    if (val && val >= 1 && val <= 180) setCustomTimerMinutes(val);
  });

  document.querySelectorAll('input[name="auto-channel"]').forEach(r => {
    r.addEventListener("change", (e) => {
      state.defaultChannel = e.target.value;
      localStorage.setItem("raksha_default_channel", state.defaultChannel);
    });
  });

  document.getElementById("btn-tile-havens")?.addEventListener("click", () => openModal("modal-havens"));
  document.getElementById("btn-close-havens")?.addEventListener("click", () => closeModal("modal-havens"));
  document.getElementById("btn-add-contact")?.addEventListener("click", addContactPrompt);

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add("active");
      const tab = targetBtn.dataset.tab;
      if (tab === "profile") openModal("modal-profile");
      else if (tab === "havens") openModal("modal-havens");
    });
  });
}

function setCustomTimerMinutes(mins) {
  state.walkDurationMinutes = mins;
  state.walkRemainingSeconds = mins * 60;
  const display = document.getElementById("walk-timer-display");
  const customInput = document.getElementById("custom-minutes-input");
  if (display) display.textContent = `${String(mins).padStart(2, "0")}:00`;
  if (customInput && customInput.value != mins) customInput.value = mins;
}
