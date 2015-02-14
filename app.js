C({
	Screen: { width: 1, height: 1, el: document.querySelector('canvas'), con: document.querySelector('canvas').getContext('2d'), translate: [0.5, 0.5] }
})


room01 = function(){

player = C({
	Drawable: {},
	Location: {x:0,y:0},
	Velocity: {x:0,y:0},
	Dimensions: { width: 20, height: 20},
	Sprite: { image: s_player },
	KeyboardActivated: {
		'A|LEFT': {
			AddVelocity: { x: -0.1 }
		},
		'D|RIGHT': {
			AddVelocity: { x: 0.1 }
		},
		'W|UP': {
			AddVelocity: { y: -0.1 }
		},
		'S|DOWN': {
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

}

room01()

loop = function(){
	use.map(function(system){
		systems[system]()
	})
	requestAnimationFrame(loop)
}

loop()
