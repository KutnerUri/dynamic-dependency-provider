ddpModule.register("RootRenderer", RootRenderer, {
	dependencies: ["ReactDom", "LocationStore"],
	instanceStrategy: "function"
});

function RootRenderer(reactDom, locationStore){
	locationStore.subscribe(updateRoot);

	function updateRoot(path){
		ddpModule.get(path).then((viewProto) => {
			var element = new viewProto();
	
			reactDom.render(element, document.getElementById('anchor'));
		});
	}
}