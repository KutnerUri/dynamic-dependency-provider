function ResourceFetcher() {
	this.fetch = fetch;
	this.fetchUsingScriptTag = fetchUsingScriptTag;

	function fetch(location){
		return fetch(location)
		.catch(() => { throw new Error("failed fetching " + location) })
		.then(x => x.text())
		.then(code => eval(code));
	}
	
	function fetchUsingScriptTag(location){
		console.log("fetching...", location);
		var scriptTag = document.createElement("script");
		scriptTag.setAttribute('type', 'text/javascript');
		scriptTag.setAttribute('src', location);
		
		document.body.appendChild(scriptTag);
		
		return new Promise((resolve, reject) => { scriptTag.onload = resolve; scriptTag.onerror = reject; })
	}
}