"use strict";

/**
 * Reads a File object and returns its parsed JSON content.
 *
 * NOTE: This is a classic script (not an ES module) so the site works
 * when index.html is opened directly from disk (file://). It defines
 * a global function, readJsonFile(), that app.js uses.
 */
async function readJsonFile(file) {
    if (!file) {
        throw new Error(
            "No JSON file was selected."
        );
    }

    const text = await file.text();

    try {
        return JSON.parse(text);
    } catch {
        throw new Error(
            `"${file.name}" does not contain valid JSON.`
        );
    }
}
