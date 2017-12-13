function HttpProvider(resourceFetcher){
	var _pendingRequests = new Map();

	this.get = get;
	this.set = set;
	this.delete = _pendingRequests.delete.bind(_pendingRequests);

	function get(className) {
		var existingRequest = _pendingRequests.get(className);
		if (existingRequest) return existingRequest.promise;

		var request = new Request();
		_pendingRequests.set(className, request);

		return request.execute(className + ".js");
	}

	function set(className, diEntry) {
		var existingRequest = _pendingRequests.get(className);
		if (!existingRequest) return;

		existingRequest.resolve(diEntry);
		this.delete(className);
	}

	function Request() {
		var _this = this;
		this.resolve = undefined;
		this.reject = undefined;

		this.promise = new Promise(function (resolve, reject) {
			_this.resolve = resolve; _this.reject = reject
		});
	}

	Request.prototype.execute = function (path) {
		var fetchPromise = resourceFetcher.fetchUsingScriptTag(path);
		fetchPromise.catch(err => request.reject(err));

		return this.promise;
	}
}