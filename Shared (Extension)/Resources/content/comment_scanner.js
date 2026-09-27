//
//  comment_scanner.js
//  XiaohonshuFiltration
//
//  Created by yangzicheng on 2026/9/24.
//

const HIDDEN_COMMENT_CLASS = "xhs-comment-hidden";
const DEBUG_COMMENT_CLASS = "xhs-comment-debug";

function ensureHiddenCommentStyle() {
    if (document.getElementById("xhs-comment-filter-style")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "xhs-comment-filter-style";
    style.textContent = `
        .${HIDDEN_COMMENT_CLASS} { display: none !important; }
        .${DEBUG_COMMENT_CLASS} {
            outline: 2px solid #ff2442 !important;
            outline-offset: -2px;
            background: rgba(255, 36, 66, 0.1) !important;
        }
        .${DEBUG_COMMENT_CLASS}::after {
            content: "过滤规则命中";
            display: inline-block;
            margin-left: 8px;
            padding: 2px 5px;
            border-radius: 4px;
            color: #ffffff;
            background: #ff2442;
            font-size: 10px;
            line-height: 1.2;
        }
    `;
    document.head.appendChild(style);
}

async function scanComment(commentElement) {
    const textElement = commentElement.querySelector(".note-text");
    if (!textElement) {
        return false;
    }

    commentElement.dataset.xhsScanned = "true";

    const comment = textElement.textContent.trim();
    console.log("[XHS filtration] comment:", comment);

    const result = await filter(comment);
    console.debug("[XHS filtration] comment decision", {
        comment,
        matched: result.matched,
        keywordMatched: result.keywordMatched
    });

    if (result.matched && result.debugMode) {
        commentElement.classList.add(DEBUG_COMMENT_CLASS);
        commentElement.dataset.xhsRuleMatch = "true";
    }

    if (result.matched && !result.debugMode) {
        commentElement.classList.add(HIDDEN_COMMENT_CLASS);
        return true;
    }

    return false;
}

function scanComments(root = document) {
    const commentList = [];

    if (root.matches?.(".comment-item")) {
        commentList.push(root);
    }
    commentList.push(...root.querySelectorAll(".comment-item"));

    const newComments = commentList
        .filter(commentElement => !commentElement.dataset.xhsScanned)
        .map(async commentElement => {
            return scanComment(commentElement);
        });

    return Promise.all(newComments);
}

function refreshScannedComments() {
    document.querySelectorAll(".comment-item[data-xhs-scanned]").forEach(commentElement => {
        commentElement.classList.remove(HIDDEN_COMMENT_CLASS, DEBUG_COMMENT_CLASS);
    delete commentElement.dataset.xhsRuleMatch;
        scanComment(commentElement);
    });
}

function observeFilterSettings() {
    settingsListener = (changes, areaName) => {
        if (areaName !== "local") {
            return;
        }

        const filterSettingChanged = ["Keys", "FuzzyRules", "debugMode"]
            .some(key => key in changes);
        if (filterSettingChanged) {
            refreshScannedComments();
        }
    };
    browser.storage.onChanged.addListener(settingsListener);
}

let observer;
let settingsListener;
let domContentLoadedHandler;

function initScanner() {
    if (observer) {
        return;
    }

    if (!document.body) {
        if (!domContentLoadedHandler) {
            domContentLoadedHandler = () => {
                domContentLoadedHandler = undefined;
                initScanner();
            };
            document.addEventListener("DOMContentLoaded", domContentLoadedHandler, { once: true });
        }
        return;
    }

    ensureHiddenCommentStyle();
    observeFilterSettings();

    observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    continue;
                }

                scanComments(node);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    scanComments();
}

function stopScanner() {
    observer?.disconnect();
    observer = undefined;

    if (settingsListener) {
        browser.storage.onChanged.removeListener(settingsListener);
        settingsListener = undefined;
    }

    if (domContentLoadedHandler) {
        document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
        domContentLoadedHandler = undefined;
    }
}