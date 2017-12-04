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
	})
	ddpModule.register("ReactDom", ResourceAdapter(reactDomPath, function () { return ReactDOM }, resourceFetcher), {
		dependencies: ["React"],
		instanceStrategy: "function"
	})

	const defaultRoute = "MainView";
	location.hash = "#" + defaultRoute;

	window.onhashchange = handleHashChanges;
	handleHashChanges(); //for first view

	function handleHashChanges(){
		var viewName = location.hash.substring(1); //to remove '#' prefix
		viewName = viewName || defaultRoute;
		
		updateRoot(viewName);
	}

	function updateRoot(nameOfView){
		ddpModule.getMany(["ReactDom", nameOfView]).then(([reactDom, viewCtor]) => {
			var element = new viewCtor();
	
			reactDom.render(element, document.getElementById('anchor'));
		});
	}
})();