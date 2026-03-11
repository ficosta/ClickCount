# ClickCount

A web app that listens to your microphone and counts sharp transient sounds (clicks). Designed for counting insulin pen clicks — hold your phone near the pen and let the app count for you.

## How to Use

1. **Serve the files** over HTTP (required for microphone access and AudioWorklet):
   ```bash
   cd ClickCount
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000` in your browser.
3. Tap **Start**, grant microphone permission, and begin clicking.
4. The large counter increments with each detected click. A click log shows recent detections with timing and peak amplitude.

## HTTPS Requirement

`getUserMedia` requires a **secure context**. `localhost` works for development, but to use on a mobile device over the network you need HTTPS. Options:

- Use a tunneling service (e.g., `ngrok http 8000`)
- Serve with a self-signed certificate
- Deploy to any static hosting with HTTPS (GitHub Pages, Netlify, etc.)

## Tuning Parameters

Open the **Settings** panel in the app to adjust:

| Parameter | Default | Effect |
|-----------|---------|--------|
| **Sensitivity** | 0.15 | Absolute peak threshold — lower = more sensitive |
| **Cooldown** | 80 ms | Minimum time between detected clicks |
| **Noise adapt** | 0.995 | How quickly ambient noise level adapts (higher = slower) |

## How It Works

Audio from the microphone is analyzed in an AudioWorklet processor. A click is detected when:
- The peak amplitude exceeds the absolute threshold
- The RMS energy exceeds the ambient average by a relative factor (3x)
- Enough time has passed since the last click (cooldown)

This dual-threshold approach rejects quiet background noise while adapting to varying mic distances and automatic gain control.
