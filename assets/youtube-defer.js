
/** 
  * Script for delay loading youtube videos and show it only when it is in visible viewport (on scroll)
*/

window.addEventListener('scroll', function() {
  setTimeout(function() { // prevent duplicate events
    YoutubeDefer.showYoutubeVideos();
  }, 150);
});
window.dispatchEvent(new CustomEvent('scroll'));

window.YoutubeDefer = window.YoutubeDefer || {};
window.YoutubePlayers = window.YoutubePlayers || [];

YoutubeDefer.showYoutubeVideos = function() {
  let videosDefer = document.querySelectorAll(".youtube-video-deferred");
  for (let i=0; i < videosDefer.length; i++) {
    if(videosDefer[i].classList.contains("loaded")) return;
    if(videosDefer[i].getAttribute('data-video-id')) {
      let block = videosDefer[i];
      let parent = block.parentElement.parentElement;
      if(YoutubeDefer.isVisibleElement(parent)) {
        parent.classList.add("loading");

        ///////////////////////////
        if(typeof YT === 'undefined') {
          YoutubeDefer.loadYoutubeScript();
          YoutubeDefer.checkIfYoutubeIsReady().then(function() {
            console.log("Youtube player api loaded");
            YoutubeDefer.prepareYoutubeVideo(block);
          });
        }
        else {
          YoutubeDefer.prepareYoutubeVideo(block);
        }
        ///////////////////////////

        videosDefer[i].classList.add("loaded");
      }
    }
  }
}

YoutubeDefer.isVisibleElement = function(el) {
  const { top, bottom } = el.getBoundingClientRect();
  const vHeight = (window.innerHeight || document.documentElement.clientHeight);
  return (
    (top > 0 || bottom > 0) &&
    top < vHeight
  );
}

YoutubeDefer.checkIfYoutubeIsReady = () => {
  var wait;
  var timeout;

  var deferred = new Promise((resolve, reject) => {
    wait = setInterval(function() {
      if(typeof YT === 'undefined') {
        return;
      }
      clearInterval(wait);
      clearTimeout(timeout);
      resolve();
    }, 500);
    timeout = setTimeout(function() {
      clearInterval(wait);
      reject();
    }, 5000); // subjective. test up to 8 times over 4 seconds
  });

  return deferred;
}

YoutubeDefer.loadYoutubeScript = () => {
  let s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "https://www.youtube.com/iframe_api";
  document.querySelector("head").append(s);
}

YoutubeDefer.prepareYoutubeVideo = function(block) {
  if(window.YT.loaded) {
    YoutubeDefer.configureYoutubePlayer(block);
  }
  else {
    window.YT.ready(function() {
      YoutubeDefer.configureYoutubePlayer(block);
    });
  }
}

YoutubeDefer.configureYoutubePlayer = function(block) {
  let video_id = block.getAttribute('data-video-id');
  let parent = block.parentElement.parentElement;
  window.YoutubePlayers = new YT.Player(block, {
    width: 1280,
    height: 720,
    videoId: video_id,
    origin: 'https://' + window.location.hostname,
    allowfullscreen: 'true',
    playerVars: {
      autoplay: 1,
      loop: 1,
      autohide: 0,
      branding: 0,
      cc_load_policy: 0,
      controls: 0,
      fs: 0,
      quality: 'hd720',
      rel: 0,
      showinfo: 0,
      wmode: 'opaque',
      autohide: 1,
      playsinline: 1
    },
    events: {
      onReady: (e) => {
        block = e.target.h;
        e.target.mute();
        e.target.playVideo();
        console.log(`Video ${video_id} loaded`);
        if(block.closest("[data-section-id]")) {
          block.closest("[data-section-id]").classList.add("loading");
        }
        setTimeout(function() {
          parent.classList.remove("loading");
          parent.classList.add("loaded");        
          if(block.closest("[data-section-id]")) {
            block.closest("[data-section-id]").classList.remove("loading");
            block.closest("[data-section-id]").classList.add("loaded");
          }
        }, 500);
      }
    }
  });
}