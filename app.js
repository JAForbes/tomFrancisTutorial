sounds = {
	Reforming : [
		["synth",0.0000,1.0000,0.0950,0.6220,1.7520,1.0920,1119.0000,746.0000,428.0000,0.0720,-0.0620,0.4130,8.1203,-0.2701,0.2920,0.9860,0.4240,0.0585,-0.7420,0.2112,0.3900,-0.5940,0.0850,0.8560,0.5500,0.9370,0.4960]
	],
	Restore: [
		["sine",0.0000,1.0000,0.8380,0.0300,0.4380,0.6700,1957.0000,562.0000,1220.0000,0.4920,0.9640,0.0920,8.2643,-0.2298,-0.9880,-0.4860,0.0330,0.2745,0.7560,0.7584,-0.0560,-0.8100,0.3290,0.5600,0.6430,0.2780,-0.2140]
	],
	Splat:  [
		["noise",10.0000,0.07,0.0000,1.2680,0.5280,1.3660,546.0000,221.0000,2166.0000,-1.0000,-1.0000,0.2690,21.8934,0.2772,-0.0280,-0.7540,0.8800,0.4235,0.6480,0.3608,-0.1020,-0.1060,0.5740,0.3900,0.6340,0.2780,-0.0880]
	],
	Shoot: [
		//These should all be mutated sounds later
		["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480],
		["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480],
		["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]
	],
	Shrink: [
		["saw",1.0000,1.0000,0.2790,1.2060,0.9330,0.6520,766.0000,254.0000,756.0000,-0.6960,0.4760,0.8990,47.1842,0.7322,0.9640,-0.6320,0.1470,0.4095,-0.5640,0.6040,-0.9600,-0.1740,0.9710,0.4420,0.0470,0.6300,-0.9020]
	]
}
//initial sounds
_.each(sounds, function(samples, name){
	samples.forEach(function(sample,i){
		sounds[name][i] = jsfxlib.createWave(sample)
	})
})

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

	Player = {
		Angle: { value: 0 },
		Facing: { entity: mouse },
		Location: {x:10,y:14},
		Velocity: {x:0,y:0},
		Acceleration: { x:0 , y:0 },
		Friction: { value: 0.9 },
		Dimensions: { width: 32, height: 32},
		Sprite: { image: s_player },

		KickBack: {ratio: 0.5},
		Sounds: {
			Shoot: { sounds: sounds.Shoot },
			Splat: { sounds: sounds.Splat },
		},
		Is: {
			'Click|Key_SPACE': {
				Shoot: {
					component : {
						spawn_radius: 1.05,
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
							CollidesWith: {
								Remover: {
									Remove: {}
								}
							}
						}
					},
					every: 5
				}
			},
			'Key_A|Key_LEFT': {
				Accelerate: { component: {x: -1} }
			},
			'Key_D|Key_RIGHT': {
				Accelerate: { component: {x: 1} }
			},
			'Key_S|Key_DOWN': {
				Accelerate: { component: {y: 1} }
			},
			'Key_W|Key_UP': {
				Accelerate: { component: {y: -1} }
			},
			'@Collided': {
				Backup: { component: { omit: ['Splat','Remove','Collided']} },
				Remove: { component: {  omit: ['Backup','Splat'] } }
			}
		},
		CollidesWith: {
			Splatter: {
				Splat: { wave: { Reform: {} }, components: { Sprite: { image: s_splat } } }
			}
		},
		SAT: {},
	}
	Enemy = function(){
		var Enemy = {
			Angle: { value: 0},
			Facing: { entity: player},
			Location: { x: -200, y: 200},
			//Velocity: { x:_.random(2,4), y:_.random(2,4) },
			Velocity: { x:0, y:0 },
			Acceleration: { x:0 , y:0 },
			Speed: {value: 5},
			Dimensions: { width: 64, height: 64 },
			Sprite: { image: s_enemy },
			// BounceBox: { x:-300, y:-300, width: 600, height: 600 },
			SAT: {},
			CollidesWith: {
				Shrinker: {
					Shrink: {min_size: 32, ratio: 0.9 }
				}
			},
			Friction: { value: 0.01 },
			Repeat: {
				Patrol: {
					component: {
						waypoints: [
							{x:-200, y: -200},
							{x: 200 , y: -200 },
							{x: 200 , y: -200 },
							{x: 200 , y: 200 },
						]
					},
					remaining: Infinity
				}
			},
			Sounds: {
				Splat: { sounds: sounds.Splat },
				Shrink: {sounds: sounds.Shrink }
			},
			Is: {
				'@Delete' : {
					Spawn: {
						component: {
							points: [{x:0,y:0}],
							variation: 300
						}
					}
				}
			},
			Remover: {},
			Splatter: {}
		}

		//Spawn itself when it dies
		Enemy.Is['@Delete'].Spawn.component.components = Enemy
		//Ensure the spawned Enemy can spawn too
		Enemy.Is['@Delete'].Spawn.component.components = Enemy
		return Enemy
	}


	Exploding_Enemy = function(){
		return {
			Angle: { value: 0},
			Facing: { entity: mouse},
			Location: { x: _.random(-300, 300), y: _.random(-300, 300)},
			Velocity: { x:_.random(1,2), y:_.random(1,2) },

			Dimensions: { width: 64, height: 64 },
			Sprite: { image: s_exploding_enemy },
			BounceBox: { x:-300, y:-300, width: 600, height: 600 },
			SAT: {},
			CollidesWith: {
				Splatter: {
					Splat: {
						components: {
							Sprite: { image: s_exploding_enemy_splat },
							Repeat: {
								Shrink: {
									component: { min_size: 4, ratio: 0.96 },
									remaining: Infinity
								}
							},
						},
						velocity_range: [10,20]
					}

				}
			},
			Is: {
				'@Collided': {
					Remove: { component: {  omit: ['Splat'] } }
				}
			},
			Sounds: {
				Splat: { sounds: sounds.Splat }
			},
			Remover: {},
			Splatter: {}
		}
	}


	player = C(_.cloneDeep(Player))


	enemy = C(Enemy())
	exploding_enemy = C(Exploding_Enemy())
	exploding_enemy2 = C(Exploding_Enemy())


	use = [
		'Screen',
		'InfiniteBackground',
		'Mouse',
		'Translate',
		'CollidesWith',
		'SAT_sync',
		'SAT',
		'CategoryAge',
		'ComponentAge',
		'Patrol',
		'Waypoint',
		'Is',
		'Shoot',
		'KickBack',
		'Accelerate',
		'VelocitySyncedWithAngle',
		'BounceBox',
		'Facing',
		'Friction',
		'Move',
		'Stopped',
		'Camera',
		'Draw',
		'GarbageCollection',
		'Vulnerable',
		'Shrink',
		'Reform',
		'Splat',
		'Spawn',
		'Sounds',
		'Backup',
		'DeleteEntity',
		'RemoveEntity',
		'RemoveComponent',
		'QuickSave',
		'QuickLoad',
		'RemoveCategory',
		'Repeat',
		'Restore',

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
