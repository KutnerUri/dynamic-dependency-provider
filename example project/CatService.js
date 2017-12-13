ddpModule.entry("CatService")
	.registerAs(CatService);

function CatService(){
	this.purr = function(){
		console.log("meow");
	}
}