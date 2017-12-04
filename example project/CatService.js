ddi.register("CatService", CatService);
	// .withDependencies(["React"])
	// .asFactory();

function CatService(){
	this.purr = function(){
		console.log("meow");
	}
}