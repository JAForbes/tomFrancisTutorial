game = C({
	Screen: { width: 1, height: 1, el: document.querySelector('canvas'), con: document.querySelector('canvas').getContext('2d'), translate: [0.5, 0.5] },
	Camera: { tracking: 3 },
	Save: { state: {} },
	QuickSave: {},
	KeyboardActivated: {
		'Q' : { QuickSave:{} },
		'R' : { QuickLoad:{} }
	},
//	InfiniteBackground: { image: s_background }

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
			" " : {
				Shoot: {
					spawn_radius: 5,
					jitter: 0,
					size: 50,
					size_variation: 0,
					spread: 0,
					speed_range: [1,1],
					image: s_bullet,
					components: {
						GarbageCollected: {},
						SAT: {},
						ShrinkDamager: {},
						CollideActivated: {
							RemoveVulnerable: {}
						}
					}
				}
			}
		},
		KickBack: {strength: 5},
		Sounds: {
			Shoot: { sounds: [

				//These should all be mutated sounds later
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
				jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480])
			] }
		},
		ClickActivated: {
			Shoot: { component : {
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
					CollideActivated: {
						RemoveVulnerable: {}
					}
				}
			}, every: 5 }
		},
		CollidesWith: { types: ['Splatter','Remover'] } ,
		CollideActivated: {
			SplatVulnerable: { settings: {} },
			Remove: { settings: {} }
		},
		SAT: {},
	})


	enemy = C({
		Angle: { value: 0},
		Facing: { entity: player},
		Location: { x: _.random(-300, 300), y: _.random(-300, 300)},
		Velocity: { x:_.random(-0.5,0.5), y:_.random(-0.5,0.5) },

		Dimensions: { width: 64, height: 64 },
		Sprite: { image: s_enemy },
		GarbageCollected: {},
		BounceBox: { x:-300, y:-300, width: 600, height: 600 },
		SAT: {},
		CollidesWith: { types: ['Shrinker'] } ,
		CollideActivated: {
			ShrinkVulnerable: { settings: {min_size: 32, ratio: 0.9 }}
		},
		Remover: {},
		Splatter: {}
	})

	Enemy = _.cloneDeep(C(enemy))
	Enemy.RemoveActivated = {
		Spawn: {
			points: [{x:0,y:0}],
			variation: 300
		}
	}
	Enemy.RemoveActivated.Spawn.components = Enemy
	Enemy.RemoveActivated.Spawn.components = Enemy

	C('RemoveActivated',Enemy.RemoveActivated,enemy)

	use = [
		'Screen',
		'InfiniteBackground',
		'Mouse',
		'Translate',
		'ClickActivated',
		'KeyboardActivated',
		'Shoot',
		'KickBack',
		'AddVelocity',
		'VelocitySyncedWithAngle',
		'Facing',
		'BounceBox',
		'Move',
		'CollidesWith',
		'SAT_sync',
		'SAT',
		'Collided',
		'Friction',
		'Camera',
		'Draw',
		'GarbageCollection',
		'ShrinkVulnerable',
		'Shrink',
		'SplatVulnerable',
		'Splat',
		'RemoveVulnerable',
		'RemoveActivated',
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
