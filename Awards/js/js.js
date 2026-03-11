// ==========================================
// Medals + Stickers + Modal + Events
// ==========================================

document.addEventListener("frame:ready", () => {
  console.log("Frame is ready. Loading Awards page...");

  // load title
  fetch("../html/title.html")
    .then((res) => res.text())
    .then((titleHTML) => {
      const titleBox = document.getElementById("lesson-title");
      // calls lesson-title in HTML

      titleBox.innerHTML = titleHTML;
    });

  // load awards
  fetch("../html/content.html")
    .then((res) => res.text())
    .then((pageHTML) => {
      const contentBox = document.getElementById("content");

      // inject awards
      contentBox.innerHTML = pageHTML;

      // initilazie awards script
      initializeAwards();
    });
});

// ==========================================
// INITIALIZE AWARDS
// ==========================================

function initializeAwards() {

  /* ==========================================
     LESSON ID MAPPING
  ========================================== */

  // Maps medal/sticker index to lesson ID in the database
  const LESSON_IDS = [
    'lesson1-1', 'lesson1-2', 'lesson1-3', 'lesson1-4', 'lesson1-5',
    'lesson2-1', 'lesson2-2', 'lesson2-3', 'lesson2-4',
    'lesson3-1', 'lesson3-2', 'lesson3-3', 'lesson3-4', 'lesson3-5',
  ];

  /* ==========================================
     TAB SWITCHING (Medals / Stickers / Events)
  ========================================== */

  // buttons + panels
  const tabButtons = document.querySelectorAll(".tabButton");
  const awardSections = document.querySelectorAll(".awardsSection");

  //removes active class from all sections, calls data-awards "stickers" and then adds active to the button
  function switchTab(tabName) {
    awardSections.forEach((section) => {
      section.classList.remove("is-active");
    });

    tabButtons.forEach((button) => {
      button.classList.remove("is-active");
    });

    const activeSection = document.querySelector(
      `.awardsSection[data-award="${tabName}"]`
    );

    if (activeSection) activeSection.classList.add("is-active");

    const activeButton = document.querySelector(
      `.tabButton[data-tab="${tabName}"]`
    );

    if (activeButton) activeButton.classList.add("is-active");
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.dataset.tab);
    });
  });

  // medals is the default
  switchTab("medals");

  /* ==========================================
     MEDALS DATA
  ========================================== */

  const medals = [
    // ========== lesson 1 ==========
    {
      id: 1,
      lesson: "1.1",
      title: "Lesson 1.1 Medal",
      courseTitle: "Parts of a Violin and The Bow",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal11.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 1.1 to unlock this medal.",
    },
    {
      id: 2,
      lesson: "1.2",
      title: "Lesson 1.2 Medal",
      courseTitle: "How to Hold a Violin",
      earned: false,
      imageUnlocked: "../images/medal12.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 1.2 to unlock this medal.",
    },
    {
      id: 3,
      lesson: "1.3",
      title: "Lesson 1.3 Medal",
      courseTitle: "How to Hold a Bow",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal13.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 1.3 to unlock this medal.",
    },
    {
      id: 4,
      lesson: "1.4",
      title: "Lesson 1.4 Medal",
      courseTitle: "The Strings",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal14.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 1.4 to unlock this medal.",
    },
    {
      id: 5,
      lesson: "1.5",
      title: "Lesson 1.5 Medal",
      courseTitle: "Fingerboard Map",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal15.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 1.5 to unlock this medal.",
    },

    // ========== lesson 2 ==========
    {
      id: 6,
      lesson: "2.1",
      title: "Lesson 2.1 Medal",
      courseTitle: "The Musical Staff and Notes",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal21.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 2.1 to unlock this medal.",
    },
    {
      id: 7,
      lesson: "2.2",
      title: "Lesson 2.2 Medal",
      courseTitle: "Types of Notes and Counting",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal22.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 2.2 to unlock this medal.",
    },
    {
      id: 8,
      lesson: "2.3",
      title: "Lesson 2.3 Medal",
      courseTitle: "Rests",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal23.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 2.3 to unlock this medal.",
    },
    {
      id: 9,
      lesson: "2.4",
      title: "Lesson 2.4 Medal",
      courseTitle: "Time Signatures",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal24.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 2.4 to unlock this medal.",
    },

    // ========== lesson 3 ==========
    {
      id: 10,
      lesson: "3.1",
      title: "Lesson 3.1 Medal",
      courseTitle: "Sharps and Flats",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal31.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 3.1 to unlock this medal.",
    },
    {
      id: 11,
      lesson: "3.2",
      title: "Lesson 3.2 Medal",
      courseTitle: "Keys",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal32.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 3.2 to unlock this medal.",
    },
    {
      id: 12,
      lesson: "3.3",
      title: "Lesson 3.3 Medal",
      courseTitle: "Key Signatures",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal33.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 3.3 to unlock this medal.",
    },
    {
      id: 13,
      lesson: "3.4",
      title: "Lesson 3.4 Medal",
      courseTitle: "What is a scale",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal34.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 3.4 to unlock this medal.",
    },
    {
      id: 14,
      lesson: "3.5",
      title: "Lesson 3.5 Medal",
      courseTitle: "D Major Scale",
      earned: false,
      date: "",
      imageUnlocked: "../images/medal35.svg",
      imageLocked: "../images/medalLocked.svg",
      unlockMessage: "Complete Lesson 3.5 to unlock this medal.",
    },
  ];

  /* ==========================================
     MEDALS RENDER
  ========================================== */

  //grabs ul class medalsList in html
  const medalsList = document.querySelector(".medalsList");

  function renderMedals() {
    //make sure nothings there
    medalsList.innerHTML = "";

    //create medal slot
    medals.forEach((medal) => {
      // <li class='medal'></li>
      const li = document.createElement("li");
      li.classList.add("medal");

      // if medal earned show unlocked, if not show locked
      const imgSrc = medal.earned
        ? medal.imageUnlocked
        : medal.imageLocked;

      //creates medal button and img
      li.innerHTML = `
      <button type="button"
              class="medalButton ${medal.earned ? "" : "locked"}">
        <img src="${imgSrc}" alt="Medal ${medal.lesson}">
      </button>
    `;

      //button can now be clicked
      const button = li.querySelector("button");

      // medal is clicked
      button.addEventListener("click", () => {

        // gets rid of the box that says select a medal to preview
        document.querySelector(".medalCover").style.display = "none";

        //removes selected highlight from medal
        document.querySelectorAll(".medalButton").forEach((btn) => {
          btn.classList.remove("selected");
        });

        // add selected to clicked medal
        button.classList.add("selected");

        //preview panel
        showMedalDetails(medal);
      });

      medalsList.appendChild(li);
    });
  }

  // updates image, title
  function showMedalDetails(medal) {

    // update image
    document.getElementById("medalImage").src =
      medal.earned ? medal.imageUnlocked : medal.imageLocked;

    // update heading i.e: Lesson 1.1
    document.getElementById("lessonNumber").textContent =
      `Lesson ${medal.lesson}`;

    // locked vs unlocked message
    const earnedEl = document.getElementById("earnedMessage");
    const unlockEl = document.getElementById("unlockMessage");

    // old text doesn't stay visible
    earnedEl.hidden = true;
    unlockEl.hidden = true;

    // UNLOCKED MEDAL
    if (medal.earned) {
      //shows "Earned by completing...."
      earnedEl.hidden = false;

      // Course Title: Parts of a Violin and The Bow
      document.getElementById("courseName").textContent =
        medal.courseTitle;
    }

    // LOCKED MEDAL
    // shows locked message, Complete Lessons ___ to unlock this medal
    else {
      unlockEl.hidden = false;
      unlockEl.textContent = medal.unlockMessage;

      // clears the course name so it doesn't stay from unlocked medals
      document.getElementById("courseName").textContent = "";
    }

    // date
    const dateEl = document.getElementById("completionDate");

    //put it if it exist if it doesn't then dont
    if (medal.date) {
      dateEl.textContent = medal.date;
    } else {
      dateEl.textContent = "";
    }
  }



  /* ==========================================
     STICKERS DATA
  ========================================== */

  const stickers = [
    {
      id: 1,
      title: "Hello World",
      description: "Logged in for the first time!",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/helloWorldSticker.svg",
    },

    {
      id: 2,
      title: "Violin Explorer",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker11.svg",
    },

    // locked
    {
      id: 3,
      title: "Perfect Posture",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker12.svg",
    },
    {
      id: 4,
      title: "Bow Hero",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker13.svg",
    },
    {
      id: 5,
      title: "String Superstar",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker14.svg",
    },
    {
      id: 6,
      title: "Map Master",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker15.svg",
    },
    {
      id: 7,
      title: "Staff Spotter",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker21.svg",
    },
    {
      id: 8,
      title: "Counting Champ",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker22.svg",
    },
    {
      id: 9,
      title: "Restfull",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker23.svg",
    },
    {
      id: 10,
      title: "Time Teller",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker24.svg",
    },
    {
      id: 11,
      title: "Pitch Helper",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker31.svg",
    },
    {
      id: 12,
      title: "Key Keeper",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker32.svg",
    },
    {
      id: 13,
      title: "Signature Spotter",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker33.svg",
    },

    {
      id: 14,
      title: "Scale Climber",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker34.svg",
    },
    {
      id: 15,
      title: "You D Best",
      description: "Not earned yet.",
      earned: false,
      date: "",
      placeholder: false,
      image: "../images/sticker35.svg",
    },

    //placeholder dots
    ...Array.from({ length: 7 }, (_, i) => ({
      id: i + 15,
      earned: false,
      placeholder: true,
      image: "",
    })),
  ];

  // go through stickers filter out the ones that are not placeholders and put them in realStickers
  const realStickers = stickers.filter((s) => !s.placeholder);


  /* ==========================================
     STICKERS BINDER RENDER
  ========================================== */

  //left page *binder* right page
  const stickersLeft = document.querySelector(".stickersLeft");
  const stickersRight = document.querySelector(".stickersRight");
  const galleryNavPrev = document.querySelector(".galleryNavPrev");
  const galleryNavNext = document.querySelector(".galleryNavNext");

  let currentStickerPage = 0;
  const STICKERS_PER_PAGE = 8;

  function renderStickers() {
    //clear for no duplicates
    stickersLeft.innerHTML = "";
    stickersRight.innerHTML = "";

    //only include earned or placeholders, not locked
    const binderStickers = stickers.filter((s) => s.earned || s.placeholder);
    const totalPages = Math.ceil(binderStickers.length / STICKERS_PER_PAGE);

    // clamp page
    if (currentStickerPage >= totalPages) currentStickerPage = totalPages - 1;
    if (currentStickerPage < 0) currentStickerPage = 0;

    // update arrow visibility
    galleryNavPrev.disabled = currentStickerPage === 0;
    galleryNavNext.disabled = currentStickerPage >= totalPages - 1;

    const start = currentStickerPage * STICKERS_PER_PAGE;
    //only shows 8 per page
    const visible = binderStickers.slice(start, start + STICKERS_PER_PAGE);

    //loop through each real sticker
    visible.forEach((sticker, index) => {
      //lets each sticker become a button in a list
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.classList.add("stickerButton");

      //if it's a placeholder, add the class and disable click
      if (sticker.placeholder) {
        btn.classList.add("placeholder");
        btn.disabled = true;
      }

      // clickable unlocked stickers
      if (sticker.earned) {
        //put sticker image
        btn.innerHTML = `<img src="${sticker.image}" alt="${sticker.title}">`;

        //get rid of the overlay when user clicks a sticker
        btn.addEventListener("click", () => {
          document.querySelector(".stickerCover").style.display = "none";

          //only one selected at a time
          document.querySelectorAll(".stickerButton").forEach((b) => {
            b.classList.remove("selected");
          });

          //selected sticker gets class added
          btn.classList.add("selected");

          //shows in preview panel
          showStickerPreview(sticker);
        });
      }

      //add onto list
      li.appendChild(btn);

      // 4 on left first, then right
      if (index < 4) {
        stickersLeft.appendChild(li);
      } else {
        stickersRight.appendChild(li);
      }
    });
  }


  galleryNavPrev.addEventListener("click", () => {
    if (currentStickerPage > 0) {
      currentStickerPage--;
      renderStickers();
    }
  });

  galleryNavNext.addEventListener("click", () => {
    const binderStickers = stickers.filter((s) => s.earned || s.placeholder);
    const totalPages = Math.ceil(binderStickers.length / STICKERS_PER_PAGE);
    if (currentStickerPage < totalPages - 1) {
      currentStickerPage++;
      renderStickers();
    }
  });

  // PREVIEW CARD
  function showStickerPreview(sticker) {
    //image
    document.getElementById("stickerPreviewImage").src = sticker.image;

    //title
    document.getElementById("stickerPreviewTitle").textContent = sticker.title;

    //description
    document.getElementById("stickerPreviewDescription").textContent =
      sticker.description;

    //dates and old dates dont stay visible
    const dateEl = document.getElementById("stickerPreviewDate");

    if (sticker.date) {
      dateEl.textContent = sticker.date;
    } else {
      dateEl.textContent = "";
    }
  }

  /* ==========================================
     MODAL OPEN/CLOSE
  ========================================== */

  //All Stickers Button
  const allStickersButton = document.querySelector(".allStickersButton");

  //this is the modal window, hidden in html
  const modal = document.querySelector(".allStickersModal");

  //X button
  const modalClose = document.querySelector(".modalClose");

  //dark overlay behind modal
  const modalBackdrop = document.querySelector(".modalBackdrop");

  //opens modal
  allStickersButton.addEventListener("click", () => {
    //shows
    modal.hidden = false;
    //preview card
    const previewCard = document.querySelector(".modalStickerPreviewCard");
    previewCard.hidden = false;

    //empty placeholder, no sticker selected yet
    previewCard.classList.add("empty");

    //gets image, wont show image until sticker is clicked
    const img = document.getElementById("modalStickerPreviewImage");
    img.style.display = "none";
    img.removeAttribute("src");


    //Shows select a sticker to preview as placeholder
    document.getElementById("modalStickerPreviewTitle").textContent =
      "Select a sticker to preview";

    //old stickers dont stay visible
    document.getElementById("modalStickerPreviewDescription").textContent = "";

    //removes old date
    document.getElementById("modalStickerPreviewDate").textContent = "";

    //gets ALL stickers
    renderModalStickers("all");
  });

  // closes modal from X
  modalClose.addEventListener("click", () => {
    modal.hidden = true;
  });

  // closes from clicking backdrop
  modalBackdrop.addEventListener("click", () => {
    modal.hidden = true;
  });



  /* ==========================================
    MODAL CATEGORY ALL, UNLOCKED, LOCKED
  ========================================== */

  //gets ul where stickers are
  const stickersGrid = document.querySelector(".stickersGrid");

  // all, unlocked, locked
  function renderModalStickers(filter = "all") {
    //clears grid, not duplicate
    stickersGrid.innerHTML = "";

    //all stickers
    let filtered = realStickers;

    //earned is true so show earned stickers
    if (filter === "unlocked") filtered = realStickers.filter((s) => s.earned);

    //earned is not true so show not earned stickers
    if (filter === "locked") filtered = realStickers.filter((s) => !s.earned);

    // all stickers are realStickers so by default they all show

    //for each sticker...
    filtered.forEach((sticker) => {
      //create list item
      const li = document.createElement("li");
      //create a button
      const btn = document.createElement("button");

      //allows styling
      btn.classList.add("stickerButton");
      //insert image
      btn.innerHTML = `<img src="${sticker.image}" alt="${sticker.title}">`;

      //allows styling for locked stickers
      if (!sticker.earned) {
        btn.classList.add("locked");
      }

      //when modal sticker is clicked it updates the preview
      btn.addEventListener("click", () => {
        showModalStickerPreview(sticker);
      });

      //put button inside the li of stickersGrid
      li.appendChild(btn);
      stickersGrid.appendChild(li);
    });
  }

  /* ==========================================
     MODAL FILTER BUTTONS
  ========================================== */

  // all three buttons in modalTabs: All, Unlocked, Locked
  const modalTabButtons = document.querySelectorAll(".modalTabs button");

  // button interactive
  modalTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      //loops through, resets everything
      modalTabButtons.forEach((b) => b.classList.remove("is-active"));
      //active state to clciked tab for styling
      btn.classList.add("is-active");

      const label = btn.textContent.toLowerCase();

      //render stickers based on label
      if (label === "all") renderModalStickers("all");
      if (label === "unlocked") renderModalStickers("unlocked");
      if (label === "locked") renderModalStickers("locked");
    });
  });

  /* ==========================================
    MODAL PREVIEW WHEN CLICKED
 ========================================== */

  //gets attributes of sticker
  function showModalStickerPreview(sticker) {


    const previewCard = document.querySelector(".modalStickerPreviewCard");

    // remove placeholder
    previewCard.classList.remove("empty");

    // show image now
    document.getElementById("modalStickerPreviewImage").style.display = "block";


    //preview or details isnt hidden
    previewCard.hidden = false

    //apply styling to locked images from getting preview image
    const previewBox = document.querySelector(".modalStickerPreviewImage");

    //apply locked styling for only locked stickers
    if (!sticker.earned) {
      previewBox.classList.add("locked");
    } else {
      previewBox.classList.remove("locked");
    }

    //sticker image shows
    document.getElementById("modalStickerPreviewImage").src =
      sticker.image;

    //heading updates
    document.getElementById("modalStickerPreviewTitle").textContent =
      sticker.title;

    //locked sticker vs unlocked sticker, *add rest of descriptions*
    if (!sticker.earned) {
      document.getElementById("modalStickerPreviewDescription").textContent =
        "Locked sticker — scan the QR code in the book to unlock!";
    } else {
      document.getElementById("modalStickerPreviewDescription").textContent =
        sticker.description;
    }

    //get the time
    const dateEl = document.getElementById("modalStickerPreviewDate");

    //only show if earned
    if (sticker.earned && sticker.date) {
      dateEl.textContent = sticker.date;
    } else {
      dateEl.textContent = "";
    }
  }

  /* ==========================================
     EVENTS DATA
  ========================================== */

  const events = [
    {
      id: 1,
      title: "WcDonald's Partnership",
      description:
        "In this limited time collaboration, WcDonald's is partnering with Arco to bring you exclusive foodBig Wacs, Chicken WcNuggets, & Egg WcWuffins, all for your consumption. Do you have what it takes to collect everything before January 31st?",
      image: "/Awards/images/eventBurger.svg",
    },

    { id: 2, comingSoon: true },
    { id: 3, comingSoon: true },
    { id: 4, comingSoon: true },
    { id: 5, comingSoon: true },
    { id: 6, comingSoon: true },
    { id: 7, comingSoon: true },
    { id: 8, comingSoon: true },
    { id: 9, comingSoon: true },
    { id: 10, comingSoon: true },
    { id: 11, comingSoon: true },
    { id: 12, comingSoon: true },
    { id: 13, comingSoon: true },
    { id: 14, comingSoon: true },
    { id: 15, comingSoon: true },
    { id: 16, comingSoon: true },
    { id: 17, comingSoon: true },
    { id: 18, comingSoon: true },
  ];


  /* ==========================================
     EVENTS ELEMENTS
  ========================================== */

  //gets items from html
  const eventImageEl = document.getElementById("eventImage");
  const eventTitleEl = document.getElementById("eventTitle");
  const eventDescriptionEl = document.getElementById("eventDescription");
  const eventRewardsGrid = document.getElementById("eventRewardsGrid");

  /* ==========================================
   EMPTY EVENT STATE WHEN CLICKED ON
========================================== */

