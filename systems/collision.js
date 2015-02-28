//Separating Axis Theorem - Collision Detection
systems.SAT = function(){
	var processed = {}
	_.each(C('CollidesWith'), function(collidesWith,a){
	_.each(collidesWith.entities, function(relevant,b){
		if( a != b && !processed[a+':'+b]) {
			processed[b+':'+a] = true
			var satA = C('SAT',a)
			var satB = C('SAT',b)
			var response = new SAT.Response()
			var collided = SAT.testPolygonPolygon(
				satA.box.toPolygon(),
				satB.box.toPolygon(),
				response
			) && response

			if(collided){

				var aCollided = C('Collided',a)
				;(aCollided.collisions = aCollided.collisions || {})[b] = { response: response }
				;(C.components.Collided = C.components.Collided || {})[a] = aCollided


				var bCaresAbout = C('CollidesWith',b) || { entities: {}}
				var bCaresAboutA = bCaresAbout.entities[a]
				if( bCaresAboutA ){
					var bCollided = C('Collided',b)
					;(C.components.Collided = C.components.Collided || {})[b] = bCollided
					;(bCollided.collisions = bCollided.collisions || {})[a] = {}
				}
			}
		}
	})
	})
	if( C.components.Collided ) {
		C('RemoveCategory',{name: 'Collided'})
	}
}


systems.SAT_sync = function(){
	_.each(C('SAT'),function(sat,id){

		sat.box = new SAT.Box()

		var d = C('Dimensions',id)

		sat.box.pos = C('Location',id)
		sat.box.w = d.width
		sat.box.h = d.height
	})
}

/*
	Creates a list of entities that are relevant to collision detection.

	Based on the types specified in the CollidesWith component
*/
systems.CollidesWith = function(){

	_.each(C('CollidesWith'), function(collidesWith, id){

		collidesWith.entities = {}
		relevant = collidesWith.entities

		_.each(collidesWith, function(componentsToAdd,threatName){
			_.each(C(threatName), function( component, against_id){
				relevant[against_id] = true
			})
			return relevant;
		})
	})
}

//Adds components to an entity, if it has collided with a particular type.
//The types are specified in CollidesWith

systems.Vulnerable = function(){

	var triggerCollisionComponents = function(entity_id, against_id, componentsToAdd, against_type){
		if(against_type == 'entities') return;

		var collidedWithThreat = C.components[against_type] && C.components[against_type][against_id]
	 	if(collidedWithThreat){
	 		_.each(componentsToAdd, function(component, componentName){
				C(componentName,component,entity_id)
			})
	 	}
	}


	_.each(C('Collided'), function(collided,id){
		_.each(collided.collisions, function(collision, against){
			var trigger = triggerCollisionComponents.bind(null, id, against)
			 _.each(C('CollidesWith',id), trigger )
		})
	})
}