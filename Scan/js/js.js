document.addEventListener("frame:ready", () => {
  // Load title into the frame's title placeholder
  const titleContainer = document.getElementById('lesson-title');
  if (titleContainer) {
    fetch("./title.html")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load title.html");
        return res.text();
      })
      .then(titleContent => {
        titleContainer.innerHTML = titleContent;
      })
      .catch(err => console.error("Title load failed:", err));
  }

  // Load content
  fetch("./content.html")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load content");
      return res.text();
    })
    .then(content => {
      document.getElementById("content").insertAdjacentHTML("beforeend", content);
      initializeScanPage();
    })
    .catch(err => console.error("Content load failed:", err));
});

let html5QrCode = null;
let scanAttempts = 0;
let scanTimeout = null;
let currentZoom = 2; // Default zoom level (middle dot)
let videoTrack = null;

function initializeScanPage() {
  // Start QR scanner
  startQrScanner();

  // Add button listeners
  setupButtonListeners();

  // Info button functionality
  const infoBtn = document.querySelector('.info-btn');
  if (infoBtn) {
    infoBtn.addEventListener('click', () => {
      alert('Point your camera at a QR code to scan it. Make sure the code is well-lit and in focus.');
    });
  }

  // Setup zoom controls
  setupZoomControls();

  // Zoom level dots - 3 preset zoom levels
  const dots = document.querySelectorAll('.camera-dots .dot');
  const zoomLevels = [1, 2, 3]; // Zoom out, default, zoom in

  // Set middle dot as default active
  if (dots[1]) {
    dots.forEach(d => d.classList.remove('active'));
    dots[1].classList.add('active');
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      // Remove active from all dots
      dots.forEach(d => d.classList.remove('active'));

      // Set active on clicked dot
      dot.classList.add('active');

      // Set zoom to corresponding level
      currentZoom = zoomLevels[index];
      updateZoomThumbPosition();
      applyZoom();

      console.log('Zoom level set to:', currentZoom + 'x');
    });
  });
}

function setupZoomControls() {
  const zoomPlus = document.querySelector('.zoom-plus');
  const zoomMinus = document.querySelector('.zoom-minus');
  const zoomThumb = document.getElementById('zoom-thumb');
  const zoomTrack = document.querySelector('.zoom-track');

  if (zoomPlus) {
    zoomPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      adjustZoom(0.1);
    });
  }

  if (zoomMinus) {
    zoomMinus.addEventListener('click', (e) => {
      e.stopPropagation();
      adjustZoom(-0.1);
    });
  }

  // Track click to move thumb
  if (zoomTrack) {
    zoomTrack.addEventListener('click', (e) => {
      const rect = zoomTrack.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percentage = 1 - (y / rect.height); // Invert so top = max zoom
      setZoomFromPercentage(percentage);
    });
  }

  // Drag thumb
  if (zoomThumb) {
    let isDragging = false;

    zoomThumb.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging || !zoomTrack) return;

      const rect = zoomTrack.getBoundingClientRect();
      let y = e.clientY - rect.top;
      y = Math.max(0, Math.min(y, rect.height));

      const percentage = 1 - (y / rect.height); // Invert so top = max zoom
      setZoomFromPercentage(percentage);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    zoomThumb.addEventListener('touchstart', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging || !zoomTrack) return;

      const touch = e.touches[0];
      const rect = zoomTrack.getBoundingClientRect();
      let y = touch.clientY - rect.top;
      y = Math.max(0, Math.min(y, rect.height));

      const percentage = 1 - (y / rect.height);
      setZoomFromPercentage(percentage);
    });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });
  }
}

function setZoomFromPercentage(percentage) {
  // Map percentage (0-1) to zoom range (1-3x)
  const minZoom = 1;
  const maxZoom = 3;
  const zoom = minZoom + (percentage * (maxZoom - minZoom));

  currentZoom = Math.max(minZoom, Math.min(zoom, maxZoom));
  updateZoomThumbPosition();
  applyZoom();
}

function adjustZoom(delta) {
  currentZoom += delta;
  currentZoom = Math.max(1, Math.min(currentZoom, 3)); // Clamp between 1x and 3x
  updateZoomThumbPosition();
  applyZoom();
}

function updateZoomThumbPosition() {
  const zoomThumb = document.getElementById('zoom-thumb');
  const zoomTrack = document.querySelector('.zoom-track');

  if (!zoomThumb || !zoomTrack) return;

  // Map zoom (1-3) to percentage (0-1)
  const percentage = (currentZoom - 1) / 2; // 2 is the range (3-1)

  // Invert percentage so higher zoom = higher position
  const position = (1 - percentage) * 100;

  zoomThumb.style.top = `${position}%`;
}

