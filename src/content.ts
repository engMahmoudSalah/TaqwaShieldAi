import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';

// LRU Cache implementation to prevent memory leaks on long-lived pages
class LRUCache<K, V> {
  private max: number;
  private cache: Map<K, V>;

  constructor(max = 2000) {
    this.max = max;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (item !== undefined) {
      // Refresh the item's position
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key: K, val: V) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.max) {
      // Evict the oldest item
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, val);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}

// Configuration and state
let model: nsfwjs.NSFWJS | null = null;
let modelPromise: Promise<nsfwjs.NSFWJS | null> | null = null;
let isEnabled = true;
let sensitivity = 'Medium';
let blurFemales = true;
let started = false;

// Cache keeps the raw scores, so changing sensitivity re-evaluates without re-classifying.
type Scores = { strong: number; sexy: number };
const mediaCache = new LRUCache<string, Scores>(2000);

const getThreshold = () => {
  switch (sensitivity) {
    case 'Low': return 0.8;
    case 'High': return 0.4;
    case 'Medium':
    default: return 0.6;
  }
};

const MIN_SIZE = 48; // ignore icons and tracking pixels

const toScores = (predictions: { className: string; probability: number }[]): Scores => {
  let strong = 0;
  let sexy = 0;
  for (const p of predictions) {
    if (p.className === 'Porn' || p.className === 'Hentai') strong = Math.max(strong, p.probability);
    if (p.className === 'Sexy') sexy = p.probability;
  }
  return { strong, sexy };
};
// The model has no female detector, so the "Sexy" class is used as a proxy when that option is on.
const isFlagged = (s: Scores) => s.strong > getThreshold() || (blurFemales && s.sexy > getThreshold());

// Small work queue: classify at most 2 media items at a time so busy pages stay responsive.
const MAX_CONCURRENT = 2;
let running = 0;
const queue: Array<() => Promise<void>> = [];
const enqueue = (job: () => Promise<void>) => {
  queue.push(job);
  pump();
};
const pump = () => {
  while (running < MAX_CONCURRENT && queue.length) {
    const job = queue.shift()!;
    running++;
    job().finally(() => {
      running--;
      pump();
    });
  }
};

// Load the NSFWJS model once
const loadModel = (): Promise<nsfwjs.NSFWJS | null> => {
  if (model) return Promise.resolve(model);
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        await tf.ready();
        model = await nsfwjs.load();
        return model;
      } catch (error) {
        console.error('TaqwaShield: Error loading model', error);
        modelPromise = null;
        return null;
      }
    })();
  }
  return modelPromise;
};

const countBlur = () => {
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    try { chrome.runtime.sendMessage({ action: 'incrementBlurCount' }); } catch { /* extension reloaded */ }
  }
};

// Proactive blur: hide an image while it is being checked
const holdElement = (el: HTMLElement) => {
  if (el.hasAttribute('data-taqwashield-blurred') || el.hasAttribute('data-taqwashield-pending')) return;
  el.setAttribute('data-taqwashield-pending', 'true');
  el.style.filter = 'blur(40px)';
};
const releaseElement = (el: HTMLElement) => {
  if (!el.hasAttribute('data-taqwashield-pending')) return;
  el.removeAttribute('data-taqwashield-pending');
  if (!el.hasAttribute('data-taqwashield-blurred')) el.style.filter = '';
};
const blurElement = (el: HTMLElement) => {
  el.removeAttribute('data-taqwashield-pending');
  if (el.getAttribute('data-taqwashield-blurred') === 'true') return;
  el.style.filter = 'blur(40px)';
  el.style.transition = 'filter 0.3s ease-in-out';
  el.setAttribute('data-taqwashield-blurred', 'true');
  countBlur();
};
const unblurAllMedia = () => {
  document.querySelectorAll('[data-taqwashield-blurred="true"], [data-taqwashield-pending="true"]').forEach((el) => {
    (el as HTMLElement).style.filter = '';
    el.removeAttribute('data-taqwashield-blurred');
    el.removeAttribute('data-taqwashield-pending');
  });
};

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

// Check one image URL and blur or release the element
const processImageUrl = async (url: string, el: HTMLElement) => {
  const cached = mediaCache.get(url);
  if (cached) {
    if (isFlagged(cached)) blurElement(el); else releaseElement(el);
    return;
  }
  const m = await loadModel();
  if (!m || !isEnabled) { releaseElement(el); return; }
  try {
    const img = await loadImage(url);
    if (img.naturalWidth < MIN_SIZE || img.naturalHeight < MIN_SIZE) { mediaCache.set(url, { strong: 0, sexy: 0 }); releaseElement(el); return; }
    const scores = toScores(await m.classify(img));
    mediaCache.set(url, scores);
    if (isFlagged(scores)) blurElement(el); else releaseElement(el);
  } catch {
    // The image could not be read (blocked by CORS or failed to load). Show it rather than break the page.
    releaseElement(el);
  }
};

