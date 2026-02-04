import https from 'https';
import { getUser } from './_utils/auth.js';
import { rateLimit } from './_utils/rate-limit.js';
import { logUsage, checkUsageLimit, getProfile } from './_utils/db.js';

export const config = {
  runtime: 'nodejs',
};

// Inlined youtube-fetcher for Vercel serverless compatibility
const REQUEST_TIMEOUT = 30000;
const ANDROID_CLIENT_VERSION = '19.29.37';
const ANDROID_USER_AGENT = `com.google.android.youtube/${ANDROID_CLIENT_VERSION} (Linux; U; Android 11) gzip`;
const WEB_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DEFAULT_CLIENT_VERSION = '2.20251201.01.00';

function encodeVarint(value: number): number[] {
  const bytes: number[] = [];
  while (value > 0x7f) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value);
  return bytes;
}

function buildParams(videoId: string, lang: string = 'en'): string {
  const innerParts: number[] = [
    0x0a, 0x03, ...Buffer.from('asr'),
    0x12, ...encodeVarint(lang.length), ...Buffer.from(lang),
    0x1a, 0x00
  ];
  const innerBuf = Buffer.from(innerParts);
  const innerB64 = innerBuf.toString('base64');
  const innerEncoded = encodeURIComponent(innerB64);

  const panelName = 'engagement-panel-searchable-transcript-search-panel';
  const outerParts: number[] = [
    0x0a, ...encodeVarint(videoId.length), ...Buffer.from(videoId),
    0x12, ...encodeVarint(innerEncoded.length), ...Buffer.from(innerEncoded),
    0x18, 0x01,
    0x2a, ...encodeVarint(panelName.length), ...Buffer.from(panelName),
    0x30, 0x01,
    0x38, 0x01,
    0x40, 0x01
  ];

  return Buffer.from(outerParts).toString('base64');
}

function httpsRequest(options: https.RequestOptions, data?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request({ ...options, timeout: REQUEST_TIMEOUT }, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage || 'Unknown error'}`));
        return;
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });

    req.on('error', (err) => reject(new Error(`Network error: ${err.message}`)));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${REQUEST_TIMEOUT}ms`));
    });

    if (data) req.write(data);
    req.end();
  });
}

async function getPageData(videoId: string) {
  const html = await httpsRequest({
    hostname: 'www.youtube.com',
    path: `/watch?v=${videoId}`,
    method: 'GET',
    headers: {
      'User-Agent': WEB_USER_AGENT,
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const visitorMatch = html.match(/"visitorData":"([^"]+)"/);
  const visitorData = visitorMatch?.[1] || '';

  const availableLanguages: { languageCode: string }[] = [];
  const captionsMatch = html.match(/"captions":\{"playerCaptionsTracklistRenderer":\{"captionTracks":(\[[^\]]+\])/);
  if (captionsMatch) {
    try {
      const tracks = JSON.parse(captionsMatch[1]);
      for (const track of tracks) {
        if (track.languageCode) {
          availableLanguages.push({ languageCode: track.languageCode });
        }
      }
    } catch (e) { }
  }

  const titleMatch = html.match(/"videoDetails":\{.*?"title":"([^"]+)"/);
  const authorMatch = html.match(/"videoDetails":\{.*?"author":"([^"]+)"/);

  return {
    visitorData,
    availableLanguages,
    metadata: {
      title: titleMatch?.[1] || '',
      author: authorMatch?.[1] || ''
    }
  };
}

async function getSubtitles(videoID: string, lang: string = 'en') {
  const { visitorData, availableLanguages, metadata } = await getPageData(videoID);

  let targetLang = lang;
  if (availableLanguages.length > 0) {
    const hasRequestedLang = availableLanguages.some(t => t.languageCode === lang);
    if (!hasRequestedLang) {
      const hasEnglish = availableLanguages.some(t => t.languageCode === 'en');
      targetLang = hasEnglish ? 'en' : availableLanguages[0].languageCode;
    }
  }

  const params = buildParams(videoID, targetLang);
  const payload = JSON.stringify({
    context: {
      client: {
        hl: targetLang,
        gl: 'US',
        clientName: 'ANDROID',
        clientVersion: ANDROID_CLIENT_VERSION,
        androidSdkVersion: 30,
        visitorData
      }
    },
    params
  });

  const response = await httpsRequest({
    hostname: 'www.youtube.com',
    path: '/youtubei/v1/get_transcript?prettyPrint=false',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'User-Agent': ANDROID_USER_AGENT,
      'Origin': 'https://www.youtube.com'
    }
  }, payload);

  const json = JSON.parse(response);

  if (json.error) {
    throw new Error(`YouTube API error: ${json.error.message || 'Unknown'}`);
  }

  const webSegments = json?.actions?.[0]?.updateEngagementPanelAction?.content
    ?.transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body
    ?.transcriptSegmentListRenderer?.initialSegments;

  const androidSegments = json?.actions?.[0]?.elementsCommand?.transformEntityCommand
    ?.arguments?.transformTranscriptSegmentListArguments?.overwrite?.initialSegments;

  const segments = webSegments || androidSegments || [];

  if (segments.length === 0) {
    throw new Error('No transcript available for this video');
  }

  const lines = segments
    .filter((seg: any) => seg?.transcriptSegmentRenderer)
    .map((seg: any) => {
      const renderer = seg.transcriptSegmentRenderer;
      const webText = renderer?.snippet?.runs?.map((r: any) => r.text || '').join('');
      const androidText = renderer?.snippet?.elementsAttributedString?.content;
      return webText || androidText || '';
    })
    .filter((text: string) => text.length > 0);

  return { lines, metadata };
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const videoIdParam = req.query.v || req.query.videoId;

    if (!videoIdParam) {
      return res.status(400).json({ error: 'Missing video ID', transcript: '', success: false });
    }

    // Security Check
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }

    // Rate Limit
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const identifier = user.id || ip;

    if (!rateLimit(identifier, 20, 60000)) { // 20 requests per minute (higher for fetch)
      return res.status(429).json({ error: 'Too many requests' });
    }

    // Monthly Quota Check
    if (user.id) {
      // Safe getProfile check
      try {
        const profile = await getProfile(user.id);
        const limit = profile?.is_premium ? 50000000 : 2000000;
        if (!(await checkUsageLimit(user.id, limit))) {
          return res.status(403).json({ error: 'Monthly usage limit exceeded.' });
        }
      } catch (e) {
        console.warn('Usage check failed:', e);
        // Continue - fail open
      }
    }

    const videoId = extractVideoId(videoIdParam) || videoIdParam;

    // Strict Validation for ID (11 chars alphanumeric)
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID format' });
    }

    console.log('Fetching transcript for:', videoId);
    const result = await getSubtitles(videoId, 'en');
    const transcript = result.lines.join(' ');

    // Log Usage (Transcript length / 4)
    const tokenEst = transcript.length / 4;
    logUsage(user.id, 'transcript_fetch', 0, Math.ceil(tokenEst), { videoId });

    return res.status(200).json({
      transcript,
      metadata: result.metadata,
      success: true
    });
  } catch (error: any) {
    console.error('Transcript fetch critical error:', error.message || error);
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
      transcript: '',
      success: false
    });
  }
}

