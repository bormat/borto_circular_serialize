	var should = require('chai').should(),
		obj = require('../index'),
		serializeObj = obj.serializeObj,
		parseStr = obj.parseStr
	;

	it('testCyclicObjet', function() {
		var a = {b:25,c:6};
		a.d=a;
		var b = serializeObj(a);
		var retCaseDep = parseStr(b)
		retCaseDep.b.should.equal(25);
		retCaseDep.c.should.equal(6);
		retCaseDep.d.d.d.d.d.d.d.d.d.should.equal(retCaseDep.d.d.d);
		retCaseDep.d.d.d.d.d.d.d.d.d.c.should.equal(6);
	})
	it( "testSerializeTabCyclic", function() {
		var e =[0,5,8];
		var d={c:[1,2,3],f:e};
		e[0]=d;
		var so = serializeObj(d)
		var retCaseDep = parseStr(so)
		retCaseDep.c[2].should.equal(3);
	});

	it( "testGuillemet", function() {
		var e =[0,5,8];
		var d={c:[1,2,3],f:e};
		e[0]="le planificat'heure";
		var retCaseDep = parseStr(serializeObj(d))
		retCaseDep.f[0].should.equal("le planificat'heure");
	});

	it('testSerializeChaine', function() {
		this.timeout(5000)
		var d = { chaine:"salut je suis une chaine"}
		var b = serializeObj(d);
		var retCaseDep = parseStr(b)
		retCaseDep.chaine.should.equal("salut je suis une chaine");
	});
	it("testPatternFactory", function(){
		var d={}
		var a = {b:25,c:6,enfant:d};
		d.papa=a;
		var b = serializeObj(a);
		var retCaseDep = parseStr(b)
		retCaseDep.b.should.equal(25);
		retCaseDep.enfant.papa.should.equal(retCaseDep);
	});

	it( "testGarderClass", function() {
		var theClass = function(){};
		theClass.prototype.serializationName = "theClass";
		var d = new theClass()
		/*	
		* or d.serializationName = "theClass"
		*/
		d.chaine = "salut je suis une chaine"
		var prototypes = {
			theClass:  theClass.prototype/*sameName that serializationName property*/
		}
		var retCaseDep;
		retCaseDep = parseStr(serializeObj(d), prototypes);
		(retCaseDep instanceof theClass).should.equal(true);
	})

	//Attention un tableau devient un objet crée votre propre objet tableau pour serialisation

	//juste pour le fun pas de tableau serialisé dans le projet
	it( "testVraiTabelau", function(  ) {
		var e =[0,5,8];
		var d={c:[1,2,3],f:e};
		e[0]=d;
		var retCaseDep = parseStr(serializeObj(d))
		retCaseDep.c.constructor.should.equal(Array);
		retCaseDep.c.length.should.equal(3);
	});

