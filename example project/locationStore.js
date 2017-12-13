ddpModule.entry("LocationStore")
	.registerAs(LocationStore);


function LocationStore(){
	const defaultHashRoute = "MainView";
	var currentHashRoute = defaultHashRoute;
	var onChange = [];

	window.location.hash = defaultHashRoute;
	window.onhashchange = handleHashChanges;

	this.subscribe = subscribe;
	
	function subscribe(func){
		onChange.push(func);

		func(currentHashRoute);
	}

	function handleHashChanges(hashChangeEvent){
		var hashRoute = window.location.hash.substring(1); //to remove '#' prefix

		if(!hashRoute || hashRoute == currentHashRoute) return;

		currentHashRoute = hashRoute;

		onChange.forEach(x => x(currentHashRoute));
	};
}