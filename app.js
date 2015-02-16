game = C({
	Screen: { width: 1, height: 1, el: document.querySelector('canvas'), con: document.querySelector('canvas').getContext('2d'), translate: [0.5, 0.5] },
	Camera: { tracking: 3 , last_position: {x:0, y:0 }},
	Save: { state: {} },
	QuickSave: {},
	Is: {
		'Key_Q': { QuickSave: { component: {} , every: Infinity }},
		'Key_R': { QuickLoad: { component: {} , every: Infinity }}
	},
	InfiniteBackground: { image: s_background }

})


room01 = function(){

	mouse = C({
		Location: { x:0, y:0 },
		Translate: { x: -0.5, y: -0.5 },
		Mouse: { game: game },
	})

	player = C({
		Angle: { value: 0 },
		Facing: { entity: mouse },
		Location: {x:10,y:14},
		Velocity: {x:0,y:0},
		Friction: { value: 0.4 },
		Dimensions: { width: 32, height: 32},
		Sprite: { image: s_player },

		KickBack: {strength: 5},
		Sounds: {
			Shoot: { sounds: [

				//These should all be mutated sounds later
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480])
			] }
		},
		Is: {
			'Click|Key_SPACE': {
				Shoot: {
					component : {
						spawn_radius: 0,
						jitter: 0,
						size: 15,
						size_variation: 5,
						spread: 0.3,
						speed_range: [30,30],
						image: s_bullet,
						components: {
							GarbageCollected: {},
							SAT: {},
							Shrinker: {},
							CollidesWith: { types: ['Remover'] },
							Is: {
								'@Collided': {
									RemoveVulnerable: { component: {}, every: 1}
								}
							}
						}
					},
					every: 5
				}
			},
			'Key_A|Key_LEFT': {
				AddVelocity: { component: {x: -3}, every: 1 }
			},
			'Key_D|Key_RIGHT': {
				AddVelocity: { component: {x: 3}, every: 1 }
			},
			'Key_S|Key_DOWN': {
				AddVelocity: { component: {y: 3}, every: 1 }
			},
			'Key_W|Key_UP': {
				AddVelocity: { component: {y: -3}, every: 1 }
			},
			'@Collided': {
				SplatVulnerable: { component: { settings:{} }, every: 1 },
				Remove: { component: { settings:{} }, every: 1 }
			}
		},
		CollidesWith: { types: ['Splatter','Remover'] } ,
		SAT: {},
	})


	enemy = C({
		Angle: { value: 0},
		Facing: { entity: player},
		Location: { x: _.random(-300, 300), y: _.random(-300, 300)},
		Velocity: { x:_.random(-0.5,0.5), y:_.random(-0.5,0.5) },

		Dimensions: { width: 64, height: 64 },
		Sprite: { image: s_enemy },
		BounceBox: { x:-300, y:-300, width: 600, height: 600 },
		SAT: {},
		CollidesWith: { types: ['Shrinker'] } ,
		Is: {
			'@Collided': {
				ShrinkVulnerable: { component: { settings: {min_size: 32, ratio: 0.9 }}, every: 1 },
				Spawn: {
					component: {
						points: [{x:0,y:0}],
						variation: 300
					},
					every: 1
				}
			}
		},
		Remover: {},
		Splatter: {}
	})

	Enemy = _.cloneDeep(C(enemy))
	Enemy.Is['@Collided'].Spawn.component.components = Enemy
	Enemy.Is['@Collided'].Spawn.component.components = Enemy

	C('Is',Enemy.Is,enemy)

	use = [
		'Screen',
		'InfiniteBackground',
		'Mouse',
		'Translate',
		'CollidesWith',
		'SAT_sync',
		'SAT',
		'Age',
		'Is',
		'Shoot',
		'KickBack',
		'AddVelocity',
		'VelocitySyncedWithAngle',
		'Facing',
		'BounceBox',
		'Move',
		'Friction',
		'Camera',
		'Draw',
		'GarbageCollection',
		'ShrinkVulnerable',
		'Shrink',
		'SplatVulnerable',
		'Splat',
		'RemoveVulnerable',
		'Spawn',
		'Sounds',
		'Remove',
		'QuickSave',
		'QuickLoad',
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
