"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callAI = callAI;
exports.extractCodeFromResponse = extractCodeFromResponse;
const ERRORS = {
    NO_PROVIDER: "No provider configured.",
    INVALID_KEY: "Invalid API key.",
    RATE_LIMIT: "Rate limit.",
    NETWORK: "Network error.",
    TIMEOUT: "Timeout.",
    UNKNOWN: "Error.",
};
const parseError = (e) => {
    const s = String(e).toLowerCase();
    if (s.includes("401") || s.includes("unauthorized"))
        return ERRORS.INVALID_KEY;
    if (s.includes("429") || s.includes("rate limit"))
        return ERRORS.RATE_LIMIT;
    if (s.includes("network") || s.includes("fetch"))
        return ERRORS.NETWORK;
    return ERRORS.UNKNOWN;
};
const fs = require('fs');
const path = require('path');

async function getAvailableModels(apiKey) {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        return data.models ? data.models.map(m => m.name).join(', ') : "No models list returned";
    } catch (e) {
        return "Failed to list models: " + e.message;
    }
}

async function fetchAI(url, headers, body, extractor) {
    try {
        const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        if (!res.ok) {
            const txt = await res.text(); // Get raw response body for debugging
            throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        const data = await res.json();
        return { success: true, content: extractor(data) };
    }
    catch (e) {
        let errorMsg = e.message || "Unknown Error";
        try {
            fs.appendFileSync('backend_debug.log', `[${new Date().toISOString()}] [AI Service Error] URL: ${url}\nError: ${e.message}\n`);

            // Auto-diagnose 404s for Gemini
            if (e.message.includes('404') && url.includes('generativelanguage')) {
                const match = url.match(/key=([^&]+)/);
                if (match) {
                    const models = await getAvailableModels(match[1]);
                    errorMsg += `\n\n>>> MODELLI DISPONIBILI: ${models}`;
                }
            }
        } catch (err) { console.error(err); }
        // Return actual error message to UI
        return { success: false, error: errorMsg };
    }
}
async function callAI(config, prompt) {
    if (!config || config.provider === "none")
        return { success: false, error: ERRORS.NO_PROVIDER };
    if (!config.apiKey && config.provider !== "claude-cli")
        return { success: false, error: ERRORS.INVALID_KEY };

    const apiKey = config.apiKey.trim();

    switch (config.provider) {
        case "anthropic":
            return fetchAI("https://api.anthropic.com/v1/messages", { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" }, { model: "claude-3-sonnet-20240229", max_tokens: 4096, messages: [{ role: "user", content: prompt }] }, (d) => d.content?.[0]?.text || "");
        case "openai":
            return fetchAI("https://api.openai.com/v1/chat/completions", { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, { model: "gpt-4-turbo-preview", max_tokens: 4096, messages: [{ role: "user", content: prompt }] }, (d) => d.choices?.[0]?.message?.content || "");
        case "gemini":
            let modelId = config.model || "gemini-1.5-flash";
            if (modelId.startsWith("models/")) modelId = modelId.replace("models/", "");

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
            try { fs.appendFileSync('backend_debug.log', `[${new Date().toISOString()}] calling Gemini URL (masked): ${geminiUrl.replace(apiKey, '***')}\n`); } catch (e) { }
            return fetchAI(geminiUrl, { "Content-Type": "application/json" }, { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 16384, temperature: 0.7 } }, (d) => d.candidates?.[0]?.content?.parts?.[0]?.text || "");
        case "openrouter":
            return fetchAI("https://openrouter.ai/api/v1/chat/completions", { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "HTTP-Referer": "https://remotion-app", "X-Title": "Remotion Editor" }, { model: config.openrouterConfig?.model || "anthropic/claude-3.5-sonnet", max_tokens: config.openrouterConfig?.maxTokens || 4096, messages: [{ role: "user", content: prompt }] }, (d) => d.choices?.[0]?.message?.content || "");
        case "claude-cli":
            return { success: true, content: "" }; // Handled by main process exec
        default:
            return { success: false, error: ERRORS.NO_PROVIDER };
    }
}
function extractCodeFromResponse(res) {
    const match = res.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/);
    return match ? match[1].trim() : res.trim();
}
//# sourceMappingURL=ai-service.js.map