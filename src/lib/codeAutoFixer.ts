
/**
 * Auto-fixes common mistakes in AI-generated Remotion code.
 */
export function autoFixRemotionCode(code: string): string {
    let fixed = code;

    // 1. Fix Typo: extrapulate -> extrapolate (Case Insensitive)
    fixed = fixed.replace(/extrapulate/gi, 'extrapolate');

    // 2. AGGRESSIVE: Remove ALL inline comments (// ...) GLOBALLY
    // This prevents comments from breaking style objects, JSX props, and template literals.
    // The regex uses negative lookbehind (?<!:) to avoid breaking http:// and https://
    // It removes // and everything after it until end of line, for each line.
    fixed = fixed.replace(/(?<!:)\/\/(?![\*\/]).*$/gm, '');

    // 3. Clean up any resulting trailing whitespace on lines
    fixed = fixed.replace(/[ \t]+$/gm, '');

    // 4. Ensure interpolateColors is imported if used
    if (fixed.includes('interpolateColors(') && !fixed.includes('interpolateColors,') && !fixed.includes('interpolateColors }')) {
        fixed = fixed.replace(/import\s*\{/, 'import { interpolateColors,');
        // Clean up double imports
        fixed = fixed.replace(/interpolateColors,\s*interpolateColors/, 'interpolateColors');
    }

    return fixed;
}
