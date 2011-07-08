YUI.add("overlay-transition-tests", function(Y) {

    var plugin = Y.Plugin.TransitionOverlay;

    Y.namespace('Tests').OverlayTransition = new Y.Test.Suite('Overlay Transition Tests').add(
        new Y.Test.Case({
            setUp : function() {
                this.overlay = new Y.Overlay({
                    width : "500px",
                    bodyContent : "Overlay Content",
                    render : true,
                    centered : true,
                    visible : false
                });
            },
            
            tearDown : function() {
                this.overlay.destroy();
                
                this.overlay = null;
                delete this.overlay;
            },
            
            'default should adjust opacity' : function() {
                this.overlay.get("boundingBox").setStyle({ opacity : 0 });
                
                this.overlay.plug(plugin);
                this.overlay.show();
                
                this.wait(function() {
                    var opacity = parseInt(this.overlay.get("boundingBox").getComputedStyle("opacity"), 10);
                    
                    Y.assert( opacity === 1, "Opacity wasn't 1");
                }, 1000);
            },
            
            'events should fire as expected' : function() {
                var start = false;
                
                this.overlay.plug(plugin);
                
                this.overlay.transitionPlugin.on("start", function() {
                    start = true;
                });
                
                this.overlay.transitionPlugin.on("end", function() {
                    this.resume(function() {
                        Y.assert(start, "start method didn't fire");
                    });
                }, this);
                
                this.overlay.show();
                
                this.wait(1000);
            },
            
            'other properties should work' : function() {
                this.overlay.plug(plugin, { 
                    show : { 
                        height : "400px" 
                    }, 
                    hide : { 
                        height : 0 
                    } 
                });
                
                this.overlay.show();
                
                this.wait(function() {
                    var height = parseInt(this.overlay.get("boundingBox").getComputedStyle("height"), 10);
                    
                    Y.assert(height > 0, "Height should be > 0, was " + height);
                    Y.assert(height < 400, "Height should be less than the max, was " + height);
                }, 100);
            },
            
            'custom duration should work' : function() {
                this.overlay.plug(plugin, {
                    duration : 1
                });
                
                this.overlay.show();
                
                this.wait(function() {
                    Y.assert(this.overlay.get("visible"), "Overlay should be visible");
                    Y.assert(this.overlay.get("boundingBox").getComputedStyle("opacity") != 1, "Opacity should not be 1");
                    Y.assert(!this.overlay.get("boundingBox").hasClass(this.overlay.getClassName("hidden")), "Overlay shouldn't have hidden class");
                }, 500);
            },
            
            'per-transition duration should override global duration' : function() {
                var start = 
                
                this.overlay.plug(plugin, {
                    show : {
                        opacity : 1,
                        duration : 1
                    }
                });
                
                this.overlay.show();
                
                this.wait(function() {
                    Y.assert(this.overlay.get("visible"), "Overlay should be visible");
                    Y.assert(this.overlay.get("boundingBox").getComputedStyle("opacity") != 1, "Opacity should not be 1");
                    Y.assert(!this.overlay.get("boundingBox").hasClass(this.overlay.getClassName("hidden")), "Overlay shouldn't have hidden class");
                }, 500);
            },
            
            'overlay.show() should work' : function() {
                this.overlay.plug(plugin);
                
                this.overlay.show();
                
                this.wait(function() {
                    Y.assert(this.overlay.get("visible"), "Overlay should be visible");
                    Y.assert(this.overlay.get("boundingBox").getComputedStyle("opacity") == 1, "Opacity should be 1");
                    Y.assert(!this.overlay.get("boundingBox").hasClass(this.overlay.getClassName("hidden")), "Overlay shouldn't have hidden class");
                }, 500);
            },
            
            'overlay.hide() should work' : function() {
                this.overlay.plug(plugin, { 
                    show : {
                        duration : 0
                    }
                });
                
                this.overlay.show();
                this.overlay.hide();
                
                this.wait(function() {
                    Y.assert(!this.overlay.get("visible"));
                    Y.assert(this.overlay.get("boundingBox").getComputedStyle("opacity") == 0);
                    Y.assert(this.overlay.get("boundingBox").hasClass(this.overlay.getClassName("hidden")));
                }, 500);
            },
            
            'disabling styleOverride should work' : function() {
                this.overlay.plug(plugin, { styleOverride : false });
                
                this.overlay.show();
                
                this.wait(function() {
                    Y.assert(this.overlay.get("visible"));
                    Y.assert(this.overlay.get("boundingBox").getComputedStyle("opacity") == 1);
                    Y.assert(!this.overlay.get("boundingBox").hasClass(this.overlay.getClassName("hidden")));
                }, 500);
            }
        }));
}, "@VERSION@", { requires : [ 
    "test",
    "overlay",
    "gallery-overlay-transition"
] });