function clearEventDisplay() {
  eventTitleEl.textContent = "Select an Event";
  eventDescriptionEl.textContent = "Click a star to view event details.";
  eventImageEl.style.display = "none";
}

  /* ==========================================
     SHOW EVENT DETAILS
  ========================================== */

  //when someone clicks event star
  function renderEvent(event) {
    //is the event available yet, if not show coming soon in html
    if (event.comingSoon) {
      eventTitleEl.textContent = "Coming Soon!";
      //placeholder text
      eventDescriptionEl.textContent =
        "More limited-time events will appear here soon.";

      //hides image so it doesn't show broken in placeholder
      eventImageEl.style.display = "none";
      return;
    }

    //if there then show details and bring back image
    eventTitleEl.textContent = event.title;
    eventDescriptionEl.textContent = event.description;
    eventImageEl.style.display = "block";
    eventImageEl.src = event.image;
    eventImageEl.alt = event.title;
  }


  /* ==========================================
     STARS
  ========================================== */

  function renderEventStars() {
    eventRewardsGrid.innerHTML = "";

    //one star for each event
    events.forEach((event) => {
      //in the eventRewardItem list
      const li = document.createElement("li");
      li.classList.add("eventRewardItem");

      // greys out coming soon stars, styled
      if (event.comingSoon) {
        li.classList.add("locked");
      }

      // adds star button
      li.innerHTML = `
      <button type="button" class="eventStarButton">
        <img src="../images/star.svg" alt="Event Star">
      </button>
    `;

      //lets the star button be clickable
      const button = li.querySelector(".eventStarButton");

      // when the star is clicked
      button.addEventListener("click", () => {
        // show the event details
        renderEvent(event);

        // only one star at a time!
        document.querySelectorAll(".eventStarButton").forEach((btn) => {
          btn.classList.remove("selected");
        });

        // allows for styling (green checkmark)
        button.classList.add("selected");
      });

      //puts star into list
      eventRewardsGrid.appendChild(li);
    });
  }


  /* ==========================================
    LOAD PROGRESS FROM DB + RENDER
  ========================================== */

  async function loadAndRender() {
    let allProgress = {};

    try {
      if (typeof ArcoAPI !== 'undefined') {
        const res = await ArcoAPI.getProgress();
        allProgress = res.progress || {};
      }
    } catch (e) {
      // Server unavailable — medals stay locked
    }

    // Update medal earned status from progress
    medals.forEach((medal, index) => {
      const lessonId = LESSON_IDS[index];
      const progress = allProgress[lessonId];
      medal.earned = !!(progress && (progress.completed || progress.percentage === 100));

      if (medal.earned && progress && progress.lastUpdated) {
        const d = new Date(progress.lastUpdated);
        medal.date = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
      } else if (!medal.earned) {
        medal.date = '';
      }
    });

    // Update sticker earned status from QR unlocks only
    // Sticker ID 1 ("Hello World") = always earned for logged-in users
    // Sticker IDs 2-14 unlock only via QR code scan
    let qrUnlockedIds = new Set();
    let qrUnlockDates = {};
    try {
      if (typeof ArcoAPI !== 'undefined') {
        const qrStatus = await ArcoAPI.getQrStatus();
        (qrStatus.sticker_unlocks || []).forEach((u) => {
          qrUnlockedIds.add(u.sticker_id);
          qrUnlockDates[u.sticker_id] = u.unlocked_at;
        });
      }
    } catch (e) {
      // QR status unavailable — stickers simply show as locked
    }

    stickers.forEach((sticker) => {
      if (sticker.placeholder) return;

      if (sticker.id === 1) {
        sticker.earned = true;
        return;
      }

      sticker.earned = qrUnlockedIds.has(sticker.id);

      if (sticker.earned && qrUnlockDates[sticker.id]) {
        const d = new Date(qrUnlockDates[sticker.id]);
        sticker.date = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
        sticker.description = 'Unlocked via QR code scan';
      } else {
        sticker.date = '';
      }
    });

    renderMedals();
    renderStickers();
    renderEventStars();
    renderEventStars();
    clearEventDisplay();

    // Previews are empty at first
    document.querySelector(".medalCover").style.display = "flex";
    document.querySelector(".stickerCover").style.display = "flex";
  }

  loadAndRender();
}
