(function(){
	window.addEventListener('mousedown',function(e){
		C('Click',{ down: true })
	})
	window.addEventListener('mouseup', function(e){
		delete C.components.Click
	})

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