const videoTimers = new WeakMap<HTMLVideoElement, number>();
const analyzeVideoFrame = async (video: HTMLVideoElement) => {
  if (!isEnabled || video.readyState < 2 || video.videoWidth < MIN_SIZE) return;
  const m = await loadModel();
  if (!m) return;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (isFlagged(toScores(await m.classify(canvas)))) blurElement(video);
  } catch {
    // Cross-origin video frames cannot be read
  }
};

const analyzeMedia = (el: HTMLElement) => {
  if (!isEnabled) return;
  if (el.tagName === 'IMG') {
    const img = el as HTMLImageElement;
    const src = img.currentSrc || img.src;
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) { releaseElement(el); return; }
    if (img.complete && (img.naturalWidth < MIN_SIZE || img.naturalHeight < MIN_SIZE) && img.naturalWidth > 0) { releaseElement(el); return; }
    holdElement(el);
    enqueue(() => processImageUrl(src, el));
  } else if (el.tagName === 'VIDEO') {
    const video = el as HTMLVideoElement;
    enqueue(() => analyzeVideoFrame(video));
    if (!video.hasAttribute('data-taqwashield-video-listener')) {
      video.setAttribute('data-taqwashield-video-listener', 'true');
      const stop = () => {
        const id = videoTimers.get(video);
        if (id !== undefined) { clearInterval(id); videoTimers.delete(video); }
      };
      video.addEventListener('play', () => {
        stop();
        videoTimers.set(video, window.setInterval(() => {
          if (!video.isConnected) return stop();
          if (!video.paused && !video.ended) enqueue(() => analyzeVideoFrame(video));
        }, 2000));
      });
      video.addEventListener('pause', stop);
      video.addEventListener('ended', stop);
    }
  } else {
    // Background images, only on elements that actually have one
    const bg = window.getComputedStyle(el).backgroundImage;
    if (bg && bg.startsWith('url(')) {
      const url = bg.slice(4, -1).replace(/["']/g, '');
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) return;
      enqueue(() => processImageUrl(url, el));
    }
  }
};

// Only analyze media that is near the viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target as HTMLElement;
    analyzeMedia(el);
    if (el.tagName !== 'VIDEO') observer.unobserve(el);
  });
}, { rootMargin: '200px' });

const SELECTOR = 'img, video, div, section, header, article, span, a';
const observeEl = (el: Element) => {
  if (el.hasAttribute('data-taqwashield-observed')) return;
  el.setAttribute('data-taqwashield-observed', 'true');
  observer.observe(el);
  // Hide images from the first moment so nothing flashes before it is checked
  if (el.tagName === 'IMG') holdElement(el as HTMLElement);
};
const scanAllMedia = () => {
  if (!isEnabled) return;
  document.querySelectorAll(SELECTOR).forEach(observeEl);
};

const mutationObserver = new MutationObserver((mutations) => {
  if (!isEnabled) return;
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as Element;
      observeEl(element);
      element.querySelectorAll(SELECTOR).forEach(observeEl);
    });
    // A swapped image source needs a fresh check
    if (mutation.type === 'attributes' && (mutation.target as Element).tagName === 'IMG') {
      const img = mutation.target as HTMLElement;
      img.removeAttribute('data-taqwashield-observed');
      img.removeAttribute('data-taqwashield-blurred');
      observeEl(img);
    }
  }
});

const startObserving = () => {
  if (started) return;
  started = true;
  mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset'] });
};

const rescan = () => {
  document.querySelectorAll('[data-taqwashield-observed]').forEach((el) => el.removeAttribute('data-taqwashield-observed'));
  unblurAllMedia();
  scanAllMedia();
};

const initSettings = () =>
  new Promise<void>((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage) return resolve();
    chrome.storage.local.get(['enabled', 'sensitivity', 'blurFemales'], (result) => {
      isEnabled = (result.enabled as boolean) ?? true;
      sensitivity = (result.sensitivity as string) ?? 'Medium';
      blurFemales = (result.blurFemales as boolean) ?? true;
      resolve();
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      // blurCount changes on every blur, so ignore everything except the real settings
      if (!changes.enabled && !changes.sensitivity && !changes.blurFemales) return;
      if (changes.enabled) isEnabled = changes.enabled.newValue as boolean;
      if (changes.sensitivity) sensitivity = changes.sensitivity.newValue as string;
      if (changes.blurFemales) blurFemales = changes.blurFemales.newValue as boolean;
      if (!isEnabled) { unblurAllMedia(); return; }
      loadModel().then(() => { startObserving(); rescan(); });
    });
  });

const init = async () => {
  await initSettings();
  if (!isEnabled) return;
  startObserving();
  scanAllMedia(); // images are held (blurred) right away, then released once judged safe
  await loadModel();
};

init();
