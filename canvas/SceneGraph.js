// requires utils/Inheritance.js utils/timer.js

//=================================================================//
SceneItem = function(){
	this.name = 'none';
	this.x = 0;
	this.y = 0;
	// Draw item onto a canvas. Abstract.
	this.draw = function( ctx ){alert('function SceneItem.draw is abstract');}
	// Set new position of the item 
	this.setPos = function(x, y){this.x = x;this.y = y;}
	// Move item by a vector
	this.moveBy = function(dx, dy){this.x += dx;this.y += dy;}
	// Implement this method to control item's position during animation
	this.posController = function( time ) {}
}

//=================================================================//
function Circle(x,y,radius, color )
{
	this.setPos(x,y);
	this.radius = radius;
	this.color = color;
}
Circle.inheritsFrom( SceneItem );
// Draw the circle
Circle.prototype.draw = function(ctx)
{
	ctx.fillStyle = this.color;
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0,Math.PI*2, true);
	ctx.closePath();
	ctx.fill();
}

//=================================================================//
function SingleImage(x,y,src)
{
	this.setPos( x, y );
	this.img = new Image();
	this.img.src = src;
}
SingleImage.inheritsFrom( SceneItem );
SingleImage.prototype.draw = function( ctx )
{
	ctx.drawImage( this.img, this.x, this.y );
}

//=================================================================//
function TextString(x,y,text)
{
	this.setPos( x, y );
	this.text = text;
	this.font = "12px Arial";
	this.color = "#000000"
}
TextString.inheritsFrom( SceneItem );
TextString.prototype.draw = function( ctx )
{
	ctx.font = this.font;
	ctx.fillStyle = this.color;
	ctx.fillText( this.text, this.x, this.y );
}

//=================================================================//
function SceneNode()
{
	this.items = [];
};
SceneNode.inheritsFrom( SceneItem );

SceneNode.prototype.add = function(item)
{
	this.items.push( item );
}
SceneNode.prototype.draw = function( ctx )
{
	var len = this.items.length;
	for(var i = 0; i < len; i += 1)
	{
		this.items[i].draw( ctx );
	}
}

//=================================================================//
function SceneGraph(canvas_id,rwidth,rheight)
{
	this.canvas = document.getElementById(canvas_id)
	this.context = this.canvas.getContext("2d");
	this.movables = [];
	this.time = 0;
	this.savedTime = 0;
	this.isAnimationOn = false;
};
SceneGraph.inheritsFrom( SceneNode );

SceneGraph.prototype.redraw = function()
{
	this.draw( this.context );
}

// Adds item to the list of movable objects. The item must have been
// previously added to SceneGraph or any child node.
SceneGraph.prototype.setMovable = function( item )
{
	this.movables.push( item );
}

SceneGraph.prototype.run = function()
{
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.time = Timer.time - this.savedTime;
	var len = this.movables.length;
	for(var i = 0; i < len; i += 1)
	{
		this.movables[i].posController( this.time );
	}
	this.redraw();
}

SceneGraph.prototype.start = function()
{
	this.isAnimationOn = true;
	this.savedTime = Timer.time;
	Timer.add( this );
	Timer.start();
}

SceneGraph.prototype.stop = function()
{
	this.isAnimationOn = false;
	Timer.remove( this );
}

SceneGraph.prototype.pause = function()
{
	this.isAnimationOn = false;
	this.savedTime = Timer.time;
}

SceneGraph.prototype.resume = function()
{
	this.isAnimationOn = true;
}
