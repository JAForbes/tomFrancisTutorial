C({
	Screen: { width: 1, height: 1, el: document.querySelector('canvas'), con: document.querySelector('canvas').getContext('2d'), translate: [0.5, 0.5] }
})

player = C({
	Drawable: {},
	Location: {x:0,y:0},
	Velocity: {x:0,y:0},
	Dimensions: { width: 20, height: 20},
	Sprite: { image: s_player },
	KeyboardActivated: {
		'LEFT': {
			AddVelocity: { x: -0.1 }
		},
		'RIGHT': {
			AddVelocity: { x: 0.1 }
		},
		'UP': {
			AddVelocity: { y: -0.1 }
		},
		'DOWN': {
			AddVelocity: { y: 0.1 }
		}
	}
})

use = [
	'Screen',
	'KeyboardActivated',
	'AddVelocity',
	'Move',
	'Draw',
	'CleanUp'
]

loop = function(){
	use.map(function(system){
		systems[system]()
	})
	requestAnimationFrame(loop)
}

loop()
