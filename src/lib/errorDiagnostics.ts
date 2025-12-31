// Error diagnostic helper for render failures
// Parses render error messages and provides user-friendly explanations

export interface ErrorDiagnosis {
    type: 'code' | 'config' | 'dependency' | 'file' | 'unknown';
    title: string;
    message: string;
    hint: string;
    details?: string;
}

export function diagnoseRenderError(errorMessage: string): ErrorDiagnosis {
    const msg = errorMessage.toLowerCase();

    // Syntax errors in TSX code
    if (msg.includes('syntaxerror') || msg.includes('unexpected token') || msg.includes('parsing error')) {
        return {
            type: 'code',
            title: '❌ Syntax Error',
            message: 'The TSX code contains syntax errors.',
            hint: 'Check that all curly braces {} and parentheses () are balanced and that the JSX is valid.',
            details: errorMessage
        };
    }

    // spring() with negative frames or wrong params
    if (msg.includes('spring') || msg.includes('nan') || msg.includes('infinity')) {
        return {
            type: 'code',
            title: '⚠️ Animation Error (spring)',
            message: 'The spring() function is receiving invalid values.',
            hint: 'Use Math.max(0, frame - X) for delayed animations. spring() does not support "from" and "to" parameters inside config.',
            details: errorMessage
        };
    }

    // Easing function errors
    if (msg.includes('easing is not a function') || msg.includes('easing.sine') || msg.includes('easing.') && msg.includes('undefined')) {
        return {
            type: 'code',
            title: '⚠️ Invalid Easing Function',
            message: "You are using an Easing function that does not exist in Remotion.",
            hint: 'Use: Easing.sin (not "sine"), Easing.cubic, Easing.quad, Easing.ease, Easing.bounce, Easing.elastic, etc.',
            details: errorMessage
        };
    }

    // Missing compositionConfig
    if (msg.includes('compositionconfig') || msg.includes('composition config')) {
        return {
            type: 'config',
            title: '⚠️ Missing Configuration',
            message: 'The TSX file does not export compositionConfig.',
            hint: 'Add: export const compositionConfig = { id: "MyVideo", durationInSeconds: 4, fps: 60, width: 1920, height: 1080 };',
            details: errorMessage
        };
    }

    // Missing exports
    if (msg.includes('export default') || msg.includes('is not exported')) {
        return {
            type: 'code',
            title: '⚠️ Missing Export',
            message: 'The main component is not exported correctly.',
            hint: 'Make sure you have "export default ComponentName;" at the end of the file.',
            details: errorMessage
        };
    }

    // Module not found
    if (msg.includes('module not found') || msg.includes("can't resolve")) {
        const moduleMatch = errorMessage.match(/can't resolve '([^']+)'/i);
        const moduleName = moduleMatch ? moduleMatch[1] : 'unknown';
        return {
            type: 'dependency',
            title: '📦 Dependency Not Found',
            message: `The module "${moduleName}" is not installed in the renderer.`,
            hint: 'Supported libraries: react, remotion, three, @react-three/fiber, framer-motion, d3, lodash.',
            details: errorMessage
        };
    }

    // File not found
    if (msg.includes('enoent') || msg.includes('file not found') || msg.includes('no such file')) {
        return {
            type: 'file',
            title: '📁 File Not Found',
            message: 'A required file does not exist.',
            hint: 'Verify that the file path is correct and the file exists.',
            details: errorMessage
        };
    }

    // Undefined/null reference errors
    if (msg.includes('undefined') || msg.includes('null') || msg.includes('is not defined')) {
        return {
            type: 'code',
            title: '⚠️ Reference Not Defined',
            message: 'The code is using a variable or function that is not defined.',
            hint: 'Check that all variables are declared before use.',
            details: errorMessage
        };
    }

    // Timeout errors
    if (msg.includes('timeout') || msg.includes('timed out')) {
        return {
            type: 'unknown',
            title: '⏱️ Timeout',
            message: 'Rendering took too long.',
            hint: 'Try simplifying the animation or reducing the number of elements.',
            details: errorMessage
        };
    }

    // Generic fallback
    return {
        type: 'unknown',
        title: '❓ Rendering Error',
        message: 'An error occurred during rendering.',
        hint: 'Check the code for syntax or logic errors.',
        details: errorMessage
    };
}

export function formatDiagnosisForAlert(diagnosis: ErrorDiagnosis): string {
    return `${diagnosis.title}\n\n${diagnosis.message}\n\n💡 Hint: ${diagnosis.hint}${diagnosis.details ? `\n\n📋 Details:\n${diagnosis.details.substring(0, 500)}` : ''}`;
}
