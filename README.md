# ECS JS port of Tom Francis' Amazing Game Design Tutorial

Controls
--------

Q: quicksave
R: load last quicksave
Arrow keys to move, Left mouse button to shoot

Features
--------

- Exploding enemies
- Patrols
- Spawn points
- Camera system
- Infinite Tiling background art
- Level boundaries
- Sound
- Other things!

What is this?
-------------

An Entity Component System port of Tom Francis' Excellent Tutorial: _Make a game with no experience_
[Youtube](https://www.youtube.com/playlist?list=PLUtKzyIe0aB2HjpmBhnsHpK7ig0z7ohWw)

Tagged Releases
---------------

I've made sure to create a tagged release for every episode of Tom's tutorial.

You can view the tags here: https://github.com/JAForbes/tomFrancisTutorial/tags

You can download a zip there, or if you know how to use git, you can just:

```
git checkout part9
```

How do I run it?
----------------

Simply download this repo and open `index.html` in your favourite web browser.
The current version can be found at https://james-forbes.com/tomFrancisTutorial

What is an Entity Component System?
-----------------------------------

It is the best approach I have seen so far for building real time apps.  And my guess is, that they may even be appropriate
in other domains, such as UI's.  But that is yet to be seen.

It's kind of how Unity3d works behind the scenes.  But essentially you put all functionality into self contained systems. 
Those systems query Types of data and modify them.

The advantage is you create entities with a flat structure, and you can mix and match components to create new and interesting functionality, without worrying about Parent classes.

When all the basic systems are written (Gravity, Movement, Camera, Rendering, Collision etc) you can actually
design your game just be specifying data, not by editing behaviours.

Why am I doing this?
---------------------

I am a professional programmer.  I'd go as far to say, that I am fairly good at programming (lots and lots to learn).  
But I am not very good at programming games.  I've done multiple game jams.  And made multiple games.  But none of them are
very [juicy](https://www.youtube.com/watch?v=AJdEqssNZ-U)

I've coded on the server, on the client.  A little database, imperative, functional, interpreted and static.  And most of
the skills  have been transferable.  But I think Game programming is a completely separate non transferrable skill.  You need to think in a _completely_ different way.  
In many ways, being a good web programmer, or server programmer can make you a bad game programmer because you have all the wrong instincts.

My hope is, by following a long with Tom's tutorial, I'll pick up a lot of game design know how, and gain those instincts I
don't have.  And at the same time, I'll build the engine that I want to work in.  Something simple, composable and hackable.

Is this an Engine?
------------------

Actually, this isn't an Engine.  I just don't have another way of putting it.  Perhaps a better term would be
a platform.  I've written a tiny Entity managemernt system, with a querying syntax, optimized for querying by type.

And then I am building various systems.  But you could write your own systems and we could share them.  Which is really
the end goal.  The systems are completely isolated from eachother.  So you can drop in a different Renderer, or 
Collision system and all your other systems will not care.
