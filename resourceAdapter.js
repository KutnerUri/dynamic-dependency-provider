function ResourceAdapter(resourceLocation, onLoadAdaptor, resourceFetcher){
	return factory;
	
	function factory(){
		return resourceFetcher.fetchUsingScriptTag(resourceLocation)
			.then(() => onLoadAdaptor());
	}
}