C({
	Screen: { width: 1, height: 1, el: document.querySelector('canvas'), con: document.querySelector('canvas').getContext('2d'), translate: [0.5, 0.5] }
})


room01 = function(){

mouse = C({
	Location: { x:0, y:0 },
	Translate: { x: -0.5, y: -0.5 },
	Mouse: {},
})

player = C({
	Drawable: {},
	Angle: { value: 0 },
	Facing: { entity: mouse },
	Location: {x:0,y:0},
	Velocity: {x:0,y:0},
	Friction: { value: 0 },
	Dimensions: { width: 32, height: 32},
	Sprite: { image: s_player },
	KeyboardActivated: {
		'A|LEFT': {
			AddVelocity: { x: -3 }
		},
		'D|RIGHT': {
			AddVelocity: { x: 3 }
		},
		'W|UP': {
			AddVelocity: { y: -3 }
		},
		'S|DOWN': {
			AddVelocity: { y: 3 }
		}
	}
})

use = [
	'Screen',
	'Mouse',
	'Translate',
	'KeyboardActivated',
	'AddVelocity',
	'Facing',
	'Move',
	'Friction',
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
