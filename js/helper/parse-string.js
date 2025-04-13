//@ts-check

/**
 * Converts a string from snake_case to Capital Case (with spaces).
 * @param {string} str A string representing a name.
 * @returns The converted string.
 */
export function parseSnakeCase(str) {
    return str.replaceAll(/\_[a-z]/g, m => ` ${m[1].toUpperCase()}`).replace(/^[a-z]/, m => m[0].toUpperCase());    
}