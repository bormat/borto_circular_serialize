# borto_circular_serialize
This NPM module allow circular reference between object contrary to JSON.stringify

Instalation:
  npm install borto_circular_serialize
  
  
First of all import the module:
  obj = require('../index'),
	serializeObjet = obj.serializeObjet,
	parseChaine = obj.parseChaine
  
 Or with ES6:
    import {serializeObjet,parseChaine} from 'borto_circular_serialize';

This is how to save an object as string:

    var a = {b:25,c:6};
    a.d=a; //a contain himself at d position
    var stringBackup = serializeObjet(a);
    
 And to restore:
 	
	var restoredObject = parseChaine(b)
