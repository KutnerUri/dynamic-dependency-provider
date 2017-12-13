if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	module.exports = DiEntry;
}

function DiEntry(className) {
	this.name = className;
	this.dependencies = [];
	this.state = {};
	setUpBlueprintPromise(this);

	function setUpBlueprintPromise(obj) {
		obj.blueprint = new Promise(function(reject, resolve){
			obj.resolveBluePrint = resolve;
		});

		obj.blueprint.then(function(){ delete obj.resolveBluePrint; });
	}
}

DiEntry.prototype.registerAs = function registerAs(blueprint){
	if(this.blueprint && !this.blueprint.then) throw new Error("diEntry: cannot override existing blueprint");

	this.resolveBluePrint(blueprint);
	this.blueprint = blueprint;
}

DiEntry.prototype.setDependenciesProvider = function setDependenciesProvider(dependenciesProvider){
	this.dependenciesProvider = dependenciesProvider;
	
	return this;
}

DiEntry.prototype.create = function create(){
	if(!this.blueprint.then){
		return this.lifecycleFactory(this, this.dependenciesProvider);
	}

	var that = this;
	return this.blueprint.then(function(){ return that.create(); } );
};

DiEntry.prototype.applyOptions = function(options){
	if(!options) return;

	for(var key in options) {
		if(!options.hasOwnProperty(key) || !DiEntry.prototype.optionHandlers.hasOwnProperty(key)) return;

		var handlers = DiEntry.prototype.optionHandlers[key];
		var value = options[key];

		handlers.forEach(f => f(this, value, options));
	}

	return this;
};

DiEntry.prototype.strategies = {
	lifecycle: {
		singleton: function singleton(entry) {
			if (entry.state.instance) {
				return Promise.resolve(entry.state.instance);
			}

			entry.state.instance = entry.injectedInstanceFactory(entry);
			if (entry.state.instance.then) {
				entry.state.instance.then(function (value) { entry.state.instance = value; });
			}

			return Promise.resolve(entry.state.instance);
		},
		transient: function transient(entry) {
			return Promise.resolve(entry.injectedInstanceFactory(entry));
		}
	},
	instanceCreation: {
		newCtor: function createNewInstance(entry, actualDependencies) {
			var thisArgument = undefined;
			var dependenciesArgument = [undefined].concat(actualDependencies);
			var injectedCtor = entry.blueprint.bind.apply(entry.blueprint, dependenciesArgument);

			var instance = new injectedCtor();
			return instance;
		},
		
		"function": function executeFunction(entry, actualDependencies) {
			return entry.blueprint.apply(null, actualDependencies);
		}
	},
	dependencyInjection: {
		ctorInjection: function ctorInjection(entry) {
			var dependenciesPromises = entry.dependencies.map(x => entry.dependenciesProvider.get(x));
			
			return Promise.all(dependenciesPromises)
				.then(actualDependencies => entry.instanceFactory(entry, actualDependencies));
		}
	}
};

DiEntry.prototype.optionHandlers = {
	instanceStrategy: [
		function(entry, value, options){
			var instanceFactory = DiEntry.prototype.strategies.instanceCreation[value];
			if(!instanceFactory) throw 'no such option "instanceStrategy: ' + value + '"';

			entry.instanceFactory = instanceFactory;
		}
	],
	
	lifecycleStrategy: [
		function(entry, value, options){
			var lifecycleFactory = DiEntry.prototype.strategies.lifecycle[value];
			if(!lifecycleFactory) throw 'no such option "lifecycleStrategy: ' + value + '"';

			entry.lifecycleFactory = lifecycleFactory;
		}	
	],

	asSingletonInstance: [
		function cacheInstance(entry, value, options) {
			if(!value) return;
			
			entry.state.instance = entry.blueprint;
		},
		function setStrategy(entry, value, options){
			if(!value) return;
			
			if (entry.lifecycleFactory == DiEntry.prototype.strategies.lifecycle.singleton) {
				return;
			}
			
			entry.lifecycleFactory = DiEntry.prototype.strategies.lifecycle.singleton;
		}
	],

	dependencies: [
		function setDependencies(entry, value, options){
			entry.dependencies = value;
		}
	]
};

DiEntry.prototype.lifecycleFactory= DiEntry.prototype.strategies.lifecycle.singleton;
DiEntry.prototype.instanceFactory =	DiEntry.prototype.strategies.instanceCreation.newCtor;
DiEntry.prototype.injectedInstanceFactory =	DiEntry.prototype.strategies.dependencyInjection.ctorInjection;
