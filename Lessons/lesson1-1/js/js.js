document.addEventListener("frame:ready", () => {
  fetch("./content.html")
    .then(res => {
      console.log("Fetch response:", res);
      if (!res.ok) throw new Error("Not OK");
      return res.text();
    })
    .then(content => {
      document
        .getElementById("content")
        .insertAdjacentHTML("beforeend", content);
        // initVideoControls();
    })
    .catch(err => console.error("CONTENT LOAD FAILED:", err));
});

// function initVideoControls() {
//   const video = document.querySelector('.lesson-video');
//   const playBtn = document.querySelector('#playBtn');
//   const volumeSlider = document.querySelector('#volume');
//   const sizeBtn = document.querySelector('#sizeBtn');

//   if (!video || !playBtn || !volumeSlider || !sizeBtn) {
//     console.warn("Video controls not found");
//     return;
//   }

//   let isPlaying = false;
//   let isBig = false;

//   playBtn.addEventListener('click', () => {
//     if (!isPlaying) {
//       video.muted = false;
//       video.play();
//       playBtn.textContent = 'Pause';
//     } else {
//       video.pause();
//       playBtn.textContent = 'Play';
//     }
//     isPlaying = !isPlaying;
//   });

//   volumeSlider.addEventListener('input', () => {
//     video.muted = false;
//     video.volume = volumeSlider.value;
//   });

//   sizeBtn.addEventListener('click', () => {
//     if (!isBig) {
//       video.style.width = '640px';
//       video.style.height = '480px';
//       sizeBtn.textContent = 'Smaller';
//     } else {
//       video.style.width = '320px';
//       video.style.height = '240px';
//       sizeBtn.textContent = 'Bigger';
//     }
//     isBig = !isBig;
//   });
// }
