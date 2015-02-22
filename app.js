sounds = {
	Reforming : [
		jsfxlib.createWave(["synth",16.0000,0.5420,0.8450,0.5180,2.6400,0.4900,2353.0000,1843.0000,1962.0000,-0.1740,0.8200,1.0000,42.5771,1.0000,1.0000,-1.0000,0.4490,0.0000,-1.0000,0.0000,0.2300,0.6240,1.0000,1.0000,1.0000,1.0000,1.0000])
	],
	Restore: [
		jsfxlib.createWave(["square",16.0000,0.5420,0.0940,0.8460,0.6570,1.3100,587.0000,359.0000,1917.0000,0.6440,-0.6160,0.2640,30.3877,0.4618,-0.5920,0.9720,0.9970,0.2880,-0.9520,0.6136,-0.1720,-0.7860,0.7290,0.1460,0.4030,0.5730,0.6320])
	],
	Splat:  [
		jsfxlib.createWave(["noise",10.0000,1.0000,0.0000,1.2680,0.5280,1.3660,546.0000,221.0000,2166.0000,-1.0000,-1.0000,0.2690,21.8934,0.2772,-0.0280,-0.7540,0.8800,0.4235,0.6480,0.3608,-0.1020,-0.1060,0.5740,0.3900,0.6340,0.2780,-0.0880])
	],
	Shoot: [
		//These should all be mutated sounds later
		jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
		jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480]),
		jsfxlib.createWave(["noise",0.0000,0.4000,0.0110,1.3740,1.4400,0.0280,1067.0000,2034.0000,1153.0000,-0.6000,-0.5940,0.1450,38.8819,0.4137,0.1980,0.2020,0.2840,0.0870,0.0020,0.2624,-0.6940,-0.3000,0.3290,-0.7060,0.5310,0.3300,-0.4480])
	],
	Shrink: [
		jsfxlib.createWave(["saw",1.0000,1.0000,0.2790,1.2060,0.9330,0.6520,766.0000,254.0000,756.0000,-0.6960,0.4760,0.8990,47.1842,0.7322,0.9640,-0.6320,0.1470,0.4095,-0.5640,0.6040,-0.9600,-0.1740,0.9710,0.4420,0.0470,0.6300,-0.9020])
	]
}


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
			Splat: { sounds: sounds.Splat }
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
							CollidesWith: { types: ['Remover'] },
							Is: {
								'@Collided': {
									RemoveVulnerable: { component: {}}
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
				SplatVulnerable: {
					component: {
						settings:{
							wave: {
								Reform: {},
								Sounds: {
									Reforming: {
										sounds: [
											jsfxlib.createWave(["synth",16.0000,0.5420,0.8450,0.5180,2.6400,0.4900,2353.0000,1843.0000,1962.0000,-0.1740,0.8200,1.0000,42.5771,1.0000,1.0000,-1.0000,0.4490,0.0000,-1.0000,0.0000,0.2300,0.6240,1.0000,1.0000,1.0000,1.0000,1.0000])
										],
										every: Infinity
									}
								}
							},
							components: {
								Sprite: { image: s_splat }
							}
						}
					}
				},
				Backup: { component: { omit: ['Splat', 'SplatVulnerable', 'Remove', 'Collided']} },
				Remove: { component: {  omit: ['Backup','Splat'] } }
			}
		},
		CollidesWith: { types: ['Splatter','Remover'] } ,
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
			CollidesWith: { types: ['Shrinker'] },
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
				'@Collided': {
					ShrinkVulnerable: { component: { settings: {min_size: 32, ratio: 0.9 }} },
				},
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
			CollidesWith: { types: ['Splatter'] } ,
			Is: {
				'@Collided': {
					//Create SplatVulnerable when you have collided
					SplatVulnerable: {
						//the component data for SplatVulnerable
						component: {
							//The future instance variables for splat, in this case just `settings`
							settings:{
								//Some components to add to the splat part
								components: {
									Sprite: { image: s_exploding_enemy_splat },
									Is: {
										'@Is': {
											Shrink: { component: { min_size: 4, ratio: 0.96 }}
										},
									},

								},
								velocity_range: [10,20]
							}
						}
					},
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
		'ShrinkVulnerable',
		'Shrink',
		'Reform',
		'SplatVulnerable',
		'Splat',
		'RemoveVulnerable',
		'Spawn',
		'Sounds',
		'Backup',
		'Log',
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
