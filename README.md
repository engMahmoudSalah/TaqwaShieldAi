# Taqwa Shield AI

Arabic browser extension (Chrome, Manifest V3) that detects and blurs inappropriate images in real time, using an on-device AI model. The project also ships a web demo page that explains the extension and previews its popup.

**Live demo:** https://taqwa-shield-ai.mahmodsalah.workers.dev

## Features

- Real-time image scanning in the page with TensorFlow.js and NSFWJS, fully on the device: images are never uploaded
- Proactive blur before an image is shown, removed only when the image is judged safe
- Settings popup: on/off switch, sensitivity, optional extra blurring, counter of blurred images
- Arabic, right-to-left interface with light and dark themes

## Tech stack

React, TypeScript, Vite, Tailwind CSS, TensorFlow.js, NSFWJS, Chrome Extension APIs (content script, background worker, storage).

## Hosting

The demo page runs on Cloudflare Workers (static assets). The extension itself is installed from a local build.

## Build and install the extension

```bash
npm install
npm run build
```

Open chrome://extensions, enable Developer mode, choose "Load unpacked" and select the `dist` folder.

## Run the demo locally

```bash
npm run dev
```

## Author

Mahmoud Salah, https://github.com/engMahmoudSalah
