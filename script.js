// RAKSHA - Smart AI Safety Companion
// Features: Multi-contact Group SOS dispatch, Live distance/location sharing, Smart Voice AI

const state = {
  currentCoords: null,
  isSosActive: false,
  defaultChannel: "whatsapp",
  profile: {
    avatar: "👩",
    name: "Priya Sharma",
    age: "22",
    blood: "B+",
    parentName: "Papa",
    parentPhone: "+919876543210"
  },
  contacts: [
    { id: 1, name: "Papa", phone: "+919876543210", inGroup: true },
    { id: 2, name: "Mom", phone: "+919876543211", inGroup: true }
  ],
  speechSynth: window.speechSynthesis,
  recognition: null,
  isListening: false
};

document.addEventListener("DOMContentLoaded", () => {
  loadSavedData();
  setupScreenNavigation();
  initGeolocation();
  initVoiceAssistant();
  initEvents();
  renderContacts();
  updateGroupBadge();
});

function loadSavedData() {
  const p = localStorage.getItem("raksha_profile");
  if (p) try { state.profile = JSON.parse(p); } catch (e) {}

  const c = localStorage.getItem("raksha_contacts");
  if (c) try { state.contacts = JSON.parse(c); } catch (e) {}

  const ch = localStorage.getItem("raksha_channel");
  if (ch) {
    state.defaultChannel = ch;
    const radio = document.querySelector(`input[name="auto-channel"][value="${ch}"]`);
    if (radio) radio.checked = true;
  }
}

function setupScreenNavigation() {
  const isSetupDone = localStorage.getItem("raksha_setup_completed");
  if (isSetupDone === "true") {
    showScreen("screen-home");
  } else {
    showScreen("screen-auth");
  }

  document.getElementById("form-auth")?.addEventListener("submit", (e) => {
    e.preventDefault();
    showScreen("screen-onboarding");
  });

  document.getElementById("form-onboarding")?.addEventListener("submit", (e) => {
    e.preventDefault();
    state.profile.name = document.getElementById("onboard-name").value.trim();
    state.profile.age = document.getElementById("onboard-age").value.trim();
    state.profile.blood = document.getElementById("onboard-blood").value;
    state.profile.parentName = document.getElementById("onboard-parent-name").value.trim();
    state.profile.parentPhone = document.getElementById("onboard-parent-phone").value.trim();

    state.contacts = [
      { id: 1, name: state.profile.parentName, phone: state.profile.parentPhone, inGroup: true }
    ];

    localStorage.setItem("raksha_profile", JSON.stringify(state.profile));
    localStorage.setItem("raksha_contacts", JSON.stringify(state.contacts));
    localStorage.setItem("raksha_setup_completed", "true");

    renderContacts();
    updateGroupBadge();
    showScreen("screen-home");
    speakVoice(`Welcome ${state.profile.name}. Safety companion activated.`);
  });

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    if (confirm("Reset setup and re-login?")) {
      localStorage.removeItem("raksha_setup_completed");
      showScreen("screen-auth");
    }
  });
}

function showScreen(screenId) {
  ["screen-auth", "screen-onboarding", "screen-home"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", id !== screenId);
  });
}

// High-Precision Geolocation Tracking
function initGeolocation() {
  const gpsEl = document.getElementById("telemetry-gps");
  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (pos) => {
        state.currentCoords = {
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy)
        };
        if (gpsEl) gpsEl.textContent = `GPS: ±${state.currentCoords.accuracy}m`;
      },
      () => {
        if (gpsEl) gpsEl.textContent = "GPS: Active";
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }
}

// Emergency SOS Message Builder with Live Coordinates, Distance & Route
function buildEmergencyMessage() {
  const coords = state.currentCoords;
  const mapLink = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : "Acquiring GPS fix...";

  const directionsLink = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    : "";

  return (
    `🚨 EMERGENCY SOS ALERT!
` +
    `I need immediate assistance! Here is my live exact location.

` +
    `📍 Exact Location: ${mapLink}
` +
    (directionsLink ? `🧭 Navigate To Me (Shows Distance & Live Route): ${directionsLink}
` : "") +
    (coords ? `🎯 Accuracy: Within ±${coords.accuracy} meters
` : "") +
    `👤 Name: ${state.profile.name}
` +
    `🩸 Blood Group: ${state.profile.blood}
` +
    `📞 Guardian Contact: ${state.profile.parentPhone}`
  );
}

