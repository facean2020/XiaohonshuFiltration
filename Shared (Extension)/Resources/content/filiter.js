//
//  filiter.js
//  XiaohonshuFiltration
//
//  Created by yangzicheng on 2026/9/24.
//
async function filter(comment) {
    const settings = await browser.storage.local.get({
        Keys: [],
        FuzzyRules: [],
        KeyMatche: false,
        fuzzyMatche: false,
        debugMode: false
    });

    const keywordMatched = settings.KeyMatche === true && isContainKey(comment, settings.Keys);
    const fuzzyMatched = settings.fuzzyMatche === true
        && await isContainFuzzyContent(comment, settings.FuzzyRules);

    console.debug("[XHS filtration] filter result", {
        keywordMatched,
        fuzzyMatched,
        fuzzyEnabled: settings.fuzzyMatche === true,
        fuzzyRuleCount: Array.isArray(settings.FuzzyRules) ? settings.FuzzyRules.length : 0,
        comment
    });

    return {
        matched: keywordMatched || fuzzyMatched,
        keywordMatched,
        debugMode: settings.debugMode === true
    };
}

function isContainKey(comment, keys) {
    if (typeof comment !== "string") {
        return false;
    }

    const keyList = Array.isArray(keys) ? keys : [keys];
    return keyList.some(key => typeof key === "string" && key.length > 0 && comment.includes(key));
}

async function isContainFuzzyContent(comment, fuzzyRules) {
    if (typeof comment !== "string") {
        return false;
    }

    return fuzzyJudge.classifier(fuzzyRules, comment);
}
