const elements = {
	form: document.querySelector("#keyword-form"),
	input: document.querySelector("#keyword-input"),
	list: document.querySelector("#keyword-list"),
	emptyState: document.querySelector("#empty-state"),
	keyMatching: document.querySelector("#key-matching"),
	fuzzyMatching: document.querySelector("#fuzzy-matching"),
	fuzzyRuleForm: document.querySelector("#fuzzy-rule-form"),
	fuzzyRuleInput: document.querySelector("#fuzzy-rule-input"),
	fuzzyRuleList: document.querySelector("#fuzzy-rule-list"),
	fuzzyRuleEmpty: document.querySelector("#fuzzy-rule-empty"),
	modelType: document.querySelector("#model-type"),
	model: document.querySelector("#model"),
	apiKey: document.querySelector("#api-key"),
	providerUrl: document.querySelector("#provider-url"),
	connectionFields: document.querySelector("#connection-fields"),
	modelSaveButton: document.querySelector("#model-save-button"),
	modelHelp: document.querySelector("#model-help"),
	debugMode: document.querySelector("#debug-mode"),
	clearButton: document.querySelector("#clear-button"),
	saveStatus: document.querySelector("#save-status")
};

let keywords = [];

async function loadSettings() {
	const settings = await browser.storage.local.get({
		Keys: [],
		FuzzyRules: [],
		KeyMatche: false,
		fuzzyMatche: false,
		type: "",
		api_key: "",
		provider_url: "",
		model: "",
		debugMode: false
	});

	keywords = Array.isArray(settings.Keys) ? settings.Keys : [];
	fuzzyRules = Array.isArray(settings.FuzzyRules) ? settings.FuzzyRules : [];
	elements.keyMatching.checked = settings.KeyMatche === true;
	elements.fuzzyMatching.checked = settings.fuzzyMatche === true;
	elements.modelType.value = typeof settings.type === "string" ? settings.type : "";
	elements.model.value = typeof settings.model === "string" ? settings.model : "";
	elements.apiKey.value = typeof settings.api_key === "string" ? settings.api_key : "";
	elements.providerUrl.value = typeof settings.provider_url === "string" ? settings.provider_url : "";
	elements.debugMode.checked = settings.debugMode === true;
	updateModelFields();
	renderKeywords();
	renderFuzzyRules();
}

let fuzzyRules = [];

function renderKeywords() {
	elements.list.replaceChildren();
	elements.emptyState.hidden = keywords.length > 0;

	keywords.forEach(keyword => {
		const item = document.createElement("span");
		item.className = "keyword";
		item.append(document.createTextNode(keyword));

		const removeButton = document.createElement("button");
		removeButton.className = "remove-keyword";
		removeButton.type = "button";
		removeButton.setAttribute("aria-label", `删除关键词 ${keyword}`);
		removeButton.textContent = "×";
		removeButton.addEventListener("click", () => {
			keywords = keywords.filter(itemKeyword => itemKeyword !== keyword);
			saveSettings();
		});

		item.append(removeButton);
		elements.list.append(item);
	});
}

function renderFuzzyRules() {
	elements.fuzzyRuleList.replaceChildren();
	elements.fuzzyRuleEmpty.hidden = fuzzyRules.length > 0;

	fuzzyRules.forEach(rule => {
		const item = document.createElement("span");
		item.className = "keyword";
		item.append(document.createTextNode(rule));

		const removeButton = document.createElement("button");
		removeButton.className = "remove-keyword";
		removeButton.type = "button";
		removeButton.setAttribute("aria-label", `删除模糊匹配规则 ${rule}`);
		removeButton.textContent = "×";
		removeButton.addEventListener("click", () => {
			fuzzyRules = fuzzyRules.filter(itemRule => itemRule !== rule);
			saveSettings();
		});

		item.append(removeButton);
		elements.fuzzyRuleList.append(item);
	});
}

async function saveSettings() {
	await browser.storage.local.set({
		Keys: keywords,
		KeyMatche: elements.keyMatching.checked,
		fuzzyMatche: elements.fuzzyMatching.checked,
		FuzzyRules: fuzzyRules,
		debugMode: elements.debugMode.checked
	});

	renderKeywords();
	renderFuzzyRules();
	showSavedStatus();
}

async function saveModelSettings() {
	const type = elements.modelType.value;
	const model = elements.model.value.trim();
	const apiKey = elements.apiKey.value.trim();
	const providerUrl = elements.providerUrl.value.trim();
	const isValid = type !== "llm_openai"
		|| (model.length > 0 && apiKey.length > 0 && providerUrl.length > 0);

	if (!isValid) {
		elements.modelHelp.textContent = "OpenAI 配置需要填写 Model、API Key 和 Provider URL";
		elements.modelHelp.classList.add("error-notice");
		return;
	}

	await browser.storage.local.set({
		type,
		api_key: apiKey,
		provider_url: providerUrl,
		model
	});

	elements.modelHelp.textContent = "模型配置已保存";
	elements.modelHelp.classList.remove("error-notice");
	showSavedStatus();
}

function showSavedStatus() {
	elements.saveStatus.textContent = "已保存";
	window.setTimeout(() => {
		elements.saveStatus.textContent = "设置会自动保存";
	}, 1600);
}

function updateModelFields() {
	const type = elements.modelType.value;
	const isOpenAI = type === "llm_openai";
	elements.connectionFields.hidden = type === "";
	elements.model.required = isOpenAI;
	elements.model.disabled = !isOpenAI;
	elements.apiKey.required = isOpenAI;
	elements.providerUrl.required = isOpenAI;
	elements.apiKey.disabled = type === "";
	elements.providerUrl.disabled = type === "";
	elements.modelHelp.classList.remove("error-notice");

	if (type === "jev") {
		elements.modelHelp.textContent = "JEV 接口暂未接入，当前不会执行模糊匹配";
	} else if (type === "llm_openai") {
		elements.modelHelp.textContent = "OpenAI 兼容接口需要填写 Model、API Key 和 Provider URL";
	} else {
		elements.modelHelp.textContent = "未配置模型，模糊匹配不会发起请求";
	}
}

elements.form.addEventListener("submit", event => {
	event.preventDefault();
	const keyword = elements.input.value.trim();

	if (!keyword || keywords.includes(keyword)) {
		elements.input.focus();
		return;
	}

	keywords.push(keyword);
	elements.input.value = "";
	saveSettings();
});

elements.keyMatching.addEventListener("change", saveSettings);
elements.fuzzyMatching.addEventListener("change", saveSettings);
elements.modelType.addEventListener("change", updateModelFields);
elements.modelSaveButton.addEventListener("click", saveModelSettings);
elements.debugMode.addEventListener("change", saveSettings);

elements.fuzzyRuleForm.addEventListener("submit", event => {
	event.preventDefault();
	const rule = elements.fuzzyRuleInput.value.trim();

	if (!rule || fuzzyRules.includes(rule)) {
		elements.fuzzyRuleInput.focus();
		return;
	}

	fuzzyRules.push(rule);
	elements.fuzzyRuleInput.value = "";
	saveSettings();
});

elements.clearButton.addEventListener("click", () => {
	keywords = [];
	saveSettings();
});

loadSettings();
