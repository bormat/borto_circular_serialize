	/*Ce module peut être utilisé à part pour sérialiser n'importe quel objet, chaine, nombre, tableau
	une option, un type manquant bormat2@gmail.com  by Bortolaso Mathieu
	open source avec obligation de garder cet entête*/	
	
	/*****************************************************************************************/
	/************************Objet et contenu enumerable vers Chaine**************************/
	/*****************************************************************************************/
	var Tab = require('./Tab').default;
	var serializeObjet = function(theMainObject){
		if(!(theMainObject instanceof Object)){
			throw "veuillez passer un objet et non un type primitif"
		}
		var tab=[];
		function addSlashes(ch){
			if (typeof ch == "string"){
				ch = ch.replace(/\\/g,"\\\\").replace(/\'/g,"\\'").replace(/\"/g,"\\\"");
			}
			return ch
		}
		
		//pseudo classe		
		var Reference = {
			tabDejaLier:[],//pour chaque id  true si referrencé pls fois sinon false
			
			//tabNbSupp pour chaque id le nombre d'objet non afficher au position précédente
			calculerTabNbSupp : function(){
				var tabNbSupp = Reference.tabNbSupp = [0];
				for(var i=1; i<Reference.tabDejaLier.length; i++){
					tabNbSupp[i] = tabNbSupp[i - 1]
					if (!Reference.tabDejaLier[i]){
						tabNbSupp[i]++;
					}
				}
			},
			//constructeur
			lier:function(ref,dejalier){
				var obj = Object.create(Reference.prototype);
				obj.ref = (ref != undefined) ? ref : tab.length ;
				Reference.tabDejaLier[ref]=Boolean(dejalier);
				return obj;
			},
			prototype:{			
				toString:function(){
					if ( Reference.tabDejaLier[this.ref]){
						var i = this.ref - Reference.tabNbSupp[this.ref];
						return "'tab["+i+"]'";
					}else{
						return tab[this.ref].join("")
					}
				}
			}	
		}
		
		function genererTableauDeChaine(obj){
			if(obj.serializationName){
				obj.serializationName = obj.serializationName;// ceci n'est pas inutile __proto__ vers objet
			}else if(obj instanceof Array){
				obj.serializationName = "Array"; //non utilisé dans notre code mais autant faire une bibliotèque complète
			}
			obj.myid = tab.push(obj) - 1;
			var chaine = new Tab("{");
			for(var i in obj){
				if (i != "myid" && obj.hasOwnProperty(i)){
					chaine.push(i,":");
					if(typeof obj[i] == "number" || obj[i] instanceof Function){
							chaine.push(obj[i]);
					}else if ( obj[i] instanceof Object){
						var dejaLier = obj[i].myid != undefined;
						chaine.push(Reference.lier(obj[i].myid, dejaLier));
						if (!dejaLier){
							genererTableauDeChaine(obj[i]);
						}
					}else{
						chaine.push("'",addSlashes(obj[i]),"'");
					}					
					chaine.push(",\n");
				}
			}
			chaine.last("}");//que c'est beau last pour écraser les virgules
			tab[obj.myid] = chaine;
		}
		function deleteMyid(obj){
			if(obj && obj.myid != undefined){
				delete obj.myid;
				for(var i in obj){
					if(obj.hasOwnProperty(i)){
							deleteMyid(obj[i]);
					}
				}
			}
		}

		genererTableauDeChaine(theMainObject);
		deleteMyid(theMainObject);	
		Reference.calculerTabNbSupp();		
		for (var i in tab){
			tab[i] = tab[i].join("");
		}
		tab.toString=function(){
			var toReturn = new Tab;
			toReturn.push("[");
			for (var i = 0; i<tab.length ;i++){
				if( i==0 || Reference.tabDejaLier[i] ){
					toReturn.push(tab[i],",");
				}
			}
			toReturn.last("]")
			return toReturn.join("");
		}
	
		return ""+tab;
	}


	/*****************************************************************************************/
	/************************************Chaine vers Objet************************************/
	/*****************************************************************************************/

		
	var parseChaine = function(chaine,prototypes){
		
		//function principal
		function parse(chaine){
			eval("tab="+chaine);
			tab = genererHeritage2(tab)	
			relierRef(tab[0]);
			nettoyage(tab[0]);
		}
		
		function relierRef(obj){
			obj.relier=true;
			for( var prop in obj){
				if(obj.hasOwnProperty(prop)){
					if (contientUneRef(obj,prop)){
						eval ("obj[prop]="+ obj[prop]);
					}
					if( obj[prop] instanceof Object && !obj[prop].relier){
						relierRef(obj[prop])
					}
				}
			}
		}
			
		function contientUneRef(obj,prop){
			return  prop && obj[prop] && obj[prop].indexOf && obj[prop].indexOf("tab[") != -1 
		}
		
		function genererHeritage2(unObj){
			if (unObj.heritageFait || !(unObj instanceof Object) ){
				//unObj.heritageFait=false;
				return unObj;
			}	
			unObj.heritageFait=true;
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

			// on remmet les infos
			for (var i in unObj){
				newObj[i] = genererHeritage2(unObj[i]);
			}
			return newObj;
		}
	
		function nettoyage(obj){
			if (!obj.relier){
				return;
			}
			delete obj.serializationName;
			delete obj.heritageFait;
			delete obj.relier;
			for(var i in obj){
				nettoyage(obj[i])
			}
		}
		
		var tab;
		parse(chaine);
		return tab[0];
	}

module.exports = {
	serializeObjet: serializeObjet,
	parseChaine: parseChaine
}