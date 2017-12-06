(function(){
	const reactPath = "https://cdnjs.cloudflare.com/ajax/libs/react/16.1.1/umd/react.production.min.js";
	const reactDomPath = "https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.1.1/umd/react-dom.production.min.js";
	
	resourceFetcher = new ResourceFetcher();

	var ddp = new DDP({
		resourceFetcher: resourceFetcher,
		httpProviderProto: HttpProvider,
		diEntryProto: DiEntry,
		mapProto: Map
	});
	window.ddpModule = ddp.module("cool single multipage app");

	ddpModule.register("React", ResourceAdapter(reactPath, function () { return React }, resourceFetcher), {
		instanceStrategy: "function"
	});
	ddpModule.register("ReactDom", ResourceAdapter(reactDomPath, function () { return ReactDOM }, resourceFetcher), {
		dependencies: ["React"],
		instanceStrategy: "function"
	});

	ddpModule.run("RootRenderer");
})();