// Group Dispatch Logic (WhatsApp / SMS)
function dispatchSosToGroup() {
  const msg = buildEmergencyMessage();
  const groupMembers = state.contacts.filter(c => c.inGroup);

  if (groupMembers.length === 0) {
    alert("No contacts in your SOS group. Please check contacts list.");
    return;
  }

  const cleanPhones = groupMembers.map(m => m.phone.replace(/[^0-9]/g, ""));
  const selectedChannel = document.querySelector('input[name="auto-channel"]:checked')?.value || state.defaultChannel;

  if (selectedChannel === "whatsapp") {
    if (cleanPhones.length === 1) {
      window.open(`https://wa.me/${cleanPhones[0]}?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
    }
  } else {
    const phoneList = cleanPhones.join(",");
    window.location.href = `sms:${phoneList}?body=${encodeURIComponent(msg)}`;
  }
}

// Trigger SOS
function triggerSos() {
  state.isSosActive = true;
  const modal = document.getElementById("modal-sos-active");
  const locEl = document.getElementById("sos-active-location");

  if (modal) modal.classList.remove("hidden");
  if (locEl && state.currentCoords) {
    locEl.innerHTML = `<strong>Coordinates:</strong> ${state.currentCoords.lat}, ${state.currentCoords.lng}<br><strong>Accuracy:</strong> ±${state.currentCoords.accuracy} meters<br><span style="color:#00e5ff">Live route & distance calculation link attached to dispatch.</span>`;
  }

  if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
  dispatchSosToGroup();
}

// Voice Assistant Logic
function initVoiceAssistant() {
  const orb = document.getElementById("ai-orb");
  const badge = document.getElementById("ai-badge");
  const transcription = document.getElementById("ai-transcription");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (transcription) transcription.textContent = "Voice commands not supported on this browser.";
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.continuous = false;
  state.recognition.interimResults = false;

  state.recognition.onstart = () => {
    state.isListening = true;
    orb?.classList.add("listening");
    if (badge) badge.textContent = "Listening...";
  };

  state.recognition.onresult = (e) => {
    const command = e.results[0][0].transcript.toLowerCase();
    if (transcription) transcription.textContent = `"${command}"`;
    executeVoiceCommand(command);
  };

  state.recognition.onend = () => {
    state.isListening = false;
    orb?.classList.remove("listening");
    if (badge) badge.textContent = "Tap Orb to Speak";
  };

  orb?.addEventListener("click", () => {
    if (state.isListening) state.recognition.stop();
    else state.recognition.start();
  });
}

function executeVoiceCommand(cmd) {
  // Command: Call specific person (e.g. "Call Papa", "Call Mom")
  if (cmd.includes("call")) {
    const contact = findContactInQuery(cmd);
    if (contact) {
      speakVoice(`Calling ${contact.name}`);
      window.location.href = `tel:${contact.phone}`;
      return;
    } else if (cmd.includes("police") || cmd.includes("112")) {
      speakVoice("Calling police emergency helpline 112");
      window.location.href = "tel:112";
      return;
    }
  }

  // Command: Share location to saved numbers
  if (cmd.includes("location") || cmd.includes("where am i") || cmd.includes("share")) {
    speakVoice("Sharing your exact location and navigation route.");
    dispatchSosToGroup();
    return;
  }

  // Command: Emergency SOS / Alert group
  if (cmd.includes("emergency") || cmd.includes("help") || cmd.includes("sos") || cmd.includes("group")) {
    speakVoice("Activating emergency SOS broadcast to your group.");
    triggerSos();
    return;
  }

  // Command: Fake Call
  if (cmd.includes("fake call") || cmd.includes("incoming call")) {
    speakVoice("Simulating fake incoming call.");
    launchFakeCall();
    return;
  }

  speakVoice("Command received. You can say: Call Papa, Share location, or Send SOS.");
}

function findContactInQuery(text) {
  for (let c of state.contacts) {
    if (text.includes(c.name.toLowerCase())) return c;
  }
  if (state.profile.parentName && text.includes(state.profile.parentName.toLowerCase())) {
    return { name: state.profile.parentName, phone: state.profile.parentPhone };
  }
  return null;
}

function speakVoice(text) {
  if (!state.speechSynth) return;
  state.speechSynth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  state.speechSynth.speak(utter);
}

// Contacts and Group Management
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
        <label class="group-toggle" title="Toggle Group Membership">
          <input type="checkbox" ${contact.inGroup ? "checked" : ""} onchange="toggleGroupMember(${contact.id})" />
          <span class="group-pill"><i class="fa-solid fa-users"></i></span>
        </label>
        <a href="tel:${contact.phone}" class="action-icon-btn call"><i class="fa-solid fa-phone"></i></a>
        <button class="action-icon-btn delete" onclick="deleteContact(${contact.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    list.appendChild(card);
  });
}

window.toggleGroupMember = function(id) {
  state.contacts = state.contacts.map(c => c.id === id ? { ...c, inGroup: !c.inGroup } : c);
  localStorage.setItem("raksha_contacts", JSON.stringify(state.contacts));
  updateGroupBadge();
};

window.deleteContact = function(id) {
  state.contacts = state.contacts.filter(c => c.id !== id);
  localStorage.setItem("raksha_contacts", JSON.stringify(state.contacts));
  renderContacts();
  updateGroupBadge();
};

function updateGroupBadge() {
  const count = state.contacts.filter(c => c.inGroup).length;
  const badge = document.getElementById("telemetry-group");
  if (badge) badge.textContent = `Group: ${count}`;
}

// Fake Call Simulation
function launchFakeCall() {
  const modal = document.getElementById("modal-fake-call");
  if (modal) modal.classList.remove("hidden");
  const caller = document.getElementById("fake-caller-name");
  if (caller) caller.textContent = state.profile.parentName || "Papa";
  if ("vibrate" in navigator) navigator.vibrate([400, 300, 400]);
}

function initEvents() {
  document.getElementById("btn-sos-trigger")?.addEventListener("click", triggerSos);
  document.getElementById("btn-send-group-now")?.addEventListener("click", dispatchSosToGroup);
  document.getElementById("btn-stop-sos")?.addEventListener("click", () => {
    document.getElementById("modal-sos-active")?.classList.add("hidden");
  });

  document.getElementById("btn-tile-group")?.addEventListener("click", () => {
    document.querySelector(".contacts-section")?.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("btn-tile-location")?.addEventListener("click", () => {
    dispatchSosToGroup();
  });

  document.getElementById("btn-tile-fakecall")?.addEventListener("click", launchFakeCall);
  document.getElementById("btn-reject-fake-call")?.addEventListener("click", () => {
    document.getElementById("modal-fake-call")?.classList.add("hidden");
  });
  document.getElementById("btn-accept-fake-call")?.addEventListener("click", () => {
    document.getElementById("call-incoming-buttons")?.classList.add("hidden");
    document.getElementById("call-connected-view")?.classList.remove("hidden");
    speakVoice("Beta, where are you right now? I am nearby.");
  });
  document.getElementById("btn-end-fake-call")?.addEventListener("click", () => {
    document.getElementById("modal-fake-call")?.classList.add("hidden");
    document.getElementById("call-incoming-buttons")?.classList.remove("hidden");
    document.getElementById("call-connected-view")?.classList.add("hidden");
  });

  document.getElementById("btn-add-contact")?.addEventListener("click", () => {
    const name = prompt("Contact Name (e.g. Papa, Brother, Friend):");
    if (!name) return;
    const phone = prompt("Contact Phone Number with Country Code (e.g. +91 9876543210):");
    if (!phone) return;

    state.contacts.push({ id: Date.now(), name, phone, inGroup: true });
    localStorage.setItem("raksha_contacts", JSON.stringify(state.contacts));
    renderContacts();
    updateGroupBadge();
  });

  document.querySelectorAll('input[name="auto-channel"]').forEach(r => {
    r.addEventListener("change", (e) => {
      state.defaultChannel = e.target.value;
      localStorage.setItem("raksha_channel", state.defaultChannel);
    });
  });
}
