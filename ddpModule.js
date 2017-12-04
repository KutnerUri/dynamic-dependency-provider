function DdpModule(providers, entryProto) {
	this.register = register;
	this.remove = remove;
	this.get = get;
	this.getMany = getMany;

	function register(className, blueprint, options){
		var entry = new entryProto(className, blueprint, this);
		entry.applyOptions(options);

		providers.forEach(provider => provider.set(className, entry));

		return entry;
	}

	function remove(className) {
		providers.forEach(provider => provider.remove(className));
	}

	function get(className) {
		return promiseFirstOrDefault(providers, provider => provider.get(className))
			.then(entry => entry.create())
			.catch(err => {
				err.message = "DDI: Failure resolving '" + className + "':\n" + err.message;
				throw err;
			})
	}

	function getMany(classNames){
		if(!classNames) return Promise.resolve();

		var fetchPromises = classNames.map(x => get(x));
		return Promise.all(fetchPromises);
	}

	function promiseFirstOrDefault(chain, func, defaultResult){
		if(!chain || chain.length < 1) return Promise.resolve(defaultResult);
		
		var i = 0;
		var result = func(chain[i]);
		var resultAsPromise = Promise.resolve(result);
		return resultAsPromise.then(onResolve);

		function onResolve(value){
			if(!!value) return value;

			i++;
			if(chain.length <= i) return Promise.reject("End of chain");

			return func(chain[i]).then(onResolve);
		}
	}
}