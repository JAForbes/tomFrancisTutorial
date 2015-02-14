var Keys = {}

;(function(){

	var name = function(e){
		return ({
			37: 'LEFT',
			38: 'UP',
			39: 'RIGHT',
			40: 'DOWN'
		})[e.keyCode] || String.fromCharCode(e.keyCode)
	}

	window.onkeydown = _.compose(
		function(name){
			Keys[name] = Keys[name] || 0
			Keys[name]++
		},
		name
	)
	window.onkeyup = _.compose(
		function(name){
			delete Keys[name]
		},
		name
	)
})()
