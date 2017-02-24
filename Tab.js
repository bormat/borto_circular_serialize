/** 
* it is just a class that extend Array to get and set easily last Values 
*/

function Tab(){
	Object.defineProperties(this, {
		"length": {
			enumerable: false,
			writable:true
		},
	});
	if( !isNaN(arguments[0]) && arguments.length == 1){
		this.length=arguments[0];
	}else{
		this.length=0;
		this.push.apply(this,arguments);
	}
}
Tab.prototype = [];//on hérite de array;
var addToProto = {
	push : function(){
		for (var i in arguments){
			this[this.length] = arguments[i];
			this.length++;
		}
		return this.length;
	},
	//négatif part de la fin ,valeur faculatif 
	at : function(i, valeur){
		if (i < 0){
			i += this.length;
		}
		return this[i] = valeur || this[i];
	},	
	last:function(x){
		return(this.at(-1,x));
	}
}

for( var prop in addToProto ){
	Object.defineProperty(Tab.prototype, prop, {
		enumerable: false, 
		value: addToProto[prop]
	});
}

module.exports = {
	default: Tab
}