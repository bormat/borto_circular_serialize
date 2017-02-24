# borto_circular_serialize
This NPM module allow circular reference between object contrary to JSON.stringify
I don't use JSON.stringify and JSON.parse internally so you can use it with old IE versions if your script is cliend side

Installation:
    npm install borto_circular_serialize
  
First of all import the module:
  	var obj = require('borto_circular_serialize'),
		serializeObj = obj.serializeObj,
		parseStr = obj.parseStr
	;
  
Or with ES6:
    import {serializeObj,parseStr} from 'borto_circular_serialize';

In order to save you cyclic object use serializeObj:

    var a = {b:25,c:6};
    a.d=a; //a contain himself at d position
    var stringBackup = serializeObj(a);
The content will be
	[{b:25,
	c:6,
	d:'allObj[0]'}]

As you can see when an element can not be stored because of circular references or multiple references to the same element, we replace it.

And to restore:
       
       var restoredObject = parseStr(b)

Sometimes you want keep the class of object you serialize.

Just add the property serializationName to your object or your class

	var theClass = function(){};
	theClass.prototype.serializationName = "theClass";
	var d = new theClass()
	/*	
	* or d.serializationName = "theClass"
	*/
	d.chaine = "Hello I am just a string"
	var encodeObj = serializeObj(d)

And to restore you have to pass the prototype that match with the serialization name as second argument

	var decodeObj = parseStr(encodeObj, {
		theClass:  theClass.prototype/*sameName that serializationName property*/
	});

You can send me your comment on github or on my email mathieu.bortolaso@gmail.com
