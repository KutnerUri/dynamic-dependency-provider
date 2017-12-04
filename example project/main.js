(function(){
	const reactPath = "https://cdnjs.cloudflare.com/ajax/libs/react/16.1.1/umd/react.production.min.js";
	const reactDomPath = "https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.1.1/umd/react-dom.production.min.js";

	resourceFetcher = new ResourceFetcher();

	ddi.register("React", ResourceAdapter(reactPath, function () { return React }, resourceFetcher))
		.asFactory();
	ddi.register("ReactDom", ResourceAdapter(reactDomPath, function () { return ReactDOM }, resourceFetcher))
		.withDependencies(["React"])
		.asFactory();

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
		ddi.getMany(["ReactDom", nameOfView]).then(([reactDom, viewCtor]) => {
			var element = new viewCtor();
	
			reactDom.render(element, document.getElementById('anchor'));
		});
	}
})();