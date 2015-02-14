systems = {
	Screen: function(){
		_.each(C('Screen'),function(screen,id){
			screen.el.width = window.innerWidth * screen.width
			screen.el.height = window.innerHeight * screen.height
			var con = screen.el.getContext('2d')

			con.translate.apply(con, screen.translate)
			con.translate(screen.translate[0] * window.innerWidth,screen.translate[0] *window.innerHeight)
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
	}
}

C({
	Screen: { width: 1, height: 1, el: document.querySelector('canvas'), translate: [0.5, 0.5] }
})

player = C({
	Drawable: {},
	Location: {x:0,y:0},
	Velocity: {x:0,y:0},
	Dimensions: { width: 20, height: 20},
	KeyboardActivated: {
		'LEFT': {
			AddVelocity: { x: -0.5 }
		},
		'RIGHT': {
			AddVelocity: { x: 0.5 }
		},
		'UP': {
			AddVelocity: { y: 0.5 }
		},
		'DOWN': {
			AddVelocity: { y: -0.5 }
		}
	}
})

use = [
	'Screen',
	'KeyboardActivated',
	'Draw'
]

loop = function(){
	use.map(function(system){
		systems[system]()
	})
	requestAnimationFrame(loop)
}

loop()
