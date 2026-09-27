const elements = {
	form: document.querySelector("#keyword-form"),
	input: document.querySelector("#keyword-input"),
	list: document.querySelector("#keyword-list"),
	emptyState: document.querySelector("#empty-state"),
	keyMatching: document.querySelector("#key-matching"),
	optionsButton: document.querySelector("#options-button"),
	clearButton: document.querySelector("#clear-button"),
	saveStatus: document.querySelector("#save-status")
};

let keywords = [];

async function loadSettings() {
	const settings = await browser.storage.local.get({
		Keys: [],
		KeyMatche: false
	});

	keywords = Array.isArray(settings.Keys) ? settings.Keys : [];
	elements.keyMatching.checked = settings.KeyMatche === true;
	renderKeywords();
}

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

async function saveSettings() {
	await browser.storage.local.set({
		Keys: keywords,
		KeyMatche: elements.keyMatching.checked
	});

	renderKeywords();
	elements.saveStatus.textContent = "已保存";
	window.setTimeout(() => {
		elements.saveStatus.textContent = "设置会自动保存";
	}, 1600);
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
elements.optionsButton.addEventListener("click", () => browser.runtime.openOptionsPage());

elements.clearButton.addEventListener("click", () => {
	keywords = [];
	saveSettings();
});

loadSettings();
