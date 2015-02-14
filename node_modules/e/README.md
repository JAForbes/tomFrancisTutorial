e
=

A Javascript Entity Component System Library

Dependencies: 

- [Underscore.js](https://github.com/jashkenas/underscore)

```javascript
//Create linked components
var id = E({
  Position: {x:0 , y:0},
  Collideable: {},
  //Anything else you want
})

//Add additional components later
E(id,'Velocity',{x:1,y:0})

//Query all of a type and use them in systems

function move(){

  E('Velocity').each(function(velocity,entityID){
  
    //grab components with the same id
    var pos = E('Position',entityID);
  
    pos.x += velocity.x
    pos.y += velocity.y
  })

}

//Access everything
E() //returns the entire structure, because everything should be hackable

//Delete component
delete E().Position[id]

//Delete all components of a type
delete E().Position


```
