(function(){

	var uid = 0;

	var type = function(val){
		return ({}).toString.call(val).slice(8,-1)
	}

	var signature = function(){
		var sig = '';
		for(var i = 0; i < arguments.length; i++){
			var arg = arguments[i];
			sig +=type(arg).substring(0,3)
		}
		return sig
	}

	var extend = function(target,source){
		for(var key in source){
			target[key] = source[key]
		}
		return target
	}

	var addComponent = function(componentName, componentData, entity_id){
		entity_id = entity_id || uid++
		var category = (C.components[componentName] = C.components[componentName] || {})
		var current_component = category[entity_id] = category[entity_id] || {}

		extend(
			current_component,
			componentData
		)
		return entity_id
	}

	var addComponents = function(newComponents, entity_id){
		entity_id = entity_id || ++uid
		Object.keys(newComponents).forEach(function(componentName){
			addComponent(componentName, newComponents[componentName], entity_id)
		})
		return entity_id
	}

	var getEntityComponents = function(entity){
		var result = Object.keys(C.components)
		.reduce(function(entityComponents,componentName){
			var component = C.components[componentName][entity]
			if(component){
				entityComponents[componentName] = component
			}
			return entityComponents
		},{})

		return result;
	}

	var getAllComponents = function(){
		return C.components
	}

	var getComponentsOfType = function(type){
		return C.components[type] || {}
	}

	var getEntitityComponentsOfType = function(type,entity){
		return (C.components[type] || {})[entity] || {}
	}

	var deleteEntity = function(entity){
		return Object.keys(C.components)
			.forEach(function(categoryName){
				delete C.components[categoryName][entity]
			})
	}

	var routes = {
		"StrObjNum": addComponent,
		"StrObjStr": addComponent,
		"StrObj": addComponent,
		"Obj": addComponents,
		"ObjNum": addComponents,
		"ObjStr": addComponents,

		//todo could be confusing maybe id:4?
		"Str": getComponentsOfType,
		"Num": getEntityComponents,

		"StrNum": getEntitityComponentsOfType,
		"StrStr": getEntitityComponentsOfType,
		"": getAllComponents,
		"NumNul": deleteEntity,
		"StrNul": deleteEntity
	}

	C = function(){
		var sig = signature.apply(null,arguments)
		if( sig == 'Str' && arguments[0].length == 1 ){
			sig = 'Num'
		}
		var route = routes[sig]

		if(route){
			return route.apply(null,arguments)
		} else if (arguments.length > 1) {
			//allow for invalid extra arguments
			//e.g. NumNum becomes Num
			([]).pop.apply(arguments)
			return C.apply(null,arguments)
		} else {
			return sig + " is not a valid argument signature.";
		}
	}

	C = C.bind(C)
	C.components = {}


}())
