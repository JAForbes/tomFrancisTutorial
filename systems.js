systems = {
	Screen: function(){
		_.each(C('Screen'),function(screen,id){
			screen.el.width = window.innerWidth * screen.width
			screen.el.height = window.innerHeight * screen.height

			screen.con.translate(screen.translate[0] * window.innerWidth,screen.translate[0] *window.innerHeight)

			if(!screen.smoothing){
				;['','moz','ms','webkit'].map(function(prefix){
					screen.con[prefix+"ImageSmoothingEnabled"] = false
				})
			}
		})
	},

	InfiniteBackground: function(){
		_.each(C('InfiniteBackground'), function(bg,id){
			var screen = C('Screen',id)

			var focus = C('Camera',id).last_position

			screen.con.save()
			screen.con.translate(-focus.x,-focus.y)
			var ptrn = screen.con.createPattern(bg.image,'repeat');
			screen.con.fillStyle = ptrn;
			var w = screen.el.width
			var h = screen.el.height
			var x = focus.x -w/2
			var y = focus.y -h/2
			screen.con.fillRect(x,y,w,h);
			screen.con.restore()

		})
	},

	Click: function(){
		var click;
		window.onmousedown = function(e){
			C('Click',{ down: true })
		}
		window.onmouseup = function(e){
			delete C.components.Click
		}
	},

	KeyboardActivated: function(){
		_.each(C('KeyboardActivated'),function(kb,id){
			_.each(kb,function(componentsToActivate, keyNames){
				keyNames.split('|').map(function(keyName){
					if(Keys[keyName]){
						_.each(componentsToActivate,function(component,componentName){
							C(componentName,component,id)
						})
					}
				})
			})
		})
	},

	Mouse: (function(){
		var mouse = {x:0,y:0}
		window.onmousemove = function(e){
			mouse.x = e.clientX
			mouse.y = e.clientY
		}
		return function(){
			_.each(C('Mouse'),function(synced,id){
				var p = C('Location',id)
				var camera = C('Camera',synced.game).last_position

				p.x = mouse.x + camera.x
				p.y = mouse.y + camera.y
			})
		}
	}()),

	Translate: function(){
		var screenDim = C('Screen',1).el

		_.each(C('Translate'),function(translate,id){
			var p = C('Location',id)

			p.x = p.x + (translate.x || 0) * screenDim.width
			p.y = p.y + (translate.y || 0) * screenDim.height
		})
	},

	AddVelocity: function(){
		_.each(C('AddVelocity'),function(add,id){
			var v = C('Velocity',id)
			v.x += add.x || 0
			v.y += add.y || 0
		})
	},

	VelocitySyncedWithAngle: function(){
		_.each( C('VelocitySyncedWithAngle'), function(synced, id){
			var v = C('Velocity',id)
			var a = C('Angle',id).value
			var speed = C('Speed',id).value
			v.x = Math.cos(a) * speed
			v.y = Math.sin(a) * speed
		})
	},

	Move: function(){
		_.each(C('Velocity'),function(v,id){
			var p = C('Location',id);
			p.x += v.x || 0
			p.y += v.y || 0
		})
	},

	Friction: function(){
		_.each(C('Friction'),function(friction,id){
			var v = C('Velocity',id)
			v.x *= friction.value
			v.y *= friction.value
		})
	},

	Facing: function(){
		_.each(C('Facing'),function(facing,id){
			var other = C('Location',facing.entity)
			var p = C('Location',id)
			//console.log(other,p)
			C('Angle',id).value = Math.atan2(other.y-p.y, other.x-p.x)
		})
	},

	Draw: function(){
		var canvas = C('Screen',1).el
		var con = canvas.getContext('2d')

		_.each(C('Sprite'),function(sprite,id){
			var p = C('Location',id)
			var d = C('Dimensions',id)
			var angle = C('Angle',id).value

			con.save()
			con.translate(p.x,p.y)
			con.rotate(angle)
			con.drawImage(
				sprite.image,
				0-d.width/2,
				0-d.height/2,
				d.width, d.height
			)
			con.restore()

		})
	},

	CollidesWith: function(){
		_.each(C('CollidesWith'), function(collidesWith, id){
			collidesWith.types.reduce(function(relevant,componentName){
				Object.keys(C.components[componentName] || {}).map(function(id){
					relevant[id] = true
				})
				return relevant;
			},(collidesWith.entities = {}) )

		})
	},

	SAT: function(){
		var processed = {}
		_.each(C('CollidesWith'), function(collidesWith,a){
		_.each(collidesWith.entities, function(relevant,b){
			if( a != b && !processed[a+':'+b]) {
				processed[b+':'+a] = true
				var satA = C('SAT',a)
				var satB = C('SAT',b)
				var response = new SAT.Response()
				var collided = SAT.testPolygonPolygon(
					satA.box.toPolygon(),
					satB.box.toPolygon(),
					response
				) && response

				if(collided){

					var aCollided = C('Collided',a)
					;(aCollided.collisions = aCollided.collisions || {})[b] = { response: response }
					;(C.components.Collided = C.components.Collided || {})[a] = aCollided


					var bCaresAbout = C('CollidesWith',b) || { entities: {}}
					var bCaresAboutA = bCaresAbout.entities[a]
					if( bCaresAboutA ){
						var bCollided = C('Collided',b)
						;(C.components.Collided = C.components.Collided || {})[b] = bCollided
						;(bCollided.collisions = bCollided.collisions || {})[a] = {}
					}
				}
			}
		})
		})
	},

	Collided: function(){
		_.each(C('Collided'),function(collided,id){
			_.each(collided.collisions, function(collision, against){
				_.each(C('CollideActivated',id),function(component,componentName){
					C(componentName,component,id)
				})
			})
		})
	},

	Camera: function(){
		_.each( C('Camera'), function(camera, id){
			var track_position = C('Location',camera.tracking)

			track_position = (track_position.x || track_position.y) && track_position ||
				camera.last_position || {x:0, y: 0}

			var screen = C('Screen',id)

			screen.con.translate(-track_position.x,-track_position.y)
			camera.last_position = track_position;
		})
	},

	Spawn: function(){
		_.each(C('Spawn'), function(spawn,id){

			var spawned = C(spawn.components)
			var spawn_point = _.sample(spawn.points)
			spawn_point.x += _.random(-spawn.variation,spawn.variation)
			spawn_point.y += _.random(-spawn.variation,spawn.variation)
			C({
				Location: { x: spawn_point.x, y: spawn_point.y }
			},spawned)
		})
	},

	SplatVulnerable: function(){
		_.each( C('SplatVulnerable'), function(vulnerable,id){
			_.each(C('Collided',id).collisions, function(collision,against){
				if( C.components.Splatter[against] ) {
					C('Splat',vulnerable.settings,id)
				}
			})
		})
	},

	Age: function(){
		if( !C.components.Age ){
			C.components.Age = {}
		}

		for( var key in C.components ){
			C.components.Age[key] = C.components.Age[key] || 0
			C.components.Age[key]++
		}
		for( var key in C.components.Age ){
			if( !C.components[key]) {
				delete C.components.Age[key]
			}
		}
	},

	// If something exists globally add some components to your self
	Is: function(){
		var Age = C.components.Age
		var initial = 1

		_.each( C('Is') , function(is, id){

			_.each(is, function(components, isName){
				if( C.components[isName] ){

					var age = Age[isName]

					_.each( components, function(settings, componentName){
						if( (age-initial) % settings.every == 0){

							C(componentName, settings.component, id)
						}
					})

				}
			})
		})
	},

	// If something exists on your self, add some components to your self
	Has: function(){

	},

	// Add some components to yourself after a designated number of cycles
	After: function(){

	},

	Splat: function(){
		_.each( C('Splat') , function(splat, id){
			var bits = 10;
			var start = C('Location',id)
			for( var bitsSoFar = 0; bitsSoFar < bits; bitsSoFar++ ){

				var angle = (2 * Math.PI / bits) * bitsSoFar + _.random(-0.3, 0.3);

				var splat = C({
					Location: { x: start.x , y: start.y },
					Sprite: { image: s_splat },
					Dimensions: { width: 16, height: 16 },
					Angle: { value: angle },
					Velocity: { x: Math.cos(angle) * _.random(10,15), y: Math.sin(angle) * _.random(10,15)},
					GarbageCollected: {},
					Friction: { value : 0.963 },
					Reform: { to: start, after: 10, count: 0 },
					On: {
						Reformed: {
							Remove: {}
						}
					}
				})

			}
		})
	},

	RemoveVulnerable: function(){
		_.each(C('RemoveVulnerable'),function(vulnerable,id){

			_.each(C('Collided',id).collisions, function(collision,against){
				if( C.components.Remover[against] ) {
					C('Remove',{},id)
				}

			})
		})
	},

	ShrinkVulnerable: function(){
		_.each(C('ShrinkVulnerable'),function(vulnerable,id){

			_.each(C('Collided',id).collisions, function(collision,against){
				if( C.components.Shrinker[against] ) {
					C('Shrink',vulnerable.settings,id)
				}

			})
		})
	},

	Shrink: function(){
		_.each(C('Shrink'), function(shrink, id){
			var d = C('Dimensions',id)
			d.width *= shrink.ratio
			d.height *= shrink.ratio
			if(d.width < shrink.min_size || d.height < shrink.min_size){
				C('Remove',{},id)
			}
		})
	},

	Remove: function(){
		_.each(C('Remove'), function(remove,id){
			C(id,null)
		})
	},

	RemoveActivated: function(){
		_.each(C('Remove'),function(remove,id){
			var activated = C('RemoveActivated',id)
			!_.isEmpty(activated) && _.each(activated,function(component,componentName){

				C(componentName,component,id)

			})
		})
	},

	QuickSave: function(){
		_.each(C('QuickSave'), function(qSave,id){

			C('Save',id).state = _(C()).cloneDeep()
		})
	},

	QuickLoad: function(){
		_.each(C('QuickLoad'), function(qLoad,id){
			var save = C('Save',id).state

			if( !_.isEmpty(save) ){
				C.components = _.cloneDeep(save)
				C.components['Save'][id].state = save
			}

		})
	},

	GarbageCollection: function(){
		var screen = C('Screen',1)
		var canvas = screen.el
		_.each(C('GarbageCollected'),function(gc, id){
			var camera = _.sample(C('Camera')).last_position

			var p = C('Location',id)
			if( Math.abs(p.x-camera.x) > canvas.width *screen.translate[0] || Math.abs(p.y-camera.y) > canvas.height * screen.translate[1]){
				C('Remove',{},id)
			}
		})
	},

	Shoot: function(){
		_.each(C('Shoot'),function(shoot,id){
			var p = C('Location',id)
			var size = shoot.size + _.random(-shoot.size_variation,shoot.size_variation)
			var angle = _.clone( C('Angle',id)).value
			var bullet = C({
				Location: {x: p.x + _.random(-shoot.jitter,shoot.jitter), y: p.y + _.random(-shoot.jitter,shoot.jitter) },
				Angle: { value: angle + _.random(shoot.spread * -1, shoot.spread * 1)},
				Sprite: { image: shoot.image },
				Dimensions: { width: size, height: size },
				Velocity: { x: 0, y: 0 },
				VelocitySyncedWithAngle: {},
				Speed: { value: _.random(shoot.speed_range[0],shoot.speed_range[1]) },
			})

			systems.VelocitySyncedWithAngle()
			C(shoot.components,bullet)
			//spawn bullet ahead of player
			var p = C('Location',bullet)
			var v = C('Velocity', bullet)

			p.x += v.x * shoot.spawn_radius
			p.y += v.y * shoot.spawn_radius
		})
	},

	KickBack: function(){
		_.each(C('Shoot'),function(shoot,id){
			var kickBack = C('KickBack',id)
			if(kickBack.strength){
				var v = C('Velocity',id)
				var angle = -C('Angle',id).value
				v.x += -Math.cos(angle) * shoot.size + _.random(-shoot.size_variation,shoot.size_variation)
				v.y += Math.sin(angle) * shoot.size + _.random(-shoot.size_variation,shoot.size_variation)
			}
		})
	},

	SAT_sync: function(){
		_.each(C('SAT'),function(sat,id){

			sat.box = new SAT.Box()

			var d = C('Dimensions',id)

			sat.box.pos = C('Location',id)
			sat.box.w = d.width
			sat.box.h = d.height
		})
	},

	BounceBox: function(){
		_.each(C('BounceBox'),function(bb,id){
			var p = C('Location',id)
			var d = C('Dimensions',id)
			var v = C('Velocity',id)


			if(	p.x + d.width/2 > bb.x + bb.width || p.x - d.width/2 < bb.x ){
				v.x *= -1
			}
			if(p.y + d.height/2 > bb.y + bb.height || p.y - d.height/2 < bb.y ) {
				v.y *= -1
			}
		})
	},

	Sounds: function(){
		_.each(C('Sounds'),function(sounds,id){
			_.each(sounds, function(sound, componentName){
				var category = C.components[componentName]
				var component = category && category[id]
				if( component ) {
					var sounds = sound.sounds.filter(function(snd){
						return snd.paused
					})
					if(!sounds.length){
						sounds = sound.sounds
					}

					var snd = _.sample(sounds)
					snd.currentTime = 0
					snd.play()


				}
			})
		})
	},

	CleanUp: function(){
		delete C.components.Spawn
		delete C.components.AddVelocity
		delete C.components.Shoot
		delete C.components.Collided
		delete C.components.ShrinkVulnerable
		delete C.components.RemoveVulnerable
		delete C.components.Shrink
		delete C.components.Splat
		delete C.components.SplatVulnerable
		delete C.components.QuickSave
		delete C.components.QuickLoad
	}
}
