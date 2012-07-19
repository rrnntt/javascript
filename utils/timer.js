Timer = {
	on : false,  // on/off flag
	items : [],  // list of subscribed objects
	rate : 1000, 
	intval : 0,
	startTime : 0, // global start time in  milliseconds since 01.01.1970
	time : 0,    // time in seconds elapsed after start
	start : function(){
		if ( this.on ) return;
		this.on = true;
		this.time = 0;
		var date = new Date();
		this.startTime = date.getTime();
		this.intval = setInterval( RunTimer, this.rate );
	},
	stop : function(){
		this.on = false;
		this.startTime = 0;
		this.time = 0;
	},
	add : function( item ){
		var index = this.items.indexOf( item );
		if ( index < 0 )
		{
			this.items.push( item );
		}
	},
	resume : function(){
		if ( this.on ) return;
		this.on = true;
		this.intval = setInterval( RunTimer, this.rate );
	},
	remove : function( item ){
		var index = this.items.indexOf( item );
		if ( index >= 0 )
		{
			this.items.splice( index, 1 );
		}
		if ( this.items.length == 0 ) this.stop();
	}
}

RunTimer = function()
{
	if ( !Timer.on )
	{
		clearInterval( Timer.intval );
		return;
	}
	var date = new Date();
	var ct = date.getTime();
	Timer.time = ( ct - Timer.startTime ) / 1000;
	var len = Timer.items.length;
	for(var i = 0; i < len; i += 1)
	{
		Timer.items[i].run();
	}
}
