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
let isEnabled = true;
let sensitivity = 'Medium';
let blurFemales = true;
const mediaCache = new LRUCache<string, boolean>(2000); // URL -> isNSFW

// Thresholds based on sensitivity
const getThreshold = () => {
  switch (sensitivity) {
    case 'Low': return 0.8;
    case 'High': return 0.4;
    case 'Medium':
    default: return 0.6;
  }
};

// Initialize settings from storage
const initSettings = async () => {
  return new Promise<void>((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['enabled', 'sensitivity', 'blurFemales'], (result) => {
        isEnabled = (result.enabled as boolean) ?? true;
        sensitivity = (result.sensitivity as string) ?? 'Medium';
        blurFemales = (result.blurFemales as boolean) ?? true;
        resolve();
      });
      
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.enabled) isEnabled = changes.enabled.newValue as boolean;
        if (changes.sensitivity) sensitivity = changes.sensitivity.newValue as string;
        if (changes.blurFemales) blurFemales = changes.blurFemales.newValue as boolean;
        
        if (isEnabled) {
          scanAllMedia();
        } else {
          unblurAllMedia();
        }
      });
    } else {
      resolve();
    }
  });
};

// Load the NSFWJS model
const loadModel = async () => {
  if (model) return model;
  try {
    await tf.ready();
    model = await nsfwjs.load();
    console.log('TaqwaShield: Model loaded successfully');
    return model;
  } catch (error) {
    console.error('TaqwaShield: Error loading model', error);
    return null;
  }
};

// Apply blur effect
const blurElement = (el: HTMLElement) => {
  el.style.filter = 'blur(40px)';
  el.style.transition = 'filter 0.3s ease-in-out';
  el.setAttribute('data-taqwashield-blurred', 'true');
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ action: 'incrementBlurCount' });
  }
};

// Remove blur effect
const unblurAllMedia = () => {
  const blurredElements = document.querySelectorAll('[data-taqwashield-blurred="true"]');
  blurredElements.forEach((el) => {
    (el as HTMLElement).style.filter = '';
    el.removeAttribute('data-taqwashield-blurred');
  });
};

// Process image URL
const processImageUrl = async (url: string, el: HTMLElement) => {
  if (!model) return;

  if (mediaCache.has(url)) {
    if (mediaCache.get(url)) {
      blurElement(el);
    }
    return;
  }

  try {
    const imgClone = new Image();
    imgClone.crossOrigin = 'anonymous';
    imgClone.src = url;
    
    await new Promise((resolve, reject) => {
      imgClone.onload = resolve;
      imgClone.onerror = reject;
    });

    const predictions = await model.classify(imgClone);
    const threshold = getThreshold();
    // Note: The current model does not have a specific 'female' detector.
    // We use the 'Sexy' category as a proxy for this feature.
    const isNSFW = predictions.some(p => 
      (p.className === 'Porn' || p.className === 'Hentai' || (blurFemales && p.className === 'Sexy')) && p.probability > threshold
    );

    mediaCache.set(url, isNSFW);

    if (isNSFW) {
      blurElement(el);
    }
  } catch (error) {
    mediaCache.set(url, false); 
  }
};

// Analyze Video Frame
const analyzeVideoFrame = async (video: HTMLVideoElement) => {
  if (!isEnabled || !model || video.readyState < 2) return;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 300;
    canvas.height = video.videoHeight || 150;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const predictions = await model.classify(canvas);
    const threshold = getThreshold();
    // Note: The current model does not have a specific 'female' detector.
    // We use the 'Sexy' category as a proxy for this feature.
    const isNSFW = predictions.some(p => 
      (p.className === 'Porn' || p.className === 'Hentai' || (blurFemales && p.className === 'Sexy')) && p.probability > threshold
    );

    if (isNSFW) {
      blurElement(video);
    }
  } catch (error) {
    // console.error('Error analyzing video frame', error);
  }
};

// Analyze a single media element
const analyzeMedia = async (el: HTMLElement) => {
  if (!isEnabled || !model) return;

  if (el.tagName === 'IMG') {
    const img = el as HTMLImageElement;
    if (!img.src || img.src.startsWith('data:')) return;
    await processImageUrl(img.src, el);
  } else if (el.tagName === 'VIDEO') {
    const video = el as HTMLVideoElement;
    
    // Analyze current frame
    analyzeVideoFrame(video);
    
    // Setup periodic checking if playing
    if (!video.hasAttribute('data-taqwashield-video-listener')) {
      video.setAttribute('data-taqwashield-video-listener', 'true');
      
      let intervalId: any;
      video.addEventListener('play', () => {
        intervalId = setInterval(() => {
          if (!video.paused && !video.ended) {
            analyzeVideoFrame(video);
          }
        }, 2000); // Check every 2 seconds
      });
      
      video.addEventListener('pause', () => clearInterval(intervalId));
      video.addEventListener('ended', () => clearInterval(intervalId));
    }
  } else {
    // Check background image
    const bgImage = window.getComputedStyle(el).backgroundImage;
    if (bgImage && bgImage !== 'none' && bgImage.startsWith('url(')) {
      const url = bgImage.slice(4, -1).replace(/["']/g, '');
      if (!url || url.startsWith('data:')) return;
      await processImageUrl(url, el);
    }
  }
};

// Intersection Observer to only analyze media in viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target as HTMLElement;
      analyzeMedia(el);
      if (el.tagName !== 'VIDEO') {
        observer.unobserve(el); // Only analyze images/bg-images once
      }
    }
  });
}, {
  rootMargin: '200px'
});

// Scan all media currently on the page
const scanAllMedia = () => {
  if (!isEnabled) return;
  
  // Select images, videos, and elements that might have background images (divs, sections, headers, etc)
  const elements = document.querySelectorAll('img, video, div, section, header, article, span, a');
  
  elements.forEach(el => {
    if (!el.hasAttribute('data-taqwashield-observed')) {
      el.setAttribute('data-taqwashield-observed', 'true');
      observer.observe(el as HTMLElement);
    }
  });
};

// Mutation Observer to handle dynamically added media
const mutationObserver = new MutationObserver((mutations) => {
  if (!isEnabled) return;
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        
        if (element.tagName === 'IMG' || element.tagName === 'VIDEO') {
          element.setAttribute('data-taqwashield-observed', 'true');
          observer.observe(element);
        }
        
        // Also check children
        const children = element.querySelectorAll('img, video, div, section, header, article, span, a');
        children.forEach(child => {
          if (!child.hasAttribute('data-taqwashield-observed')) {
            child.setAttribute('data-taqwashield-observed', 'true');
            observer.observe(child as HTMLElement);
          }
        });
      }
    });
  });
});

// Main initialization
const init = async () => {
  await initSettings();
  if (isEnabled) {
    await loadModel();
    scanAllMedia();
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
};

// Start the extension
init();
