ddpModule.entry("View1")
	.applyOptions({
		dependencies: ["React"],
		instanceStrategy: "function"
	})
	.registerAs(provider);

function provider(react){
	return function View1(){
		var children = [];
		children.push(react.createElement("h1", null, "first view"));
		children.push(react.createElement("a", { href: "#MainView"}, "go back to the main page"));
		
		return react.createElement("div", {className: "first-view"}, children);
	}
}