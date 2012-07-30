// requires utils/Inheritance.js

//=================================================================//
SceneItem = function(){
	this.name = 'none';
	this.x = 0;
	this.y = 0;
	// Draw item onto the canvas of a graph. Abstract.
	this.draw = function( graph ){alert('function SceneItem.draw is abstract');}
	// Set new position of the item 
	this.setPos = function(x, y){this.x = x;this.y = y;}
	// Move item by a vector
	this.moveBy = function(dx, dy){this.x += dx;this.y += dy;}
	// Implement this method to control item's position during animation
	this.posController = function( scene ) {}
	// Call this method to signal to the SceneGraph
	this.signal = function( item, sig ){}
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
Circle.prototype.draw = function(graph)
{
	ctx = graph.context;
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
	this.img.onload = "SingleImageonLoad()";
	var me = this;
	this.img.addEventListener('load',function(){
		me.signal(me,'load');
	},false);
}
SingleImage.inheritsFrom( SceneItem );
SingleImage.prototype.draw = function( graph )
{
	ctx = graph.context;
	ctx.drawImage( this.img, this.x, this.x );
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
TextString.prototype.draw = function( graph )
{
	ctx = graph.context;
	ctx.font = this.font;
	ctx.fillStyle = this.color;
	ctx.fillText( this.text, this.x, this.y );
}

//=================================================================//
function SceneNode()
{
	this.items = [];
	this.parentNode = null;
	this.angle = 0;
	this.xScale = 1;
	this.yScale = 1;
};
SceneNode.inheritsFrom( SceneItem );

SceneNode.prototype.add = function(item)
{
	this.items.push( item );
	var me = this;
	item.signal = function( item, sig ){
		me.processSignal( item, sig );
	};
	if ( item.items )
	{
		item.parentNode = this;
	}
}
SceneNode.prototype.draw = function( graph )
{
	ctx = graph.context;
	ctx.save();
	ctx.scale( this.xScale, this.yScale );
	ctx.rotate( this.angle );
	// translate after scale: x and y are in scaled units
	ctx.translate( this.x, this.y );
	var len = this.items.length;
	for(var i = 0; i < len; i += 1)
	{
		this.items[i].draw( graph );
	}
	ctx.restore();
}

SceneNode.prototype.processSignal = function( item, sig )
{
	if ( this.parentNode )
	{
		this.parentNode.processSignal( item, sig );
	}
	else
	{
		this.redraw();
	}
}

//=================================================================//
function SceneGraph(canvas_id,rwidth,rheight)
{
	this.canvas = document.getElementById(canvas_id)
	this.context = this.canvas.getContext("2d");
	this.movables = [];
	this.time = 0;
	this.startTime = 0;
	this.pauseTime = 0;
	this.animationOn = false;
	this.rate = 1000; 
	this.intval = 0;
	
	if ( rwidth )
	{
		this.rwidth = rwidth;
		this.xScale = this.canvas.width / rwidth;
	}
	else
	{
		this.rwidth = this.canvas.width;
		this.xScale = 1;
	}

	if ( rheight )
	{
		this.rheight = rheight;
		this.yScale = this.canvas.height / rheight;
	}
	else
	{
		this.rheight = this.canvas.height;
		this.yScale = 1;
	}
};
SceneGraph.inheritsFrom( SceneNode );

SceneGraph.prototype.redraw = function()
{
	// y axis points up
	ctx.setTransform(1,0,0,-1,0,this.canvas.height);
	this.draw( this );
}

// Adds item to the list of movable objects. The item must have been
// previously added to SceneGraph or any child node.
SceneGraph.prototype.setMovable = function( item )
{
	this.movables.push( item );
}

SceneGraph.prototype.run = function()
{
	if ( !this.animationOn )
	{
		clearInterval( this.intval );
		return;
	}
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	var date = new Date();
	var ct = date.getTime();
	this.time = ( ct - this.startTime ) / 1000;
	var len = this.movables.length;
	for(var i = 0; i < len; i += 1)
	{
		this.movables[i].posController( this );
	}
	this.redraw();
}

SceneGraph.prototype.start = function()
{
	if ( this.animationOn ) return;
	this.animationOn = true;
	this.time = 0;
	var date = new Date();
	this.startTime = date.getTime();
	this.pauseTime = this.startTime;
	var me = this;
	this.intval = setInterval( function(){
		me.run();
	}, this.rate );
}

SceneGraph.prototype.stop = function()
{
	this.animationOn = false;
}

SceneGraph.prototype.pause = function()
{
	if ( !this.animationOn ) return;
	this.animationOn = false;
	var date = new Date();
	var ct = date.getTime();
	this.pauseTime = ct;
}

SceneGraph.prototype.resume = function()
{
	if ( this.animationOn ) return;
	this.animationOn = true;
	var date = new Date();
	var ct = date.getTime();
	this.startTime += ct - this.pauseTime;
	var me = this;
	this.intval = setInterval( function(){
		me.run();
	}, this.rate );
}

