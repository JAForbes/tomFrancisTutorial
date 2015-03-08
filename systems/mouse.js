(function(){
	window.addEventListener('mousedown',function(e){
		var type = ({
			1: 'Click',
			3: 'RightClick'
		})[e.which]
		type && C(type, { down: true })
	})
	window.addEventListener('mouseup', function(e){
		var type = ({
			1: 'Click',
			3: 'RightClick'
		})[e.which]
		if(type){
			delete C.components[type]
		}
	})
	window.oncontextmenu = function(e){
	  return false
	}

	var mouse = {x:0,y:0}
	window.addEventListener('mousemove',function(e){
		mouse.x = e.clientX
		mouse.y = e.clientY
	})

	systems.Mouse = function(){
		_.each(C('Mouse'),function(mouseComponent,id){
			var p = C('Location',id)
			var camera = C('Camera',mouseComponent.game).last_position

			p.x = mouse.x + camera.x
			p.y = mouse.y + camera.y
		})

	}
}())