function DDP(dependenciesObject){
	var expectedDependencies = ["resourceFetcher", "httpProviderProto", "diEntryProto", "mapProto"];

	for(var i = 0; i < expectedDependencies; i++){
		var dependencyName = expectedDependencies[i];
		if(!dependenciesObject[dependencyName]){
			throw "missing dependency " + dependencyName + " to bootstrap DDP";
		}
	}

	this.dependencies = dependenciesObject;
	this.modules = new this.dependencies.mapProto();
}

DDP.prototype.module = function (moduleName) {
	var mod = this.modules.get(moduleName);
	if (mod) return mod;

	var normalCache = new this.dependencies.mapProto();
	var providers = [normalCache, new this.dependencies.httpProviderProto(resourceFetcher)];
	var newModule = new DdpModule(providers, this.dependencies.diEntryProto);

	this.modules.set(moduleName, newModule);

	return newModule;
}