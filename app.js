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
		Shoot: { component : {
			spawn_radius: 5,
			jitter: 0,
			size: 100,
			size_variation: 0,
			spread: 0,
			speed_range: [1,1],
			image: s_bullet,
			components: {
				GarbageCollected: {},
				SAT: {}
			}
		}, every: 25, count: 0 }
	},
	SAT: {},
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
	BounceBox: { x:-300, y:-300, width: 600, height: 600 },
	SAT: {}
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
	'SAT_sync',
	'SAT',
	'Collided',
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
