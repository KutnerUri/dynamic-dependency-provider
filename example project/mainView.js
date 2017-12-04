ddpModule.register("MainView", provider, {
	dependencies: ["React"],
	instanceStrategy: "function"
});

function provider(react) {
	return MainView;

	function MainView() {
		var children = ["View1", "View2", "View3"]
		.map(x => react.createElement("a", { href: "#" + x }, x))
		.map(x => react.createElement("div", null, x));
		
		children.unshift(react.createElement("h1", null, "main view"));
		
		return react.createElement("div", {className: "main-view"}, children);
	}
}