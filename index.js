	/*
	* This library provide 2 Object serializeObj and parseStr that allow to transform a cyclic object into a string
	* and decode this string	
	* @author Bortolaso Mathieu
	* @email mathieu.bortolaso@gmail.com
	* @country France
	*/

	var MyArray = require('./Tab').default;

	/*****************************************************************************************/
	/***********Convert object into String, non enumerable properties are ignored ************/
	/*****************************************************************************************/
	var serializeObj = function(theMainObject){
		if(!(theMainObject instanceof Object)){
			throw "Please pass an object and not a primitive"
		}
		var allObj=[];
		function addSlashes(str){
			if (typeof str == "string"){
				str = str.replace(/\\/g,"\\\\").replace(/\'/g,"\\'").replace(/\"/g,"\\\"");
			}
			return str
		}
		
		//pseudo classe		
		var Reference = {
			isLinkedToMultipleObject:[],//true if linked to multipleObject			
			
			/**
			*	for each object that will be in the array, we need to know the number of previous
			*   object that will not be conserved in the array because they appear only once 
			*   so we don't need to create a reference
			*/
			calcultateNbOjectNotInTab : function(){
				var nbObjectNotInTab = Reference.nbObjectNotInTab = [0];
				for(var i=1; i<Reference.isLinkedToMultipleObject.length; i++){
					nbObjectNotInTab[i] = nbObjectNotInTab[i - 1]
					if (!Reference.isLinkedToMultipleObject[i]){
						nbObjectNotInTab[i]++;
					}
				}
			},
			
			/**
			*	create an instanceOf reference that has a ref property
			*	ref is the position in the array of the object
			*	note that the toString is automatically called on this object
			* 	when we do ".join('')" on an array that contains a Reference
			*/
			link:function(ref,alreadyLinked){
				var obj = Object.create(Reference.prototype);
				obj.ref = (ref != undefined) ? ref : allObj.length ;
				Reference.isLinkedToMultipleObject[ref]= alreadyLinked;
				return obj;
			},
			prototype:{			
				/**
				*	Called on ".join('')"
				*/
				toString:function(){
					if ( Reference.isLinkedToMultipleObject[this.ref]){
						var i = this.ref - Reference.nbObjectNotInTab[this.ref];
						return "'allObj["+i+"]'";
					}else{
						return allObj[this.ref].join("")
					}
				}
			}	
		}
		
		/**
		* transform an object to a json string
		*/
		function createStringArray(obj){
			if(obj.serializationName){
				obj.serializationName = obj.serializationName;// not useless __proto__ to object
			}else if(obj instanceof Array){
				obj.serializationName = "Array";
			}
			obj.bortoSerializeId = allObj.push(obj) - 1;
			var str = new MyArray("{");
			for(var i in obj){
				if (i != "bortoSerializeId" && obj.hasOwnProperty(i)){
					str.push(i,":");
					if(typeof obj[i] == "number" || obj[i] instanceof Function){
							str.push(obj[i]);
					}else if ( obj[i] instanceof Object){
						var alreadyLinked = obj[i].bortoSerializeId != undefined;
						str.push(Reference.link(obj[i].bortoSerializeId, alreadyLinked));
						if (!alreadyLinked){
							createStringArray(obj[i]);
						}
					}else{// it is a string
						str.push("'",addSlashes(obj[i]),"'");
					}					
					str.push(",\n");
				}
			}
			if(obj.length){// usefull for fake array that extend Array
				str.push('length:',obj.length,",\n")
			}
			str.last("}");//really good to remove the last comas
			allObj[obj.bortoSerializeId] = str;
		}
		function deleteMyid(obj){
			if(obj && obj.bortoSerializeId != undefined){
				delete obj.bortoSerializeId;
				for(var i in obj){
					if(obj.hasOwnProperty(i)){
						deleteMyid(obj[i]);
					}
				}
			}
		}

		createStringArray(theMainObject);
		deleteMyid(theMainObject);	
		Reference.calcultateNbOjectNotInTab();		
		for (var i in allObj){
			if(allObj.hasOwnProperty(i)){
				allObj[i] = allObj[i].join("");
			}
		}
		var toReturn = new MyArray;
		toReturn.push("[");
		for (var i = 0; i<allObj.length ;i++){
			if( i==0 || Reference.isLinkedToMultipleObject[i] ){
				toReturn.push(allObj[i],",");
			}
		}
		toReturn.last("]")
		return toReturn.join("");
	}


	/*****************************************************************************************/
	/************************************Str vers Objet************************************/
	/*****************************************************************************************/

		
	var parseStr = function(str,prototypes){
		var allObj;
		//function principal
		function parse(str){
			eval("allObj="+str);//we get an array from the string
			allObj = createInheritance(allObj)//replace object by object of the good prototype
			refToRealObject(allObj[0]);// we linked together objects
			clear(allObj[0]); // we remove useless properties
		}
		
		function refToRealObject(obj){
			function containAReference(obj,prop){
				return  prop && obj[prop] && obj[prop].indexOf && obj[prop].indexOf("allObj[") != -1 
			}
			obj.isLinked=true;
			for( var prop in obj){
				if(obj.hasOwnProperty(prop)){
					if (containAReference(obj,prop)){
						eval ("obj[prop]="+ obj[prop]);
					}
					if( obj[prop] instanceof Object && !obj[prop].isLinked){
						refToRealObject(obj[prop])
					}
				}
			}
		}
			
		/*
		* Replace all object by object of the good prototype in the array and in nested properties
		*/
		function createInheritance(unObj){
			if (unObj.inheritanceDone || !(unObj instanceof Object) ){
				return unObj;
			}	
			unObj.inheritanceDone = true;
			var newObj;
			if(unObj.serializationName == 'Array'){
				newObj = []
			}else{
				if(unObj.serializationName){
					newObj = Object.create(prototypes[unObj.serializationName])
				}else{
					newObj = {}
				}
			}
			// we copy information to newObj
			for (var i in unObj){
				if(unObj.hasOwnProperty(i)){
					newObj[i] = createInheritance(unObj[i])
				}
			}
			return newObj;
		}
	
		/**
		* remove properties that we use locally
		*/
		function clear(obj){
			if (!obj.isLinked){
				return;
			}
			delete obj.serializationName;
			delete obj.inheritanceDone;
			delete obj.isLinked;
			for(var i in obj){
				clear(obj[i])
			}
		}

		parse(str);
		return allObj[0];
	}

module.exports = {
	serializeObj: serializeObj,
	parseStr: parseStr
}