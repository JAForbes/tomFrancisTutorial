/*
	Entity Manager

	This is a new functional API

	`E('Position')`
	returns an underscore wrapped array of Position components

	`E('Position',3)`
	returns the Position component of entity:3.  Else returns {}

	`E(1,'Movement',{vx:0,vy:0})`
	adds a Movement component to the entity: 1

	```
	E({
	  Movement: {...},
	  Position: {...}
	})
	```
	Creates multiple components and attaches them to a new entity.
	Returns the new entity id

	E(<id>,{
	  Movement: {...},
	  Position: {...},
	})
	```

	Mixins in multiple components to an existing entity.


	```
	E(<id>)
	```

	Returns a hash of all components that Entity owns.

	`E()`
	Overrides the API and gives you access to the internal components hash

	Allows you to delete component arrays and individual components


	`delete E().Position[1]`
	Deletes entity 1's position component

	```
	Deletes all Position components
	delete E().Position
	```
*/

var isNode = typeof require != 'undefined';

if(isNode){
	var _ = require('underscore')
}

E = (function(){

	var components = {};
	function type(o){
		var type = ({}).toString.call(o).slice(8,-1)
		return (type == 'String' && !isNaN(o*1)) && 'Number' || type;
	}

	function create(components,uid){
		var uid = uid || _.uniqueId();

		_(components).each(function(component,componentName){
			add(uid,componentName,component);
		},this)

		return uid;
	}

	function add(uid, componentName, component){
		({
			Object: addMultiple,
			String: addOne
		}[type(componentName)]).apply(null,arguments)
	}

	function addOne(uid,componentName,component){
		var current = get(component,uid)
		components[componentName] = components[componentName] || {}

		components[componentName][uid] =  _.extend(current,component)
	}

	function addMultiple(uid,components){
		return create(components,uid);
	}

	function get(componentName,entity){
		if(entity){
			return getOne.apply(null,arguments)
		} else {
			return getAll.apply(null,arguments)
		}

		function getAll(componentName){
			var result = components[componentName];
			if(result){
				return _(result)
			} else {
				return _([])
			}
		}

		function getOne(componentName,entity){
			var result = components[componentName];
			if(result && result[entity]){
				return result[entity];
			} else {
				return {}
			}
		}
	}

	function entityGrouped(id){
		return _.reduce(E(),function(result,group,groupName){
		  var owned = group[id];
		  owned && (result[groupName] = owned);
		  return result;
		},{})
	}

	function router(query){
		var _type = type(query);
		var argLength = arguments.length;
		if (_type == 'Object'){
			return create.apply(null,arguments)
		} else if (_type == 'Number' && arguments.length > 1) {
			return add.apply(null,arguments)
		} else if (_type == 'Number' ) {
			return entityGrouped.apply(null,arguments)
		} else if (_type == 'String') {
			return get.apply(null,arguments)
		} else if (_type == 'Undefined') {
			return components
		}
	}

	return router;
})();

if(isNode){
	module.exports = E;
}
