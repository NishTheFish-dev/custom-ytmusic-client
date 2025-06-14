/*
  Lightweight wrapper around the YouTube IFrame Player API.
  Keeps a singleton hidden player that streams audio for the currently
  selected track.  Exposes play / pause / seek / volume and events.
*/
// tiny event emitter
const emitter = {
  events: {},
  on(event, handler) {
    (this.events[event] ||= []).push(handler);
  },
  off(event, handler) {
    this.events[event] = (this.events[event] || []).filter((h) => h !== handler);
  },
  emit(event, payload) {
    (this.events[event] || []).forEach((h) => h(payload));
  },
};

let apiReadyPromise = null;
// Stores the volume that should be applied once the player actually starts
// playing.  This lets us start the video muted and switch to the user
// selected volume as soon as the YouTube player enters the PLAYING state,
// preventing any loud audio burst.
let pendingVolume = null;
let player = null;
let playerReadyPromise = null;
// Tracks the last video requested via play().  Used so the state change
// handler knows which video should autostart, and to ignore stale events.
let lastRequestedId = null;
// Timeout id for any pending playVideo invocation so we can cancel if a new
// request comes in quickly.
let playTimeout = null;

function loadYouTubeIframeAPI() {
  if (apiReadyPromise) return apiReadyPromise;
  apiReadyPromise = new Promise((resolve) => {
    // If already present
    if (window.YT && window.YT.Player) {
      return resolve(window.YT);
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      resolve(window.YT);
    };
  });
  return apiReadyPromise;
}

async function getPlayer() {
  if (player) {
    // If player already exists, ensure we only resolve after it's ready
    return playerReadyPromise || Promise.resolve(player);
  }
  const YT = await loadYouTubeIframeAPI();
  // Create a hidden container once
  let container = document.getElementById('yt-hidden-player');
  if (!container) {
    container = document.createElement('div');
    container.id = 'yt-hidden-player';
    container.style.width = '0px';
    container.style.height = '0px';
    container.style.position = 'fixed';
    container.style.top = '-1000px';
    document.body.appendChild(container);
  }
  playerReadyPromise = new Promise((readyResolve) => {
    player = new YT.Player(container, {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      iv_load_policy: 3,
      modestbranding: 1,
    },
    events: {
      onReady: () => {
        emitter.emit('ready');
        readyResolve(player);
      },
      onStateChange: (e) => {
        // Autoplay once the new video has entered the CUED state.  This avoids
        // calling playVideo too early when switching tracks rapidly.
        if (e.data === YT.PlayerState.CUED) {
          // Only start if this CUED event matches the latest requested video.
          try {
            const cuedId = player.getVideoData()?.video_id;
            if (cuedId && cuedId === lastRequestedId) {
              player.playVideo();
            }
          } catch (_) {}
        }
        switch (e.data) {
          case YT.PlayerState.PLAYING:
            // Apply the desired volume immediately on first PLAYING event
            if (pendingVolume !== null) {
              try {
                player.setVolume(pendingVolume);
              } catch (_) {}
              pendingVolume = null;
            }
            emitter.emit('play');
            break;
          case YT.PlayerState.PAUSED:
            emitter.emit('pause');
            break;
          case YT.PlayerState.ENDED:
            emitter.emit('ended');
            break;
          default:
            break;
        }
      },
    },
    });
    // Promise resolves in onReady
  });
  return playerReadyPromise;
}

export const YouTubePlayer = {
  on(event, handler) { emitter.on(event, handler); },
  off(event, handler) { emitter.off(event, handler); },
  async play(videoId, volume = 100) {
    const p = await getPlayer();
    // Start muted to avoid loud burst, remember desired volume
    pendingVolume = volume;
    // Remember which video should start, and cancel any pending play calls
    lastRequestedId = videoId;
    if (playTimeout) {
      clearTimeout(playTimeout);
      playTimeout = null;
    }
    p.cueVideoById(videoId); // loads without autoplay
    p.setVolume(0); // mute until volume applied
    // Fallback: if CUED event somehow missed, force play after short delay.
    playTimeout = setTimeout(() => {
      if (lastRequestedId === videoId) {
        try { p.playVideo(); } catch (_) {}
      }
    }, 500);
  },
  async pause() {
    const p = await getPlayer();
    p.pauseVideo();
  },
  async toggle() {
    const p = await getPlayer();
    const state = p.getPlayerState();
    if (state === window.YT?.PlayerState?.PLAYING) {
      p.pauseVideo();
    } else {
      p.playVideo();
    }
  },
  async seek(seconds) {
    const p = await getPlayer();
    p.seekTo(seconds, true);
  },
  async setVolume(vol) {
    const p = await getPlayer();
    p.setVolume(vol);
  },
  async getCurrentTime() {
    const p = await getPlayer();
    return p.getCurrentTime();
  },
  async getDuration() {
    const p = await getPlayer();
    return p.getDuration();
  },
};
