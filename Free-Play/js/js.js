document.addEventListener("frame:ready", () => {
    // Inject title.html into the frame's title placeholder
    const titleContainer = document.getElementById('lesson-title');
    if (titleContainer) {
        fetch("../html/title.html")
            .then(res => {
                if (!res.ok) throw new Error("Failed to load title.html");
                return res.text();
            })
            .then(titleContent => {
                titleContainer.innerHTML = titleContent;
            })
            .catch(err => console.error("TITLE LOAD FAILED:", err));
    } else {
        console.warn("lesson-title element not found");
    }

    // Load content.html
    fetch("../html/content.html")
        .then(res => {
            console.log("Fetch response:", res);
            if (!res.ok) throw new Error("Not OK");
            return res.text();
        })
        .then(content => {
            document
                .getElementById("content")
                .insertAdjacentHTML("beforeend", content);
            notesFunction();
        })
        .catch(err => console.error("CONTENT LOAD FAILED:", err));
});
var currentVolume = 1;

function notesFunction() {

    // these are the note images and messages that pop up when a note is selected
    var notes = {


        "A5Note": {
            image: "A5Note.svg",
            description: "The third finger on the E string is the A note! The note is placed on one ledger line above the staff.",
            audio: "a5.mp3"
        },

        "GSharp5Note": {
            image: "GSharp5Note.svg",
            description: "The second finger on the E string is the G# note! The note is placed above the fifth line.",
            audio: "gsharp5.mp3"
        },

        "FSharp5Note": {
            image: "FSharp5Note.svg",
            description: "The first finger on the E string is the F# note! The note is placed on the fifth line.",
            audio: "fsharp5.mp3"
        },

        "E5Note": {
            image: "E5Note.svg",
            description: "Zero fingers on the E string is the open E note! The note is placed in the fourth space.",
            audio: "e5.mp3"
        },
        "D5Note": {
            image: "D5Note.svg",
            description: "The third finger on the A string is the D note! The note is placed on the fourth line.",
            audio: "d5.mp3"
        },

        "Csharp5": {
            image: "Csharp5Note.svg",
            description: "The second finger on the A string is the C# note! The note is placed in the third space.",
            audio: "csharp5.mp3"
        },

        "B4Note": {
            image: "B4Note.svg",
            description: "The  first finger on the A string is the B note! The note is placed on the third line.",
            audio: "b4.mp3"
        },

        "A4Note": {
            image: "A4Note.svg",
            description: "Zero fingers on the A string is the open A note! The note is placed in the second space.",
            audio: "a4.mp3"
        },
        "G4Note": {
            image: "G4Note.svg",
            description: "The third finger on the D string is the G note! The note is placed on the second line.",
            audio: "g4.mp3"
        },

        "FSharp4Note": {
            image: "FSharp4Note.svg",
            description: "The second finger on the D string is the F# note! The note is placed in the first space.",
            audio: "fsharp4.mp3"
        },

        "E4Note": {
            image: "E4Note.svg",
            description: "The first finger on the D string is the E note! The note is placed on the first line.",
            audio: "e4.mp3"
        },

        "D4Note": {
            image: "D4Note.svg",
            description: "Zero fingers on the D string is the open D note! The note is placed underneath the first line.",
            audio: "d4.mp3"
        },

        "C4Note": {
            image: "C4Note.svg",
            description: "The third finger on the G string is the C note! The note is placed on one ledger line.",
            audio: "c4.mp3"
        },

        "B3Note": {
            image: "B3Note.svg",
            description: "The second finger on the G string is the B note! The note is placed underneath one ledger line.",
            audio: "b3.mp3"
        },

        "A3Note": {
            image: "A3Note.svg",
            description: "The first  finger on the G string is the A note! The note is placed on the second ledger line.",
            audio: "a3.mp3"
        },

        "G3Note": {
            image: "G3Note.svg",
            description: "Zero fingers on the G string is the open G note! The note is placed underneath two ledger lines.",
            audio: "g3.mp3"
        },

    };

    // variables, getting the images and note description from "notes"
    var staffImage = document.getElementById("staffImage");
    var noteDescription = document.getElementById("noteDescription");
    var points = document.querySelectorAll(".touch-point");

    //listening for click
    for (var i = 0; i < points.length; i++) {
        points[i].addEventListener("click", function () {
            var noteKey = this.getAttribute("data-note");
            var note = notes[noteKey];

            if (note) {
                staffImage.src = "../images/musicalStaffNotes/" + note.image;
                noteDescription.textContent = note.description;
                var sound = new Audio("../ViolinNotes/" + note.audio);
                sound.volume = currentVolume;
                sound.play();
            }
        });
    }

    setupVolumeControls();
}

function setupVolumeControls() {
    var volumePlus = document.querySelector('.volume-plus');
    var volumeMinus = document.querySelector('.volume-minus');
    var volumeThumb = document.getElementById('volume-thumb');
    var volumeTrack = document.querySelector('.volume-track');

    function updateThumb() {
        // top: 0% = visual right (max), top: 100% = visual left (min)
        volumeThumb.style.top = ((1 - currentVolume) * 100) + '%';
    }

    function setVolumeFromX(clientX) {
        var rect = volumeTrack.getBoundingClientRect();
        // After rotate(90deg): left edge = min, right edge = max
        var percentage = (clientX - rect.left) / rect.width;
        currentVolume = Math.max(0, Math.min(1, percentage));
        updateThumb();
    }

    if (volumePlus) {
        volumePlus.addEventListener('click', function (e) {
            e.stopPropagation();
            currentVolume = Math.min(1, currentVolume + 0.1);
            updateThumb();
        });
    }

    if (volumeMinus) {
        volumeMinus.addEventListener('click', function (e) {
            e.stopPropagation();
            currentVolume = Math.max(0, currentVolume - 0.1);
            updateThumb();
        });
    }

    if (volumeTrack) {
        volumeTrack.addEventListener('click', function (e) {
            setVolumeFromX(e.clientX);
        });
    }

    if (volumeThumb) {
        var isDragging = false;

        volumeThumb.addEventListener('mousedown', function (e) {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            setVolumeFromX(e.clientX);
        });

        document.addEventListener('mouseup', function () {
            isDragging = false;
        });

        volumeThumb.addEventListener('touchstart', function (e) {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('touchmove', function (e) {
            if (!isDragging) return;
            setVolumeFromX(e.touches[0].clientX);
        });

        document.addEventListener('touchend', function () {
            isDragging = false;
        });
    }
}



