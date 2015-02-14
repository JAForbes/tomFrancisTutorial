systems = {
	Screen: function(){
		_.each(C('Screen'),function(screen,id){
			screen.el.width = window.innerWidth * screen.width
			screen.el.height = window.innerHeight * screen.height

			screen.con.translate(screen.translate[0] * window.innerWidth,screen.translate[0] *window.innerHeight)
		})
	},

	KeyboardActivated: function(){
		_.each(C('KeyboardActivated'),function(kb,id){
				_.each(kb,function(componentsToActivate, keyName){
					if(Keys[keyName]){
						_.each(componentsToActivate,function(component,componentName){
							C(componentName,component,id)
						})
					}
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

		_.each(C('Drawable'),function(drawable,id){
			var p = C('Location',id)
			var d = C('Dimensions',id)

			//console.log(p,d)
			con.fillRect(
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

C({
	Screen: { width: 1, height: 1, el: document.querySelector('canvas'), con: document.querySelector('canvas').getContext('2d'), translate: [0.5, 0.5] }
})

player = C({
	Drawable: {},
	Location: {x:0,y:0},
	Velocity: {x:0,y:0},
	Dimensions: { width: 20, height: 20},
	KeyboardActivated: {
		'LEFT': {
			AddVelocity: { x: -0.1 }
		},
		'RIGHT': {
			AddVelocity: { x: 0.1 }
		},
		'UP': {
			AddVelocity: { y: -0.1 }
		},
		'DOWN': {
			AddVelocity: { y: 0.1 }
		}
	}
})

use = [
	'Screen',
	'KeyboardActivated',
	'AddVelocity',
	'Move',
	'Draw',
	'CleanUp'
]

loop = function(){
	use.map(function(system){
		systems[system]()
	})
	requestAnimationFrame(loop)
}

loop()
