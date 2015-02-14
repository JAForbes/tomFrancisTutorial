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

	AddVelocity: function(){
		_.each(C('AddVelocity'),function(add,id){
			var v = C('Velocity',id)
			v.x += add.x || 0
			v.y += add.y || 0
		})
	},

	Move: function(){
		_.each(C('Velocity'),function(v,id){
			var p = C('Location',id);
			p.x += v.x || 0
			p.y += v.y || 0
		})
	},

	Draw: function(){
		var canvas = C('Screen',1).el
		var con = canvas.getContext('2d')

		_.each(C('Sprite'),function(sprite,id){
			var p = C('Location',id)
			var d = C('Dimensions',id)

			con.drawImage(
				sprite.image,
				p.x - d.width/2,
				p.y - d.height/2,
				d.width, d.height
			)
		})
	},

	CleanUp: function(){
		delete C.components.AddVelocity
	}
}
