//
//  judge.js
//  XiaohonshuFiltration
//
//  Created by yangzicheng on 2026/9/26.
//

class OpenAIAdapter extends FuzzyAdapterBase {
    async classify(rules, comment) {
        if (!this.providerUrl || !this.apiKey || !this.model) {
            return false;
        }

        const endpoint = this.providerUrl.replace(/\/$/, "").endsWith("/chat/completions")
            ? this.providerUrl
            : `${this.providerUrl.replace(/\/$/, "")}/chat/completions`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                temperature: 0,
                response_format: {
                    type: "json_object"
                },
                messages: [
                    {
                        role: "system",
                        content: "Classify whether the comment matches any rule. Return only a valid JSON object with exactly one boolean field: {\"matched\":true} or {\"matched\":false}. Do not use Markdown or add any other text."
                    },
                    {
                        role: "user",
                        content: JSON.stringify({ rules, comment })
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI provider returned HTTP ${response.status}`);
        }

        const payload = await response.json();
        const content = payload?.choices?.[0]?.message?.content
            ?? payload?.choices?.[0]?.text
            ?? payload?.output_text
            ?? payload?.output?.[0]?.content;
        const matched = parseMatchedResult(content);
        console.debug("[XHS filtration] fuzzy response", {
            content,
            matched,
            responseShape: Object.keys(payload ?? {})
        });
        return matched;
    }
}

class JevAdapter extends FuzzyAdapterBase {
    async classify() {
        // The JEV protocol is not documented yet, so do not match comments.
        return false;
    }
}

class DisabledAdapter extends FuzzyAdapterBase {
    async classify() {
        return false;
    }
}

function parseMatchedResult(content) {
    if (Array.isArray(content)) {
        content = content
            .map(part => typeof part === "string" ? part : part?.text)
            .filter(part => typeof part === "string")
            .join("");
    }

    if (content && typeof content === "object") {
        return typeof content.matched === "boolean" ? content.matched : false;
    }

    if (typeof content !== "string") {
        console.warn("[XHS filtration] fuzzy response has no parseable content", content);
        return false;
    }

    const normalizedContent = content
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    try {
        const result = JSON.parse(normalizedContent);
        return typeof result?.matched === "boolean" ? result.matched : true;
    } catch (error) {
        console.warn("[XHS filtration] fuzzy response is not valid JSON", {
            content: normalizedContent,
            error
        });
        return false;
    }
}

class Judge {
    async createAdapter() {
        const settings = await browser.storage.local.get({
            type: "",
            api_key: "",
            "api-key": "",
            provider_url: "",
            model: ""
        });
        const apiKey = settings.api_key || settings["api-key"];

        if (settings.type === "llm_openai") {
            const model = typeof settings.model === "string" ? settings.model.trim() : "";
            if (!apiKey || !settings.provider_url || !model) {
                return new DisabledAdapter();
            }
            const adapter = new OpenAIAdapter(apiKey, settings.provider_url);
            adapter.model = model;
            return adapter;
        }

        if (settings.type === "jev") {
            return new JevAdapter(apiKey, settings.provider_url);
        }

        return new DisabledAdapter();
    }

    async classifier(rules, comment) {
        const adapter = await this.createAdapter();
        console.debug("[XHS filtration] fuzzy classification", {
            adapter: adapter.constructor.name,
            ruleCount: Array.isArray(rules) ? rules.length : 0,
            comment
        });
        try {
            return await adapter.classify(rules, comment);
        } catch (error) {
            console.error("Fuzzy classification failed", error);
            return false;
        }
    }

    async classifer(rules, comment) {
        return this.classifier(rules, comment);
    }
}

const fuzzyJudge = new Judge();
