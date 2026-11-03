# Raksha - Smart AI Women Safety Companion

## Clean Separated Code Structure
This package has all files clearly split into dedicated frontend components:
- `index.html`: Clean HTML5 markup containing Screen 1 (Sign Up/Sign In), Screen 2 (Profile Setup), and Screen 3 (Main Dashboard).
- `style.css`: Dedicated styling rules, cyber-safe color variables, glassmorphic layout, buttons, and animations.
- `script.js`: Clean JavaScript containing geolocation, battery detection, male speech voice, automated direct WhatsApp/SMS triggers, customizable shake, and timer logic.

## Key Features Included:
1. **Direct Automated SOS**: Choose default channel (WhatsApp or Direct SMS). When SOS triggers, the message + live coordinates automatically dispatch without extra clicks.
2. **Low Battery Auto-Detection (< 15%)**: Automatic trigger using the Web Battery API.
3. **Customizable Shake Threshold**: Adjust sensitivity from High (15) to Low (50) with the live slider.
4. **4-Press Hardware Shortcut**: Rapidly pressing volume keys or spacebar 4 times within 1.5 seconds triggers silent SOS.
5. **Authentic Male Voice AI**: Authoritative male voice assistant via Web Speech API (`pitch: 0.82`, `rate: 0.95`).
6. **Customizable Journey Timer with 7s Vibration Warning**: Custom 1–180 minute timer with continuous phone vibration countdown before auto-SOS.
7. **Discreet Stealth SOS**: All sirens and oscillators are removed for stealth security.

## How to Run:
1. Extract the ZIP file.
2. Open `index.html` in Google Chrome or Microsoft Edge.
