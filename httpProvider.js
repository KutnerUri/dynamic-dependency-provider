function HttpProvider(resourceFetcher) {
	this.fetch = fetch;
	this.canHandle = alwaysYes;

	function fetch(className) {
		var path = className + ".js";
		resourceFetcher.fetchUsingScriptTag(path);

		return true;
	}

	function alwaysYes() {
		return true;
	}
}