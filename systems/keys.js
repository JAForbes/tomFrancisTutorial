//Keyboard keys
;(function(){

	var name = function(e){
		return ({
			32: 'SPACE',
			37: 'LEFT',
			38: 'UP',
			39: 'RIGHT',
			40: 'DOWN'
		})[e.keyCode] || String.fromCharCode(e.keyCode)
	}

	window.onkeydown = _.compose(
		function(name){
			C.components['Key_'+name] = C.components['Key_'+name] || {}
			C.components['Key_'+name][1] = C.components['Key_'+name][1] || {}
		},
		name
	)
	window.onkeyup = _.compose(
		function(name){
			delete C.components['Key_'+name]
		},
		name
	)
}());