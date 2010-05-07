YUI.add('gallery-slider-value', function(Y) {

var HOST = "host",
	OUTPUT = "output",
	VALUE = "value";

function SliderValuePlugin(config) {
	SliderValuePlugin.superclass.constructor.apply(this, arguments);
}

SliderValuePlugin.NS = VALUE;
SliderValuePlugin.NAME = "sliderValuePlugin";
SliderValuePlugin.ATTRS = {
	host : {
		value : null,
		validator : function(val, name) {
			return !(Y.Lang.isNull(val));
		}
	},
	
	output : {
		value : null,
		setter : function(val, name) {
			return Y.one(val);
		}
	}
};

Y.extend(SliderValuePlugin, Y.Base, {
	_handle : null,
	_type : null,
	
	initializer : function(config) {
		this.set(OUTPUT, config.output);
		
		this._type = this.get(OUTPUT).get("nodeName").toLowerCase();
		
		//store Y.on handle for unsubscribing on destroy
		this._handle = this.get(HOST).after("valueChange", function() {
			var out = this.get(OUTPUT),
				val = this.get(HOST).get(VALUE);
			
			if(this._type === "input") {
				out.set(VALUE, val);
			} else if(this._type === "select") {
				var options = out.get("options"),
					i, l;
				
				for(i = 0, l = options.size(); i < l; i++) {
					if(options.item(i).get(VALUE) == val) {
						out.set("selectedIndex", i);
						return;
					}
				}
			} else {
				out.setContent(val);
			}
			
		}, this);
		
		return this;
	},
	
	destructor : function() {
		this._handle.detach();
	}
});

Y.SliderValuePlugin = SliderValuePlugin;



}, '@VERSION@' ,{requires:['base']});
