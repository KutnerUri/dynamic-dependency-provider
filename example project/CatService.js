ddpModule.register("CatService", CatService);

function CatService(){
	this.purr = function(){
		console.log("meow");
	}
}