# ClickCount

A simple web app that uses your phone's microphone to count clicks and other sharp sounds in real time.

## What is it for?

Originally built to count **insulin pen clicks** and **Mounjaro (tirzepatide) pen doses** — just hold your phone near the pen while dialing and let the app count for you. No more second-guessing if you dialed the right number of units.

But it works for anything that makes a distinct click or tap sound:

- Counting reps on a mechanical counter
- Tracking knitting row counter clicks
- Monitoring metronome beats
- Any repetitive sound you need to keep track of

## Try it

**[https://ficosta.github.io/ClickCount/](https://ficosta.github.io/ClickCount/)**

Works on any modern browser with microphone access (Chrome, Safari, Firefox). Best on mobile — just open the link on your phone.

## How to Use

1. Open the app and tap **START**
2. Grant microphone permission when prompted
3. Hold your phone near the sound source
4. The big number counts each detected click
5. Tap the log icon (top right) to see a history of detected clicks
6. Adjust **Settings** if needed — lower sensitivity = picks up quieter clicks

## Settings

| Parameter | Default | What it does |
|-----------|---------|--------------|
| **Sensitivity** | 0.03 | Peak threshold — lower picks up quieter sounds |
| **Cooldown** | 30 ms | Minimum gap between clicks (prevents double-counting) |
| **Noise adapt** | 0.995 | How fast it adjusts to background noise (higher = slower) |

## How It Works

The app uses the Web Audio API with an AudioWorklet processor to analyze microphone input in real time. A click is detected when the audio signal spikes above both an absolute threshold and a relative threshold compared to the ambient noise level. A cooldown timer prevents the same sound from being counted twice.

No data leaves your device — all processing happens locally in your browser.
