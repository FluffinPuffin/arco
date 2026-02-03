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
function notesFunction() {

    // Notes object
    var notes = {


        "A5Note": {
            image: "A5Note.svg",
            description: "The third finger on the E string is the A note! The note is placed on one ledger line above the staff."
        },

        "GSharp5Note": {
            image: "GSharp5Note.svg",
            description: "The second finger on the E string is the G# note! The note is placed above the fifth line."
        },

        "FSharp5Note": {
            image: "FSharp5Note.svg",
            description: "The first finger on the E string is the F# note! The note is placed on the fifth line."
        },

        "E5Note": {
            image: "E5Note.svg",
            description: "Zero fingers on the E string is the open E note! The note is placed in the fourth space."
        },
        "D5Note": {
            image: "D5Note.svg",
            description: "The third finger on the A string is the D note! The note is placed on the fourth line."
        },

        "Csharp5": {
            image: "Csharp5Note.svg",
            description: "The second finger on the A string is the C# note! The note is placed in the third space."
        },

        "B4Note": {
            image: "B4Note.svg",
            description: "The  first finger on the A string is the B note! The note is placed on the third line."
        },

        "A4Note": {
            image: "A4Note.svg",
            description: "Zero fingers on the A string is the open A note! The note is placed in the second space."
        },
        "G4Note": {
            image: "G4Note.svg",
            description: "The third finger on the D string is the G note! The note is placed on the second line."
        },

        "FSharp4Note": {
            image: "FSharp4Note.svg",
            description: "The second finger on the D string is the F# note! The note is placed in the first space."
        },

        "E4Note": {
            image: "E4Note.svg",
            description: "The first finger on the D string is the E note! The note is placed on the first line."
        },

        "D4Note": {
            image: "D4Note.svg",
            description: "Zero fingers on the D string is the open D note! The note is placed underneath the first line."
        },

        "C4Note": {
            image: "C4Note.svg",
            description: "The third finger on the G string is the C note! The note is placed on one ledger line."
        },

        "B3Note": {
            image: "B3Note.svg",
            description: "The second finger on the G string is the B note! The note is placed underneath one ledger line."
        },

        "A3Note": {
            image: "A3Note.svg",
            description: "The first  finger on the G string is the A note! The note is placed on the second ledger line."
        },

        "G3Note": {
            image: "G3Note.svg",
            description: "Zero fingers on the G string is the open G note! The note is placed underneath two ledger lines."
        },

    };

    // Elements
    var staffImage = document.getElementById("staffImage");
    var noteDescription = document.getElementById("noteDescription");
    var points = document.querySelectorAll(".touch-point");

    // Event listener
    for (var i = 0; i < points.length; i++) {
        points[i].addEventListener("click", function () {
            var noteKey = this.getAttribute("data-note");
            var note = notes[noteKey];

            if (note) {
                staffImage.src = "../images/musicalStaffNotes/" + note.image;
                noteDescription.textContent = note.description;
            }
        });
    }
}



