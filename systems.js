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

	Translate: function(){
		var screenDim = C('Screen',1).el

		_.each(C('Translate'),function(translate,id){
			var p = C('Location',id)

			p.x = p.x + (translate.x || 0) * screenDim.width
			p.y = p.y + (translate.y || 0) * screenDim.height
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
			//TODO check typeof if angles start going weird
			con.rotate(sprite.angle || angle || 0)
			con.drawImage(
				sprite.image,
				0-d.width/2,
				0-d.height/2,
				d.width, d.height
			)
			con.restore()

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


	Camera: function(){
		_.each( C('Camera'), function(camera, id){
			var screen = C('Screen',id)
			camera.lag = camera.lag || 25
			camera.last_position = camera.last_position || {x:0,y:0}
			var track_position = C('Location',camera.tracking)
			var position = {
				x: track_position.x || camera.last_position.x,
				y: track_position.y || camera.last_position.y
			}

			var offset = { x: 0, y: 0 };
			var dx = position.x - camera.last_position.x
			var dy = position.y - camera.last_position.y

			offset.x = camera.last_position.x + dx//(dx/camera.lag) * 0.5
			offset.y = camera.last_position.y + dy//(dy/camera.lag) * 0.5



			screen.con.translate(-offset.x,-offset.y)
			camera.last_position = offset;

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

	Move: function(){
		_.each(C('Velocity'),function(v,id){
			var p = C('Location',id);
			var a = C('Acceleration',id);

			v.x += a.x || 0
			v.y += a.y || 0

			p.x += v.x || 0
			p.y += v.y || 0

			a.x = 0
			a.y = 0
		})

	},

	Accelerate: function(){
		_.each( C('Accelerate'), function(a, id){
			var A = C('Acceleration',id)

			a.x && (A.x += a.x)
			a.y && (A.y += a.y)
		})
		C.components.Accelerate &&C('RemoveCategory', {name: 'Accelerate'})
	},

	Friction: function(){
		_.each(C('Friction'),function(friction,id){
			var v = C('Velocity',id)
			v.x *= friction.value
			v.y *= friction.value
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

	Stopped: function(){
		_.each(C('Velocity'), function(v,id){
			var speed = Math.sqrt( v.x*v.x + v.y*v.y)
			if(speed < 1e-3 ){
				C('Stopped', {stopped: true}, id)
			} else {
				C('RemoveComponent', {name: 'Stopped', entity: id})
			}

		})
	},

	Tether: function(){
		_.each(C('Tether'),function(tether,id){
			var other = C('Location',tether.entity)
			if( _.isEmpty(other) ){
				other = tether.last_position || {x:0,y:0}
			}
			var p = C('Location',id)
			var dx = Math.abs(p.x - other.x)
			var dy = Math.abs(p.y - other.y)
			var angle = C('Angle',id).value = Math.atan2(other.y-p.y, other.x-p.x)

			var acceleration = C('Acceleration', id)
			acceleration.x += Math.cos(angle) * dx * tether.elasticity
			acceleration.y += Math.sin(angle) * dy * tether.elasticity
			tether.last_position = { x: other.x, y: other.y}

		})
	},

	Facing: function(){
		_.each(C('Facing'),function(facing,id){
			var other = C('Location',facing.entity)
			var p = C('Location',id)
			C('Angle',id).value = Math.atan2(other.y-p.y, other.x-p.x)
		})
	},

	Waypoint: function(){
		_.each( C('Waypoint'), function(w, id){


			var p = C('Location',id)
			w.start = w.start || { x: p.x, y: p.y }
			var v = C('Velocity',id)
			var A = C('Acceleration',id)
			var f = C('Friction',id)
			var d = Math.sqrt(
				Math.pow(p.x-w.x,2) +
				Math.pow(p.y -w.y,2)
			)


			var s = Math.sqrt(
				Math.pow(v.x,2) +
				Math.pow(v.y,2)
			)

			var min_distance = s;

			if ( d <= min_distance ){

				C('WaypointComplete', {}, id)
				C('RemoveComponent', { name: 'Waypoint', entity: id})
				w.speed = 0
				v.x = 0
				v.y = 0
				p.x = w.x
				p.y = w.y

			} else {
				var angle = Math.atan2( w.y-p.y, w.x-p.x ) - Math.PI

				A.x += Math.cos(angle) * -1
				A.y += Math.sin(angle) * -1

				C('Angle',id).value = angle
			}
		})
		C.components.WaypointComplete && C('RemoveCategory', {name: 'WaypointComplete'})
	},

	Patrol: function(){
		_.each(C('Patrol'), function(patrol,id){
			var p = C('Location',id)
			var w = C('Waypoint',id)


			var patrol_is_new = !patrol.start
			var patrol_is_not_new = !patrol_is_new
			var waypoint_exists = !!(C.components.Waypoint && C.components.Waypoint[id])



			if( patrol_is_new ) {

				patrol.start = { x: p.x , y: p.y }
				patrol.waypoints.push(patrol.start)

				var waypoint = patrol.waypoints.shift()
				C('Waypoint', waypoint, id )
			} else if( patrol_is_not_new ){

				//reached a waypoint
				if( !waypoint_exists ){

					var backAtStart = p.x == patrol.start.x && p.y == patrol.start.y
					var reachedActiveWaypoint = !backAtStart

					//could either have reached home, or reached the first waypoint
					if(backAtStart){
						C('PatrolComplete', {}, id)
						C('RemoveComponent', {name: 'PatrolComplete', entity: id})
						C('RemoveComponent', {name: 'Patrol', entity: id})
					} else if (reachedActiveWaypoint) {

						C('Waypoint', patrol.waypoints.shift(), id)
					}
				}
			}
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

	Pickup: function(){
		_.each(C('MixinPickup'), function(mixin, id){
			_.each(C('Collided',id).collisions, function(collision, against){
				var pickup = C('Pickup',against)
				var hasPickup = !_.isEmpty(pickup)
				if(hasPickup){
					//todo: probably don't need to cloneDeep
					C(pickup, id)
				}
			})

		})
	},

	Create: function(){
		_.each( C('Create'), function(create, id){

			//store owner on created
			create.components.Owner = { owner: id }
			//create child
			var created = C(_.cloneDeep(create.components))
		})
		C.components.Create && C('RemoveCategory',{name: 'Create'})
	},

	Inventory: function(){
		_.each( C('InventoryItem'), function(item, id){
			var newly_created = C.ComponentAge.InventoryItem[id] == 1
			if(newly_created && item.replace){

				_.each( C('InventoryItem'), function(item2, id2){
					if(id != id2 && item.type == item2.type){
						C('Remove',{},id2)
					}
				})

			}
		})
	},

	OwnerOffset: function(){
		_.each(C('OwnerOffset'), function(offsets, id){
			var owner = C('Owner', id).owner

			owner && _.each(offsets, function( attributes, category){
				var ownerComponent = C(category,owner)
				var childComponent = _.cloneDeep(ownerComponent)
				_.each(attributes, function(value, attr){
					childComponent[attr] += value
				})
				C(category, childComponent, id)
			})

		})
	},

	Owner: function(){
		_.each( C('Owner'), function(owner,id){
			var owner_dead = typeof C.components.Location[owner.owner] == 'undefined'
			if( owner_dead ){
				C('Remove',{},id)
			}
		})
	},

	Every: function(){
		_.each( C('Every'), function(everys, id){
		_.each(everys, function(components, every){
			var age = C.ComponentAge['Every'][id]
			if( age % every == 0){
				_.each(components, function(component, componentName){
					C(componentName, component, id)
				})
			}
		})
		})
	},

	Choose: function(){
		_.each( C('Choose'), function(choose, id){
			var components = _.sample(choose)
			C(components,id)
		})
		C.components.Choose && C('RemoveCategory',{name: 'Choose'})
	},

	Randomise: function(){
		_.each( C('Randomise'), function(randomise, id){
			_.each(randomise, function(random_component, componentName){
				var component = {}
				_.each(random_component, function(range, name){
					component[name] = _.random.apply(_,range)
				})
				C(componentName, component, id)
				C('RemoveComponent',{ name: 'Randomise', entity: id})
			})
		})
	},

	//TODO, need a more generic Spawn to create new components maybe Create
	//essentially a call to C({})

	// If something exists globally add some components to your self
	Has: function(){
		var CategoryAge = C.CategoryAge
		var initial = 1

		_.each( C('Has') , function(is, id){

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

	Repeat: function(){
		_.each(C('Repeat'), function(repeat, id){
			_.each(repeat, function(settings, componentName){

				if( settings.remaining >= 1){
					var removed = !(C.components[componentName] && C.components[componentName][id])
					if(removed){
						settings.remaining--
						C(componentName, _.cloneDeep(settings.component), id)
					}
				}
			})
		})
	},

	Restore: function(){
		_.each(C('Restore'), function(restore, restore_id){
			var backup = C('Backup',restore.entity).components

			if(backup){
				C(backup,restore.entity)
				C('Remove',{},restore_id)

				// We need to manually delete the backup, as it is likely omitted
				// from removal
				sounds.Restore[0].play()

				delete C.components.Backup[restore.entity]
				delete C.components.Delete[restore.entity]
				C('Restored', {}, restore_id)
			}
		})
		C.components.Restore && C('RemoveCategory', {name: 'Restore'})


	},

	Backup: function(){

		_.each(C('Backup'), function(backup, id){

			if(!backup.components){
				backup.components = _.cloneDeep(
					_.omit(C(id*1), backup.omit)
				)
			}
		})
	},

	QuickSave: function(){
		_.each(C('QuickSave'), function(qSave,id){
			C('Save',id).state = _(C()).cloneDeep()
		})
		C.components.QuickSave && C('RemoveCategory',{name:'QuickSave'})
	},

	QuickLoad: function(){
		_.each(C('QuickLoad'), function(qLoad,id){
			var save = C('Save',id).state

			if( !_.isEmpty(save) ){
				C.components = _.cloneDeep(save)
				C.components['Save'][id].state = save
			}

		})
		C.components.QuickLoad && C('RemoveCategory',{name:'QuickLoad'})
	},

	Reform: function(){
		_.each(C('Reform'), function(reform, id){
			var wave = C('Wave',id)

			wave.reforming = wave.reforming || []

			var reformed = wave.entities

				.map( C.bind(C,'Stopped') )

				.map(function(stopped,i){
					var isReforming = wave.reforming[i]
					var notReforming = !isReforming
					var hasStopped = stopped.stopped

					if(hasStopped){
						if( notReforming ){
							var entity = wave.entities[i]
							var v = C('Velocity', entity)
							v.x = v.initial.x *= -1
							v.y = v.initial.y *= -1
							wave.reforming[i] = true
						}
					}
					return hasStopped && isReforming
				})
				.filter(Boolean)

			if(reformed.length && !reform.reforming){
				reform.reforming = true
				sounds.Reforming[0].play()
			}
			if(reformed.length == wave.entities.length){
				C('Restore',{entity: wave.spawner })
				//Removes Reform and Wave
				C('Remove',{},id)
				//Remove all the entities in the wave
				wave.entities.forEach( C.bind(C,'Remove',{}))
			}
		})
	},

	Splat: function(){

		_.each( C('Splat') , function(splat, id){
			var p = _.clone(C('Location',id))
			var d = C('Dimensions',id)



			if(splat.wave){
				var wave_entities = []
				var wave_id = C({
					Wave: { entities: wave_entities, spawner: id }
				})
				C(splat.wave,wave_id)
			}

			splat.bits = splat.bits || 8
			splat.spread = splat.spread || 0.3
			splat.friction = splat.friction || 0.95
			splat.velocity_range = splat.velocity_range || [10,20]
			var angle_segment = (2 * Math.PI / splat.bits);


			for( var bitsSoFar = 0; bitsSoFar < splat.bits; bitsSoFar++ ){
				var velocity = _.random.apply(_,splat.velocity_range)
				var angle = angle_segment * bitsSoFar + _.random(-splat.spread,splat.spread);
				var v =  { x: Math.cos(angle) * velocity, y: Math.sin(angle) * velocity}
					v.initial = { x: v.x, y: v.y }

				var spawned_splat = C({
					Location: {x: p.x, y: p.y},
					Dimensions:d,
					Angle: { value: angle },
					Velocity: v,
					Acceleration: {x: 0, y: 0},
					Friction: { value: splat.friction },
					SAT: {},
					Remover: {},
					Shrinker: {},
					Splatter: {},
					CollidesWith: {}
				})
				if(splat.wave){
					C('WaveEntity', { wave_id: wave_id }, spawned_splat)
					wave_entities.push(spawned_splat)
				}

				//todo have a flag for locking image_angle to initial angle
				if(splat.components.Sprite){
					splat.components.Sprite.angle = angle
				}
				C(splat.components,spawned_splat)
			}//for
			C('RemoveComponent', {name: 'Splat', entity: id })
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
		C.components.Shrink && C('RemoveCategory',{ name: 'Shrink'})
	},

	RemoveEntity: function(){
		_.each(C('Remove'), function(remove,id){
			var removed = {}
			removed.Has = C('Has',id)
			removed.After = C('After',id)
			removed.Delete = {}
			//todo should this be a part of C(id,null)?
			//like C(id,null,omit)
			if( remove.omit ){
				_.each( _.omit( C(id*1), remove.omit ) , function(component, key){
					delete C.components[key][id]
				})
			} else {
				C(id,null)
			}
			//Move this Has thing into omit?
			C.components['Has'] = C.components['Has'] || {}
			C.components['Has'][id] = removed.Has

			C.components['Delete'] = C.components['Delete'] || {}
			C.components['Delete'][id] = { omit: remove.omit || [] }
		})
	},


	RemoveComponent: function(){
		_.each( C('RemoveComponent'), function(removeComponent,id){
			delete C.components[removeComponent.name][removeComponent.entity]
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
		_.each( C('Delete'), function( remove, id){

			_.each( _.omit( C(id*1) , remove.omit ) , function(component, key){
				delete C.components[key][id]
			})

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

			p.x += Math.cos(angle) * size+v.x
			p.y += Math.sin(angle) * size+v.y
		})
		C.components.Shoot && C('RemoveCategory', {name: 'Shoot'})
	},

	KickBack: function(){
		_.each(C('Shoot'),function(shoot,id){
			var owner = C('Owner',id).owner
			var kickBack = C('KickBack',owner)
			if(kickBack.ratio){
				var a = C('Acceleration',owner)
				var d = shoot.components.Damage.value
				var angle = -C('Angle',id).value
				a.x += -(Math.cos(angle) * d) * kickBack.ratio
				a.y += (Math.sin(angle) * d) * kickBack.ratio
			}
		})
	},

	PanBoundary: function(){
		var screen = C('Screen',1)
		_.each(C('PanBoundary'), function(pan,id){
			var position = C('Location',id)
			var velocity = C('Velocity',id)
			var acceleration = C('Acceleration',id)

			var far_right_edge = pan.x + pan.width
			var far_left_edge = pan.x
			var far_top_edge = pan.y
			var far_bottom_edge = pan.y + pan.height

			var right_half_of_viewport = position.x + screen.el.width/2
			var left_half_of_viewport = position.x - screen.el.width/2
			var top_half_of_viewport = position.y - screen.el.height/2
			var bottom_half_of_viewport = position.y + screen.el.height/2

			//far right edge, and player, contained in viewport right half of viewport
			//stop tracking the player, by setting last viewport position to last viewport position
			if(right_half_of_viewport > far_right_edge && acceleration.x > 0){
				velocity.x = acceleration.x = 0
			}
			if(left_half_of_viewport < far_left_edge && acceleration.x < 0){
				velocity.x = acceleration.x = 0
			}
			if(top_half_of_viewport < far_top_edge && acceleration.y < 0){
				velocity.y = acceleration.y = 0
			}
			if(bottom_half_of_viewport > far_bottom_edge && acceleration.y > 0){
				velocity.y = acceleration.y = 0
			}
		})


	},

	BounceBox: function(){
		_.each(C('BounceBox'),function(bb,id){
			var p = C('Location',id)
			var d = C('Dimensions',id)
			var v = C('Velocity',id)

			if(	p.x + d.width/2 > bb.x + bb.width || p.x - d.width/2 < bb.x ){
				v.x *= -1
				p.x += v.x
			}
			if(p.y + d.height/2 > bb.y + bb.height || p.y - d.height/2 < bb.y ) {
				v.y *= -1
				p.y += v.y
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
