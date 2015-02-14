What is an Entity Component System?
=============================

Entity Component Systems (ECS) are a new programming model that is common in the professional game development industry, but is mostly unknown in other programming spheres.

If you make games, or any real time application, then you will probably benefit for learning more about ECS, and in my opinion, this is a great place to start.

OOP doesn't like change
===================

There are lots of benefits to ECS, but it was invented to solve two main problems in traditional Object Oriented Programming (OOP).  The first problem is the Fragile base class](http://en.wikipedia.org/wiki/Fragile_base_class) and the second problem is inheritance strucutres making it difficult to create interesting combinations of functionality that were beyond the initial design of the program.

> I challenge you, however, to name a single programming language mechanism that supports change. Those mechanisms that do deal with change restrict and control it rather than enable it.
>
>[Ten Thing I hate About OOP - Oscar Nierstrasz](http://blog.jot.fm/2010/08/26/ten-things-i-hate-about-object-oriented-programming/comment-page-2/)

OOP does not encourage late changes in design or intention, and ECS solves this.

ECS is nothing like OOP
===================

Because ECS is such a new concept, there is not a lot of great writing or tutorials on how to use it.  I found it difficult to grasp the basics concepts for a few months because I so natively understood OOP thanks to early indoctrination.

ECS is really nothing like OOP.  You don't have classes, inheritance, methods or interfaces.  ECS is really more comparable to SQL or procedural programming.  I encourage you, for the moment, to abandon all notions of OOP, it will make this much easier for your brain.

Data + Procedures
===============

Procedural programming is all about Data and Procedures as being separate parts of a program.  They are not bundled together in an object.  This is similar to SQL, where a database does not contain functions, it contains only the data that the functions act on.

Explaining, in words, _why_ ECS works is probably less effective than writing some ECS code and inspecting _what_ is happening.

```
E()
```

This is `E`.  `E` is a function that allows for the creation and retrieval of data.

```
var positions = E('Position').toArray()
```
Here I have queried `E`, for all the records of position data and stored it in a variable called positions.

```
E('Position').each( function (position, id) {
  var x = position.x;
  var y = position.y;
} )
```
Here I have queried `E` for all positions, and iterated over `each` `position`.  I've then extracted some coordinate data from `position` simply to illustrate that position is just an object containing some data.

Note the second argument `id`.  This is just an number that allows you to retrieve other data associated with this record.  It works like a foreign key in a database, except that there is no child tables, just separate pieces of data referencing the same `id`.

```
E('Position').each( function(position,id) {

  var velocity = E('Velocity',id)

})
```
Here I have accessed the velocity data that shares the same id as this particular position data by querying `E` in the format `E(<DataName>,<SharedID>)`

```
E('Position').each( function(position,id) {

  var velocity = E('Velocity',id)
  
  position.x += velocity.x
  position.y += velocity.y
})
```

We have just moved the current position by it's current velocity for all positions.  In SQL this might look like.

```SQL
UPDATE Position SET Position.x=x+Velocity.x,Position.y=y+Velocity.y
// ^^ made up SQL that or may not be valid
```

So we now have our function that moves all our data.  Let's name our function and call it in a loop so our data can keep moving.

```

systems = {

  move: function(){
    E('Position').each( function(position,id) {

       var velocity = E('Velocity',id)
  
       position.x += velocity.x
       position.y += velocity.y
    })

  }

}

(function loop(){
  systems.move()
  requestAnimationFrame(loop)
})()
```
Now `systems.move` will query all `Position` data and update it with their current velocity every time the browser is ready to draw a new frame.

I'll make one more, very important change to the `loop` function, that will make adding new systems much easier.

```
(function loop(){
 
  var callOrder = [
    'move'
  ]
  
  _(callOrder).each(function(systemName){
    var system = systems[systemName];
    if (system) {
       system()
    }
  })
  
  requestAnimationFrame(loop)
})()
```

Now you have finer control of which functions are called, and in what order.  
It is important to check collision only after movement has occurred, and it is important for rendering systems to come at the end of each cycle.

Creating Entities
=============

If you were to run the above code, not much would happen because we haven't actually created any `Position` or `Velocity` data yet.

```
E({
  Position: { x:0, y:0 },
  Velocity: { x:1, y:1 }
})
```
Here we have created two _components_ that share the same _entity_.
A component, is just a piece of data with a name.  An _entity_ is just a unique identifier.  We don't specify the entity, that is done automatically.  But if we wanted to store it, we can.

```
var id = E({
  Position: { x:0, y:0 },
  Velocity: { x:1, y:1 }
})
```

`E` returns the id, when creating the components.

Just from running the above code,the system we created is automatically activated, and our positions are moving.

If you were to open up the Browser console and grab a random Position component, you will see it has moved.

```
var position = E('Position').sample()
//returns something like {x: 143234, y: 123234}
```

Events
======

Let's say we have already created an entity, and associated `Position` and `Velocity` components to them.  But we wanted to add a new component to them during runtime, say in a system.

We can just go `E(<entity>, <ComponentName>,<ComponentData> )`

This is almost equivalent to triggering an Event, for example:

We have found two of our entities have collided with each other, and we want other systems to activate when a collision has occurred.  We can use the above to add a `Collided` component to these entities.

```

//systems.collision

E('Position').each(function(position,entity){

  E('Position').each(function(otherPosition,otherEntity){
    if(otherEntity != entity){
      if(position.x == otherPosition.x && position.y == otherPosition.y){

        E(entity,'Collided',{ against: otherEntity })
        E(otherEntity,'Collided',{ against: entity })
      }

    }
  })

})
```

So we queried all the positions and did a simple check to see if two positions were exactly equal.  Then we added some collision information to these entities, so that other systems can create explosions, or remove the entity, or make them bounce.  And these are all systems you could create yourself I am sure.  Let's try a naive bouncing system.

//systems.bounce
E('Collided').each(function(collided,entity){

  var velocity = E('Velocity',entity)
  velocity.x *= -1
  velocity.y *= -1
})

Instantly, this code will query the collided entities, and invert the velocity.  Hopefully, even at this early stage, you can see how structureless and pliable this way of working is.

Right now our `callOrder` in our loop looks like

```
var callOrder = [
  'move',
  'collision',
  'bounce',
]
```

And that will work, but there is a bug, that you may discover if you are coding along.  If our entities collide, a `Collided` component is created.  And then all entities that have `Collided` will have their `Velocity` inverted.  But this will happen forever because we never removed the `Collided` component.  So your entity will just appear to stop moving, because it keeps moving in the exact opposite direction every frame.

So we need one more important system.

```
var callOrder = [
  'move',
  'collision',
  'bounce',
  'cleanUp'
]

//systems.cleanUp
cleanUp: function(){
  delete E().Collided
}

```
If your game becomes more complex, your system for events and removal of components will no doubt become more complex.  I find though, that this is a pretty easy system to maintain.

Rendering
========

Let's make a quick system that renders squares at all Positions.
I am going to assume there is already a global variable for the canvas and it's context: `can` and `con` respectively.

If you have multiple canvases, you can store the canvas in a component and query it using `E('Canvas').each`.  But for this simple example, a global is fine.

```
var callOrder = [
  'move',
  'collision',
  'bounce',
  'draw',
  'cleanUp',
]

...

//systems.draw
draw: function(){
  E('Position').each(function(position,entity){
    var size = 20;
    con.fillRect(position.x-size/2,position.y-size/2,size,size);    
  })
}
```

Now, this assumes we want all entities with `Position` to be drawn.  Which is probably not the case.  If you want more control you could do the following.

```
//systems.draw
draw: function(){
  E('Renderable').each(function(renderable,entity){
    var position = E('Position',entity)
    var size = 20;
    con.fillRect(position.x-size/2,position.y-size/2,size,size);    
  })
}
```

Now, only entities with a Renderable component, will be drawn.  You could stash all kind of useful style information in renderable too (if you weren't happy with just black squares).

Bypassing `E`
===========

I have shown you `E`, but I haven't exactly explained what is going on inside it.

`E`, is kind of a game programming equivalent to jQuery.  `E('Position')` is pretty similar to `$('.position')` in that it returns a [wrapped collection](http://underscorejs.org/#wrap) of all elements/entities that matched the query.

`E` uses underscore.js for wrapping the result, which lets you call `each` or `map` or `filter` or any other useful function.

`E` let's you create and query only.  If you want to remove a component, or an entity.  You currently have to do it yourself.  You can completely bypass `E` by calling it with no arguments.

`var allComponents = E()`

This might return something like:
```
{
  Position: { 1: {x:0 ,y:0}, 2: {x:4, y:0} },
  Velocity: { 1: {x:0, y:0}, 2: {x:1, y:0} } 
}
```

So to dereference all `Position` entities:

```
delete E().Position
```

And to remove a specific Position component:
```
delete E().Position[1]
```

Serializing
========

Because all the state is stored in `E`, you can trivially serialize the state of your game.  By just sending the output of `E()` to a server.

```
$.ajax({
  url: 'www.yourserver.com'
  data: E()
})
```

And to retrieve state from a server just loop through the response and call `E(<entity>,<componentName>,<componentData>)` on them.



