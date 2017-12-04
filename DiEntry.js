module.exports = DiEntry;

function DiEntry(className, classBlueprint, dependenciesProvider) {
	this.name = className;
	this.blueprint = classBlueprint;
	this.dependencies = [];
	this.state = {};
	this.dependenciesProvider = dependenciesProvider;	
}

DiEntry.prototype.create = function create() {
	return this.lifecycleFactory(this, this.dependenciesProvider);
}

DiEntry.prototype.strategies = {
	lifecycle: {
		singleton: function singleton(entry, dependenciesProvider) {
			if (entry.state.instance) {
				return Promise.resolve(entry.state.instance);
			}

			var instantiationPromise = dependenciesProvider
				.getMany(entry.dependencies)
				.then(actualDependencies => entry.instanceFactory(entry, actualDependencies));

			entry.state.instance = instantiationPromise;
			instantiationPromise.then(function (value) { entry.state.instance = value; });

			return instantiationPromise;
		},
		transient: function transient(entry, dependenciesProvider) {
			return dependenciesProvider
				.getMany(entry.dependencies)
				.then(actualDependencies => entry.instanceFactory(entry, actualDependencies));
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
		
		function: function executeFunction(entry, actualDependencies) {
			return entry.blueprint.apply(null, actualDependencies);
		}
	}
};
DiEntry.prototype.lifecycleFactory= DiEntry.prototype.strategies.lifecycle.singleton;
DiEntry.prototype.instanceFactory =	DiEntry.prototype.strategies.instanceCreation.newCtor;

//syntactic suger:
DiEntry.prototype.asFactory = function asFactory() { this.instanceFactory = DiEntry.prototype.strategies.instanceCreation.function; return this; }
DiEntry.prototype.asSingletonInstance = function asFactory() { 
	if(this.lifecycleFactory != DiEntry.prototype.strategies.lifecycle.singleton){
		this.lifecycleFactory = DiEntry.prototype.strategies.lifecycle.singleton;
	}
	
	this.state.instance = this.blueprint;
	return this;
}
DiEntry.prototype.withDependencies = function withDependencies(dependencies) {
	this.dependencies = dependencies;
	return this;
}
DiEntry.prototype.asTransient = function asTransient() { this.lifecycleFactory = DiEntry.prototype.strategies.lifecycle.transient; return this; }