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

	ClickActivated: (function(){
		var down = 0
		window.onmousedown = function(e){
			down = 1
		}
		window.onmouseup = function(e){
			down = 0
		}
		return function(){


			if(down){
				down++
				_.each(C('ClickActivated'), function(clickActivated,id){
					_.each(clickActivated, function(component, componentName){
						if( (down-2) % component.every == 0){
							C(componentName, component.component, id)
						}
					})
				})
			}
		}
	}()),

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
				p.x = mouse.x
				p.y = mouse.y
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

	Collideable: function(){
		test = function(a,b){
			var aP = C('Location',a)
			var bP = C('Location',b)
			var aD = C('Dimensions',a)
			var bD = C('Dimensions',b)

			var b1 = new SAT.Box(
				new SAT.Vector(
					aP.x-aD.width/2,
					aP.y-aD.height/2
				),
				aD.width, aD.height
			)
			var b2 = new SAT.Box(
				new SAT.Vector(
					bP.x-bD.width/2,
					bP.y-bD.height/2
				),
				bD.width, bD.height
			)

			var response = new SAT.Response()


			return SAT.testPolygonPolygon(b1.toPolygon(),b2.toPolygon(),response) && response;
		}
		_.each(C('Collideable'), function(collideable, a){
		_.each(C('Collideable'),function(collideable, b){
			if( a != b) {
				var response = test(a,b)
				if(response){
					C('Collided',{ against: b , response: response }, a)
					C('Collided',{ against: a }, b)
				}
			}
		})
		})
	},

	Collided: function(){
		_.each(C('Collided'),function(collided,id){

		})
	},

	GarbageCollection: function(){
		var screen = C('Screen',1)
		var canvas = screen.el
		_.each(C('GarbageCollected'),function(gc, id){
			var p = C('Location',id)
			if( Math.abs(p.x) > canvas.width *screen.translate[0] || Math.abs(p.y) > canvas.height * screen.translate[1]){
				C(id,null)
			}
		})
	},

	Shoot: function(){
		_.each(C('Shoot'),function(shoot,id){
			//Shoot: { component : { size_variation: 1.5, spread: 0.15, speed_range: [3,5] }, every: 20, count: 0 }
			var p = C('Location',id)
			var size = shoot.size + _.random(-shoot.size_variation,shoot.size_variation)
			var angle = _.clone( C('Angle',id)).value
			var bullet = C({
				Location: {x: p.x + _.random(-shoot.jitter,shoot.jitter), y: p.y + _.random(-shoot.jitter,shoot.jitter) },
				Angle: { value: angle + _.random(shoot.spread * -1, shoot.spread * 1)},
				Sprite: { image: s_bullet },
				Dimensions: { width: size, height: size },
				Velocity: { x: 0, y: 0 },
				VelocitySyncedWithAngle: {},
				Speed: { value: _.random(shoot.speed_range[0],shoot.speed_range[1]) },
				Collideable: {},
				GarbageCollected: {},
				Bullet: {}
			})

			systems.VelocitySyncedWithAngle()

			//spawn bullet ahead of player
			var p = C('Location',bullet)
			var v = C('Velocity', bullet)

			p.x += v.x * 5
			p.y += v.y * 5
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

	CleanUp: function(){
		delete C.components.AddVelocity
		delete C.components.Shoot
		delete C.components.Collided
	}
}
