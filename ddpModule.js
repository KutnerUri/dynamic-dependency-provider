if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	module.exports = DdpModule;
}

function DdpModule(providers, entryProto) {
	this.register = register;
	this.remove = remove;
	this.get = get;
	this.run = get; //right now, it has the same meaning

	function register(className, blueprint, options){
		var entry = new entryProto(className, blueprint, this);
		entry.applyOptions(options);

		providers.forEach(provider => provider.set(className, entry));

		return entry;
	}

	function remove(className) {
		providers.forEach(provider => provider.delete(className));
	}

	function get(className) {
		return promiseFirstOrDefault(providers, provider => provider.get(className))
			.then(entry => entry.create())
			.catch(err => {
				err.message = 'DDI: Failure resolving "' + className + '":\n' + err.message;
				// throw 'DDI: Failure resolving "' + className + '":\n' + "End of chain";
				throw err;
			})
	}

	function promiseFirstOrDefault(chain, func, defaultResult){
		if(!chain || chain.length < 1) return Promise.resolve(defaultResult);
		
		var i = 0;
		return recursiveResolve(undefined);

		function recursiveResolve(value){
			if(!!value) return value;

			if(chain.length <= i) return Promise.reject("End of chain");
			
			var funcResult = func(chain[i]);
			var nextPromise = Promise.resolve(funcResult);
			i++;

			return nextPromise.then(recursiveResolve);
		}
	}
}