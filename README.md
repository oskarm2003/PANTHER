#PANTHER

PANTHER is an atari 8bit isometric action game in which a player controls flying ship and shoots down enemies.
I took inspiration and recreated the game in typescript with an object oriented programming aproach.

Base of the whole project is an engine './src/engine' that manages virtual objects and displays them on the screen.
It allows to create objects and position them on a virtual space that later is being translated to a screen space using trigonometric functions.

The engine allowed to build a game './src/game' upon it.
