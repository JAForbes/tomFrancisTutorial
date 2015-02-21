# Entity Component System Port of Tom Francis' Amazing Game Design Tutorial

This project is a way for me to prove a programming methodology known as an Entity Component System.
To do so, I'm following along with a Beginner game development tutorial that makes use of Game Maker.

I'm following along and implementing all the systems that this tutorial makes use of.  So I know that
this process would be useful generally.  But also to allow me to learn a lot of the second nature game dev skills
that I have never picked up while doing game jams.

What is this?
-------------

An Entity Component System port of Tom Francis' Excellent Tutorial: _Make a game with no experience_
[Youtube](https://www.youtube.com/playlist?list=PLUtKzyIe0aB2HjpmBhnsHpK7ig0z7ohWw)

What is an Entity Component System?
-----------------------------------

It is the best approach I have seen so far for building real time apps.  And my guess is, that they may even be appropriate
in other domains, such as UI's.  But that is yet to be seen.

It's kind of how Unity3d works behind the scenes.  But essentially you put all functionality into systems, and those
systems query types of data and modify them.  The advantage is you create entities with a flat structure, and you can mix
and match components to create new and interesting functionality, without worrying about Parent classes.

Why am I doing this?
---------------------

I am a professional programmer.  I'd go as far to say, that I am fairly good at programming (lots and lots to learn).  
But I am not very good at programming games.  I've done multiple game jams.  And made multiple games.  But none of them are
very [juicy](https://www.youtube.com/watch?v=AJdEqssNZ-U)

I've coded on the server, on the client.  A little database, imperative, functional, interpreted and static.  And most of
the skills  have been transferable.  But I think Game programming is a completely separate non transferrable skill.  You need to think in a _completely_ different way.  
In many ways, being a good web programmer, or server programmer can make you a bad game programmer because you have all the wrong instincts.

My hope is, by following a long with Tom's tutorial, I'll pick up a lot of game design know how, and gain those instincts I
don't have.  And at the same time, I build the engine that I want to work in.  Something simple, composable and hackable.
