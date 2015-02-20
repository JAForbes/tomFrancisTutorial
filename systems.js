//Click
window.onmousedown = function(e){
	C('Click',{ down: true })
}
window.onmouseup = function(e){
	delete C.components.Click
}

//Keyboard keys
;(function(){

	var name = function(e){
		return ({
			32: 'SPACE',
			37: 'LEFT',
			38: 'UP',
			39: 'RIGHT',
			40: 'DOWN'
		})[e.keyCode] || String.fromCharCode(e.keyCode)
	}

	window.onkeydown = _.compose(
		function(name){
			C.components['Key_'+name] = C.components['Key_'+name] || {}
			C.components['Key_'+name][1] = C.components['Key_'+name][1] || {}
		},
		name
	)
	window.onkeyup = _.compose(
		function(name){
			delete C.components['Key_'+name]
		},
		name
	)
}());

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
		C.components.AddVelocity && C('RemoveCategory', {name: 'AddVelocity'})
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
		C('RemoveCategory',{name: 'Collided'})
	},

	Waypoint: function(){
		_.each( C('Waypoint'), function(w, id){
			var p = C('Location',id)
			var v = C('Velocity',id)

			var d = Math.sqrt(
				Math.pow(p.x-w.x,2) +
				Math.pow(p.y -w.y,2)
			)
			if ( d < w.minimum_distance ){
				C('WaypointReached', {}, id)
				C('RemoveComponent', { name: 'Waypoint'},id)
				w.speed = 0
				v.x = 0
				v.y = 0

			} else {
				var angle = Math.atan2( w.y-p.y, w.x-p.x ) - Math.PI
				v.x = Math.cos(angle) * w.speed
				v.y = Math.sin(angle) * w.speed

				C('Angle',id).value = angle
			}
		})
		C('RemoveCategory', {name: 'WaypointReached'})
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
		C.components.Spawn && C('RemoveCategory',{name: 'Spawn'})
	},

	SplatVulnerable: function(){

		_.each( C('SplatVulnerable'), function(vulnerable,id){
			_.each(C('Collided',id).collisions, function(collision,against){

				if( C.components.Splatter[against] ) {
					C('Splat',vulnerable.settings,id)
				}
			})
		})
		C('RemoveCategory',{ name: 'SplatVulnerable'})
	},

	ComponentAge: function(){
		if (!C.ComponentAge) {
			C.ComponentAge = {}
		}
		for( var category in C.components ){
			C.ComponentAge[category] = C.ComponentAge[category] || {}
			for(var entity in C.components[category]){
				C.ComponentAge[category][entity] = C.ComponentAge[category][entity] || 0
				C.ComponentAge[category][entity]++
			}
		}
		for (var category in C.ComponentAge ){
			for( var entity in C.ComponentAge[category]) {
				if( !C.components[category]  || !C.components[category][entity] ) {
					if (C.ComponentAge[category][entity] > -1){
						C.ComponentAge[category][entity] = 0
					}
					C.ComponentAge[category][entity]--
					if( C.ComponentAge[category][entity] < -100){
						delete C.ComponentAge[category][entity]
					}
				}
			}
		}
	},

	CategoryAge: function(){
		if( !C.CategoryAge ){
			C.CategoryAge = {}
		}

		for( var category in C.components ){
			C.CategoryAge[category] = C.CategoryAge[category] || 0
			C.CategoryAge[category]++
		}
		for( var category in C.CategoryAge ){
			if( !C.components[category]) {
				delete C.CategoryAge[category]
			}
		}
	},

	//TODO, need a more generic Spawn to create new components maybe Create
	//essentially a call to C({})

	// If something exists globally add some components to your self
	Is: function(){
		var CategoryAge = C.CategoryAge
		var initial = 1

		_.each( C('Is') , function(is, id){

			_.each(is, function(components, isNames){
				isNames.split('|').forEach(function(isName){

					var self = isName.indexOf('@') > -1
					isName = isName.replace('@','')
					var category = C.components[isName]

					var onSelf = !!(self && category && category[id])
					var onAnyone = !!(category)
					if( onSelf || !self && onAnyone ){

						var age = CategoryAge[isName]

						_.each( components, function(settings, componentName){
							var every = settings.every || 1
							if( (age-initial) % every == 0){
								C(componentName, settings.component, id)
							}
						})
					}
				})

			})
		})
	},


	// Add some components to yourself after a designated number of cycles
	After: function(){

	},

	Splat: function(){

		_.each( C('Splat') , function(splat, id){
			var bits = 100;
			var start = C('Location',id)
			var backup = C(id*1)

			//todo, but the deletes in the splat settings
			//infact, don't assume splat respawns, give it a hash to create
			//so one enemy type can create another enemy type for example
			//or an explosion could spawn smoke...
			delete backup.Splat
			delete backup.Remove
			var sprite =  { image: splat.sprite }
			for( var bitsSoFar = 0; bitsSoFar < bits; bitsSoFar++ ){

				var angle = (2 * Math.PI / bits) * bitsSoFar + _.random(-0.3, 0.3);
				var velocity =  { x: Math.cos(angle) * _.random(10,15), y: Math.sin(angle) * _.random(10,15)}
				var splat = C({
					Location: { x: start.x , y: start.y },
					Sprite: sprite,
					Dimensions: backup.Dimensions,
					Angle: { value: angle },
					Velocity: {x: velocity.x , y: velocity.y },
					Friction: { value : 0.963 },
					Unsplat: { respawn: backup, respawn_id: id, initial_location: {x: start.x , y: start.y}, initial_velocity:  { x: velocity.x, y: velocity.y } }
				})

			}
		})
		C('RemoveCategory',{ name: 'Splat'})
	},

	Unsplat: function(){
		var splats_at_start_of_loop = 0;
		var splats_remaining = 0;
		var splatted_persist;
		_.each(C('Unsplat'), function(splatted,id){
			splats_remaining++
			splats_at_start_of_loop++
		  var angle = C('Angle',id).value


		  var v = C('Velocity',id)
		  var p = C('Location',id)
		  var w = splatted.initial_location
		  if( Math.abs(v.x) + Math.abs(v.y) < 0.32 ){

		  	v.x = -splatted.initial_velocity.x
		  	v.y = -splatted.initial_velocity.y
		  	splatted.returning = true


		  }

		  var d = Math.sqrt(
			Math.pow(p.x-w.x,2) +
			Math.pow(p.y -w.y,2)
		  )
		  var back_at_start = (d < (Math.abs(v.x) + Math.abs(v.y)) )

		  if(splatted.returning && back_at_start ){
		  	C('Remove',{},id)
		  	splats_remaining--
		  	splatted_persist = splatted
		  }
		})
		if( splats_at_start_of_loop > 0 && splats_remaining == 0){
			var player = C(splatted_persist.respawn, splatted_persist.respawn_id*1 )
		  	var p = C('Location',player)
		  	p.x = splatted_persist.initial_location.x
		  	p.y = splatted_persist.initial_location.y
		}
	},

	Stopped: function() {
		_.each( C('Velocity'), function(v,id){
			if( (v.x + v.y) < 0.5 ){
				C('Stopped',{},id)
			} else {
				if(C.components.Stopped) {
					C('RemoveComponent',{ name: 'Stopped'}, id)
				}
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
		C('RemoveCategory',{ name: 'ShrinkVulnerable'})
	},

	ShrinkVulnerable: function(){
		_.each(C('ShrinkVulnerable'),function(vulnerable,id){

			_.each(C('Collided',id).collisions, function(collision,against){
				if( C.components.Shrinker && C.components.Shrinker[against] ) {
					C('Shrink',vulnerable.settings,id)
				}

			})
		})
		C('RemoveCategory',{ name: 'ShrinkVulnerable'})
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
		C('RemoveCategory',{ name: 'Shrink'})
	},

	RemoveEntity: function(){
		_.each(C('Remove'), function(remove,id){

			var removed = {}
			removed.Is = C('Is',id)
			removed.Delete = {}
			C(id,null)
			C.components['Is'] = C.components['Is'] || {}
			C.components['Is'][id] = removed.Is

			C.components['Delete'] = C.components['Delete'] || {}
			C.components['Delete'][id] = {}
		})
	},


	RemoveComponent: function(){
		_.each( C('RemoveComponent'), function(removeComponent,id){
			delete C.components[removeComponent.name][id]
		})
		delete C.components.RemoveComponent
	},

	RemoveCategory: function(){
		_.each( C('RemoveCategory'), function(RemoveCategory){
			delete C.components[RemoveCategory.name]
		})
		delete C.components.RemoveCategory
	},

	DeleteEntity: function(){
		_.each( C('Delete'), function( deleted, id){
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
			console.log('QuickSave')
			C('Save',id).state = _(C()).cloneDeep()
		})
		C('RemoveCategory',{name:'QuickSave'})
	},

	QuickLoad: function(){
		_.each(C('QuickLoad'), function(qLoad,id){
			console.log('QuickLoad')
			var save = C('Save',id).state

			if( !_.isEmpty(save) ){
				C.components = _.cloneDeep(save)
				C.components['Save'][id].state = save
			}

		})
		C('RemoveCategory',{name:'QuickLoad'})
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
				Splatter: {}
			})

			systems.VelocitySyncedWithAngle()
			C(shoot.components,bullet)
			//spawn bullet ahead of player
			var p = C('Location',bullet)
			var v = C('Velocity', bullet)

			p.x += v.x * shoot.spawn_radius
			p.y += v.y * shoot.spawn_radius
		})
		C.components.Shoot && C('RemoveCategory', {name: 'Shoot'})
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
	}
}
