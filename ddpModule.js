if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	module.exports = DdpModule;
}

function DdpModule(providers, entryProto) {
	this.entry = entry;
	this.peek = peek;
	this.get = get;
	this.run = get; //right now, it has the same meaning

	var _cache = new Map();
	var _this = this;

	function entry(className) {
		var entry = _cache.get(className);
		if (!entry) {
			var entry = createEntry(className)
			_cache.set(className, entry);
		}
	
		return entry;
	}

	function peek(className) {
		return _cache.get(className);
	}

	function get(className) {
		var entry = _cache.get(className) || getFromProviders(className);
		
		return entry.create();
	}

	function createEntry(className){
		var entry = new entryProto(className);
		entry.setDependenciesProvider(_this);

		return entry;
	}

	function getFromProviders(className) {
		for (var i = 0; i < providers.length; i++) {
			if (providers[i].canHandle(className)) {
				var entry = providers[i].fetch(className);
				if (!entry) {
					entry = createEntry(className);
				}

				_cache.set(className, entry);

				return entry;
			}
		}
		
		throw new Error("DDP: cannot find a provider to resolve: \"" + className + "\"");
	}
}