"use strict";

// readJsonFile() comes from json-loader.js. This is loaded first by HTML file.

const fileOneInput =
    document.querySelector("#file-one");

const fileTwoInput =
    document.querySelector("#file-two");

const fileOneStatus =
    document.querySelector("#file-one-status");

const fileTwoStatus =
    document.querySelector("#file-two-status");

const compareButton =
    document.querySelector("#compare-button");

const clearButton =
    document.querySelector("#clear-button");

const resultsSection =
    document.querySelector("#results-section");

const resultsDescription =
    document.querySelector("#results-description");

const mutualsContainer =
    document.querySelector("#mutuals-container");

const noMutuals =
    document.querySelector("#no-mutuals");

const errorMessage =
    document.querySelector("#error-message");

let fileOne = null;
let fileTwo = null;

/**
 * This function checks whether both files have been selected.
 */
function updateCompareButton() {
    compareButton.disabled =
        !(fileOne && fileTwo);
}

/**
 * Displays an error message in case specifications for application aren't met.
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}

/**
 * Promptly clears the current error.
 */
function clearError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
}

/**
 * Extracts only the users from records.
 *
 * Every other property is ignored.
 */
function extractUsers(json) {
    if (!Array.isArray(json.records)) {
        throw new Error(
            'The JSON file does not contain a valid "records" array.'
        );
    }

    return json.records
        .filter(record =>
            record &&
            typeof record.user === "string"
        )
        .map(record =>
            record.user
        );
}

/**
 * Finds the users that occur in BOTH files.
 */
function findMutuals(usersOne, usersTwo) {
    const usersTwoSet =
        new Set(usersTwo);

    const alreadyAdded =
        new Set();

    return usersOne.filter(user => {
        if (
            !usersTwoSet.has(user) ||
            alreadyAdded.has(user)
        ) {
            return false;
        }

        alreadyAdded.add(user);
        return true;
    });
}

/**
 * Displays the mutual users.
 */
function displayMutuals(mutuals) {
    mutualsContainer.replaceChildren();

    noMutuals.hidden =
        mutuals.length !== 0;

    mutuals.forEach(
        (user, index) => {
            const article =
                document.createElement("article");
            article.className =
                "mutual";

            const number =
                document.createElement("span");
            number.className =
                "mutual-number";
            number.textContent =
                `Mutual #${index + 1}`;

            const userName =
                document.createElement("span");
            userName.className =
                "mutual-user";
            userName.textContent =
                user;

            article.append(
                number,
                userName
            );

            mutualsContainer.appendChild(
                article
            );
        }
    );
}

/**
 * Performs the complete comparison.
 */
async function compareFiles() {
    clearError();

    try {
        const [
            jsonOne,
            jsonTwo
        ] = await Promise.all([
            readJsonFile(fileOne),
            readJsonFile(fileTwo)
        ]);

        const usersOne =
            extractUsers(jsonOne);
        const usersTwo =
            extractUsers(jsonTwo);

        const mutuals =
            findMutuals(
                usersOne,
                usersTwo
            );

        resultsDescription.textContent =
            `${mutuals.length} mutual${mutuals.length === 1 ? "" : "s"} ` +
            `for ${fileOne.name} & ${fileTwo.name}:`;

        displayMutuals(mutuals);

        resultsSection.hidden =
            false;

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        resultsSection.hidden =
            true;
        showError(
            error.message
        );
    }
}

/**
 * Reads the CURRENT state of both file inputs and updates the
 * variables, status text and button to match.
 *
 * The inputs themselves are the single source of truth. Calling this on
 * every change AND once at page load keeps the status text correct even
 * if the browser restored a chosen file (e.g. after a refresh or
 * back/forward navigation) without firing a "change" event.
 */
function syncFilesFromInputs() {
    fileOne =
        fileOneInput.files[0] ?? null;
    fileTwo =
        fileTwoInput.files[0] ?? null;

    fileOneStatus.textContent =
        fileOne
            ? fileOne.name
            : "No file selected.";

    fileTwoStatus.textContent =
        fileTwo
            ? fileTwo.name
            : "No file selected.";

    updateCompareButton();
}

fileOneInput.addEventListener(
    "change",
    syncFilesFromInputs
);

fileTwoInput.addEventListener(
    "change",
    syncFilesFromInputs
);

/**
 * Sync on load, and again if the page is restored from the
 * back/forward cache.
 */
syncFilesFromInputs();
window.addEventListener(
    "pageshow",
    syncFilesFromInputs
);

/**
 * Find mutual users.
 */
compareButton.addEventListener(
    "click",
    compareFiles
);

/**
 * Reset the application.
 */
clearButton.addEventListener(
    "click",
    () => {
        fileOneInput.value = "";
        fileTwoInput.value = "";

        syncFilesFromInputs();

        mutualsContainer.replaceChildren();
        noMutuals.hidden =
            true;

        resultsSection.hidden =
            true;

        clearError();
    }
);
