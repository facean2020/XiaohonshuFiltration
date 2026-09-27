class FuzzyAdapterBase {
	constructor(apiKey, providerUrl) {
		this.apiKey = typeof apiKey === "string" ? apiKey.trim() : "";
		this.providerUrl = typeof providerUrl === "string" ? providerUrl.trim() : "";
	}

	async classify() {
		throw new Error("Fuzzy adapter must implement classify");
	}
}