function applyZoom() {
  if (!videoTrack) return;

  const capabilities = videoTrack.getCapabilities();

  if (capabilities.zoom) {
    const constraints = {
      advanced: [{ zoom: currentZoom }]
    };

    videoTrack.applyConstraints(constraints)
      .then(() => {
        console.log('Zoom applied:', currentZoom);
      })
      .catch(err => {
        console.warn('Zoom not supported or failed:', err);
      });
  } else {
    // Fallback: use CSS transform (less ideal but works)
    const readerElement = document.getElementById('reader');
    if (readerElement) {
      const video = readerElement.querySelector('video');
      if (video) {
        video.style.transform = `scale(${currentZoom})`;
      }
    }
  }
}

function startQrScanner() {
  const readerElement = document.getElementById("reader");
  const qrPlaceholder = document.getElementById("qr-placeholder");

  if (!readerElement) {
    console.error("Missing #reader element");
    showError();
    return;
  }

  // Show scanning state
  showState('scanning');

  // Show reader element BEFORE starting scanner so it has dimensions
  readerElement.classList.add('active');

  // Wait for browser to calculate layout before starting scanner
  requestAnimationFrame(() => {
    startScannerInternal(readerElement, qrPlaceholder);
  });
}

function startScannerInternal(readerElement, qrPlaceholder) {
  // Initialize QR Code scanner
  html5QrCode = new Html5Qrcode("reader");

  // Set timeout for error state if scanning takes too long
  scanTimeout = setTimeout(() => {
    if (scanAttempts === 0) {
      showError();
      stopScanning();
    }
  }, 15000);

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        // Get actual reader element dimensions (the root HTML element)
        const reader = document.getElementById('reader');
        const readerWidth = reader ? reader.offsetWidth : viewfinderWidth;
        const readerHeight = reader ? reader.offsetHeight : viewfinderHeight;

        // Use the smaller of viewfinder and reader dimensions
        const minDimension = Math.min(viewfinderWidth, viewfinderHeight, readerWidth, readerHeight);
        const qrboxSize = Math.max(50, Math.floor(minDimension * 0.7));
        return { width: qrboxSize, height: qrboxSize };
      }
    },
    (decodedText) => {
      scanAttempts++;
      console.log("QR Code scanned:", decodedText);

      // Clear timeout
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }

      // Stop scanning
      stopScanning();

      // Show success state
      showSuccess(decodedText);
    },
    (error) => {
      // Silent error handling
      if (!error.includes("NotFoundException")) {
        console.warn("Scan error:", error);
      }
    }
  ).then(() => {
    // Camera started successfully
    console.log("Scanner started");

    // Hide QR placeholder
    if (qrPlaceholder) {
      qrPlaceholder.classList.add('hidden');
    }

    // Show reader
    readerElement.classList.add('active');

    // Get video track for zoom
    const video = readerElement.querySelector('video');
    if (video && video.srcObject) {
      const stream = video.srcObject;
      videoTrack = stream.getVideoTracks()[0];

      // Initialize zoom thumb position
      updateZoomThumbPosition();
    }
  }).catch(err => {
    console.error("Failed to start scanner:", err);
    // Clear timeout since scanner failed to start
    if (scanTimeout) {
      clearTimeout(scanTimeout);
      scanTimeout = null;
    }
    showError();
  });
}

function stopScanning() {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop()
      .then(() => {
        console.log("Scanner stopped");
        videoTrack = null;

        // Show QR placeholder again
        const qrPlaceholder = document.getElementById("qr-placeholder");
        if (qrPlaceholder) {
          qrPlaceholder.classList.remove('hidden');
        }

        // Hide reader
        const readerElement = document.getElementById("reader");
        if (readerElement) {
          readerElement.classList.remove('active');
        }
      })
      .catch(err => {
        console.error("Error stopping scanner:", err);
      });
  }
}

function showState(state) {
  const states = {
    'scanning': document.getElementById('scanning-state'),
    'success': document.getElementById('success-state'),
    'error': document.getElementById('error-state')
  };

  // Hide all states
  Object.values(states).forEach(el => {
    if (el) el.classList.remove('active');
  });

  // Show selected state
  if (states[state]) {
    states[state].classList.add('active');
  }
}

function showSuccess(decodedText) {
  showState('success');
  console.log("Success! Decoded:", decodedText);
}

function showError() {
  showState('error');
}

function setupButtonListeners() {
  // Exit buttons
  const exitButtons = document.querySelectorAll('.btn-exit');
  exitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      window.history.back();
    });
  });

  // Scan buttons (retry scanning)
  const scanButtons = document.querySelectorAll('.btn-scan');
  scanButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      scanAttempts = 0;
      currentZoom = 2; // Reset to default zoom

      // Reset middle dot as active
      const dots = document.querySelectorAll('.camera-dots .dot');
      if (dots[1]) {
        dots.forEach(d => d.classList.remove('active'));
        dots[1].classList.add('active');
      }

      startQrScanner();
    });
  });
}
