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
	Angle: { value: 0 },
	Facing: { entity: mouse },
	Location: {x:0,y:0},
	Velocity: {x:0,y:0},
	Friction: { value: 0.4 },
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
		},
	},
	ClickActivated: {
		Shoot: { component : {}, every: 20, count: 0 }
	},
	Collideable: {},
	GarbageCollected: {}
})

enemy = C({
	Angle: { value: 0},
	Facing: { entity: player},
	Location: { x: _.random(-300, 300), y: _.random(-300, 300)},
	Velocity: { x:_.random(-2,2), y:_.random(-2,2) },

	Dimensions: { width: 64, height: 64 },
	Sprite: { image: s_enemy },
	GarbageCollected: {},
	BounceBox: { x:-400, y:-400, width: 800, height: 800 },
	Collideable: {}
})

use = [
	'Screen',
	'Mouse',
	'Translate',
	'ClickActivated',
	'KeyboardActivated',
	'Shoot',
	'AddVelocity',
	'VelocitySyncedWithAngle',
	'Facing',
	'BounceBox',
	'Move',
//	'Collideable',
//	'Collided',
	'Friction',
	'Draw',
	'GarbageCollection',
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
