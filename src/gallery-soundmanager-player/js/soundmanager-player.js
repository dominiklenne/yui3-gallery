var NAME = "SMPlayer",
    classBase = Y.ClassNameManager.getClassName(NAME.toLowerCase(), "a").slice(0, -1),
    selectorClassBase = "." + classBase,
    
    //Strings pulled out for compression
    //TODO: actually replace these...
    s_LOAD = "load",
    s_FAIL = "fail",
    s_URL = "url",
    s_TITLE = "title",
    s_BOUNDING_BOX = "boundingBox",
    s_CONTENT_BOX = "contentBox",
    s_PLAY = "play",
    s_ELAPSED = "elapsed",
    s_TOTAL = "total",
    s_SCRUBBER = "scrubber",
    s_BAR = "bar",
    s_LOAD_BAR = "loadbar",
    s_VOL_BAR = "volbar",
    s_PLAY_BAR = "playbar",
    s_VOLUME_CONTROL = "volumeControl",
    s_TIME_CONTROL = "timeControl",
    s_POSITION = "position",
    S_WIDTH = "width";

Y.namespace("SoundManager").Player = Y.Base.create(NAME, Y.Widget, [], {
    
    _cb : null,
    _sm : null,
    _smInit : null,
    _s : null,
    _loadFail : null,
    _drag : null,
    
    //STANDARD WIDGET METHODS
    
    initializer : function() {
        var globalEventArgs = { broadcast : 2, fireOnce : true, emitFacade : true },
            split;
        
        //publish some global events to manage soundmanager library loading
        Y.Global.publish(this.name + ":load", globalEventArgs);
        Y.Global.publish(this.name + ":fail", globalEventArgs);
        
        //subscribe to our own global events
        Y.Global.on(this.name + ":load", this._smLoaded, this);
        Y.Global.on(this.name + ":fail", this._smFailure, this);
        
        //check if sound manager's already loaded
        if(!Y.config.win.soundManager && typeof Y.config.win.SM2_DEFER === "undefined") {
            Y.config.win.SM2_DEFER = true; //enable deferred loading for SM
            
            this._smLoad();
        }
        
        //trigger title generation if it didn't happen
        if(this.get("url") && !this.get("title")) {
            this.set("url", this.get("url"));
        }
    },
    
    destructor : function() { 
        //destroy sound object if it exists
        if(this._s && typeof this._s.destruct === "function") {
            this._s.destruct();
        }
        
        //null out dom refs & flags
        this._cb = this._sm = this._smInit = this._s = this._loadFailr = this._drag = null;
    },
    
    //generate widget markup
    renderUI : function() {
        var bb = this.get("boundingBox"),
            cb = this.get("contentBox"),
            div = Y.Node.create(Y.substitute(
                this.get("BASIC_TEMPLATE"), { 
                    id : cb.get("id"), 
                    className : cb.get("className"), 
                    title : this.get("title"), 
                    playBtnClass : classBase + "play",
                    titleClass : classBase + "title",
                    time : (this.get("time") ?
                        Y.substitute(this.get("TIME_CONTAINER_TEMPLATE"), {
                            timeClass : classBase + "time",
                            time : Y.substitute(this.get("TIME_TEMPLATE"), {
                                elapsedClass : classBase + "elapsed",
                                separatorClass : classBase + "separator",
                                totalClass : classBase + "total",
                                elapsed : "0:00",
                                total : "0:00"
                            })
                        }) : ""
                    ),
                    scrubber : (this.get("scrubber") ? 
                        Y.substitute(this.get("SCRUBBER_TEMPLATE"), {
                            scrubberClass : classBase + "scrubber",
                            barClass : classBase + "bar",
                            loadbarClass: classBase + "loadbar",
                            playbarClass: classBase + "playbar"
                        }) : ""
                    ),
                    volumeBtn : (this.get("volumeControl") ?
                        Y.substitute(this.get("VOLUME_BTN_TEMPLATE"), {
                            volumeBtnClass : classBase + "volume-btn"
                        }) : ""
                    ),
                    volumeBar : (this.get("volumeControl") ?
                        Y.substitute(this.get("VOLUME_BAR_TEMPLATE"), {
                            volumeClass : classBase + "volume",
                            barClass : classBase + "bar",
                            volbarClass : classBase + "volbar"
                        }) : ""
                    )
                }
            ));
        
        bb.addClass(classBase + "loading");
        
        if(this.get("time")) {
            bb.addClass(classBase + "time-on");
        }
        
        if(this.get("scrubber")) {
            bb.addClass(classBase + "scrubber-on");
        }
        
        if(this.get("volumeControl")) {
            bb.addClass(classBase + "volume-on");
        }
        
        
        bb.append(div);
        
        //can't change contentBox to something more useful than an <a> so remove it & ignore it from now on
        cb.remove();
        
        this._cb = div;
    },
    
    //bind events to markup
    bindUI : function() {
        //use the defaultFn method to enable subscribers to listen to both .on & .after, this is a neat trick
        this.publish("bind", {
            fireOnce : true,
            defaultFn : Y.bind(function() {
                var bb = this.get("boundingBox"),
                    toggle = (!this.get("scrubber") && !this.get("volumeControl")) ? bb : bb.one(selectorClassBase + "play"),
                    sliderPos = function(x, tgt) {
                        return (x - tgt.getX()) / parseInt(tgt.getComputedStyle("width"), 10);
                    },
                    barSet = Y.bind(function(pos, target) {
                        if(target.test(selectorClassBase + "scrubber")) {
                            scrubberSetter(pos);
                        } else {
                            this.set("volume", Math.floor(pos * 100));
                        }
                    }, this),
                    scrubberSetter = Y.bind(function(pos) {
                        this._sound(function(sound) {
                            if(sound.readyState === 0) {
                                sound.load();
                            }
                            
                            pos = Math.floor(pos * ((sound.readyState === 1) ? sound.durationEstimate : sound.duration));
                            
                            //can't seek further than we've loaded, so max at the currently loaded amount if trying to go too far
                            pos = (pos > sound.duration) ? sound.duration : pos;
                            
                            this.set("position", pos);
                        });
                    }, this),
                    mouseHandler = function(e, tgt) {
                        e.preventDefault();
                        
                        tgt = tgt || e.currentTarget;
                        
                        if(e.type === "mousedown") {
                            this._drag = true;
                            
                            barSet(sliderPos(e.clientX, tgt), tgt);
                        } else if(e.type === "mouseup") {
                            this._drag = false;
                        } else if(e.type === "mouseout") {
                            this._drag = false;
                        } else if(e.type === "mousemove") {
                            if(this._drag) {
                                barSet(sliderPos(e.clientX, tgt), tgt);
                            }
                        }
                    },
                    bars, title, scrubber;
                
                bars = bb.all(selectorClassBase + "bar");
                
                if(bars.size()) {
                    bars.on("mousedown", mouseHandler, this);
                    bars.on("mouseup", mouseHandler, this);
                    bars.on("mousemove", mouseHandler, this);
                    bars.on("mouseleave", mouseHandler, this);
                }
                
                if(this.get("scrubber")) {
                    scrubber = bb.one(selectorClassBase + "scrubber");
                    
                    //only attach if timeControl is active
                    //TODO: this is too tightly coupled to the display!
                    if(!this.get("timeControl")) {
                        title = bb.one(selectorClassBase + "title");
                        title.on("mousedown", mouseHandler, this, scrubber);
                        title.on("mouseup", mouseHandler, this, scrubber);
                        title.on("mousemove", mouseHandler, this, scrubber);
                    }
                    
                    //handle left/right keys while play button is focused
                    Y.on("key", function(e) {
                        
                        this._sound(function(sound) {
                            var max = (sound.readyState === 1) ? sound.durationEstimate : sound.duration, //figure out maximum size
                                change = 15000 / max, //figure out what percentage of the total 15 seconds is
                                pos = ((this.get("position") || 0) / max) + ((e.keyCode === 37) ? -1 * change : change); //positive/negative change based on key pressed
                            
                            //TODO: nested ternary ops aren't as friendly as they could be...
                            pos = (pos > 1) ? 1 : ((pos < 0) ? 0 : pos);
                            
                            //NOTE: scrubberClick expects a value between 0 - 1
                            scrubberSetter(pos || 0);
                        });
                        
                    }, this._cb.one(selectorClassBase + "play"), "down:39,37", this);
                }
                
                if(this.get("volumeControl")) {
                    volBar = bb.one(selectorClassBase + "volume");
                    
                    bb.one(selectorClassBase + "volume-btn").on("click", function(e) {
                        e.preventDefault();
                        
                        this._cb.toggleClass(classBase + "volume-open");
                    }, this);
                    
                    //handle left/right keys while volume button is focused
                    Y.on("key", function(e) {
                        var vol = this.get("volume"),
                            change = (e.keyCode === 37) ? -10 : 10;
                        
                        //TODO: nested ternary ops aren't as friendly as they could be...
                        this.set("volume", (vol + change > 100) ? 100 : (vol + change < 0) ? 0 : vol + change);
                    }, this._cb.one(selectorClassBase + "volume-btn"), "down:39,37", this);
                }
                
                toggle.on("click", function(e) {
                    e.preventDefault();
                    
                    this.toggle();
                }, this);
                
                //Need to destroy the old sound file & create a new one
                this.after("urlChange", function() {
                    //update UI
                    this.stop();
                    
                    //destroy old sound file
                    this._sound(function(sound) {
                        sound.destruct();
                        this._s = null;
                        
                        //start a new one generating
                        this._sound();
                    });
                });
                
                //Update widget title
                this.after("titleChange", function(e) {
                    this._cb.one(selectorClassBase + "title").setContent(e.newVal);
                });
                
                //update song position
                this.after("positionChange", function(e) {
                    this._sound(function(sound) {
                        sound.setPosition(e.newVal); //update flash
                        this.syncUI(); //update UI
                    });
                }, this);
                
                //update song volume (assuming it exists)
                this.after("volumeChange", function(e) {
                    this._sound(function(sound) {
                        sound.setVolume(e.newVal);
                        
                        this.syncUI();
                    });
                });
                
            }, this)
        });
        
        this.fire("bind");
    },
    
    syncUI : function() { 
        var sound = this._s,
            pos, vol, btn, elapsed, total, timeize;
        
        //only care about this once the sound object exists & we're showing a scrubber
        if(sound && this.get("scrubber")) {
            //IT IS INTENTIONAL THAT BOTH BARS CAN BE UPDATING AT ONCE, DON'T BREAK THAT OK
            
            //if loading update that bar
            if(sound.readyState === 1) {
                this._cb.one(selectorClassBase + "loadbar").setStyle("width", Math.floor((sound.bytesLoaded / sound.bytesTotal) * 100) + "%");
            }
            
            //if the sound is currently playing use that position, otherwise use our cache
            pos = (sound.playState === 1 && sound.readyState >= 1) ? sound.position : this.get("position");
            
            this._cb.one(selectorClassBase + "playbar").setStyle("width", (((pos / ((sound.readyState === 1) ? sound.durationEstimate : sound.duration)) * 100) || 0) + "%");
        }
        
        if(this.get("volumeControl")) {
            vol = this.get("volume");
            btn = this._cb.one(selectorClassBase + "volume-btn");
            
            this._cb.one(selectorClassBase + "volbar").setStyle("width", vol + "%");
            
            if(vol > 50) {
                btn.removeClass("(" + classBase + "volume-half" + "|" + classBase + "volume-zero" + ")");
            } else if(vol > 5) {
                btn.replaceClass(classBase + "volume-zero", classBase + "volume-half");
            } else {
                btn.replaceClass(classBase + "volume-half", classBase + "volume-zero");
            }
        }
        
        if(sound && this.get("time")) {
            timeize = function(val) {
                val = val / 1000;
                return Math.floor(val / 60) + ":" + ((val % 60 < 10) ? "0" : "") + Math.floor(val % 60);
            };
            
            elapsed = (sound.position) ? sound.position : this.get("position");
            total = (sound.readyState === 1) ? sound.durationEstimate : sound.duration;
            
            this._cb.one(selectorClassBase + "elapsed").setContent(timeize(elapsed));
            this._cb.one(selectorClassBase + "total").setContent(timeize(total));
        }
    },
    
    //CUSTOM PUBLIC METHODS
    
    toggle : function() {
        this._sound(function(sound) {
            if(sound.playState === 0 || sound.paused) {
                this.play();
            } else {
                this.pause();
            }
        });
    },
    
    play : function() {
        this._sound(function(sound) {
            sound.play();
            this._cb.replaceClass("(" + classBase + "stopped" + "|" + classBase + "paused" + ")", classBase + "playing");
            
            this.fire("play");
        });
    },
    
    pause : function() {
        this._sound(function(sound) {
            sound.pause();
            this._cb.replaceClass(classBase + "playing", classBase + "paused");
            
            this.fire("pause");
        });
    },
    
    stop : function() {
        this._sound(function(sound) {
            sound.stop();
            this._cb.replaceClass("(" + classBase + "paused" + "|" + classBase + "playing" + ")", classBase + "stopped");
            
            this.fire("stop");
        });
    },
    
    //CUSTOM FAKE PRIVATE METHODS
    
    _smLoad : function() {
        //go get SM JS
        Y.Get.script(this.get("js"), {
            onSuccess : function() {
                //set up SM
                Y.config.win.soundManager = new SoundManager();
                
                this._sm = Y.config.win.soundManager;
                this._sm.consoleOnly = true;
                this._sm.beginDelayedInit();
                
                //listen for SM to be ready & then fire the global event
                this._sm.onready(Y.bind(function(o) {
                    Y.Global.fire(this.name + ((o.success) ? ":load" : ":fail"));
                }, this));
            },
            
            onFailure : function() {
                Y.Global.fire(this.name + ":fail");
            },
            
            context : this
        });
    },
    
    //callback for SoundManager lib load failure
    _smFailure : function() {
        var out = (console && console.error) ? console.error : alert;
        out("Failed to load SoundManager using JS url " + this.get("js") + " & SWF url " + this.get("swf"));
        
        delete Y.config.win.soundManager;
        delete Y.config.win.SM2_DEFER;
        
        /*
        console.log("_loadFail: %o", this._loadFail); //TODO: REMOVE DEBUGGING
        
        if(this._loadFail && typeof this._loadFail.cancel === "function") {
            this._loadFail.cancel();
        }
        */
        
        //TODO: figure out how to safely do this, right now every widget instance will try to re-load their own version (VERY BAD OK)
        //TODO: Does this actually work? Seems sketchy!
        //this._loadFail = Y.later(Math.random() * 5000, this, this.initializer);
    },
    
    //callback for SoundManager lib load success
    _smLoaded : function() {
        this._smInit = true;
        this._sm = Y.config.win.soundManager;
        
        //start loading the mp3
        if(this.get("autoLoad")) {
            this._sound();
        }
        
        //these references don't exist until render is done, so have to wrap this
        this.after("render", function() {
            this.get("boundingBox").removeClass(classBase + "loading");
            this._cb.addClass(classBase + "stopped");
        }, this);
    },
    
    //async method for getting a handle to the SM api, returns immediately if the api is already initialized.
    _api : function(callback) {
        var func = Y.bind(callback, this);
        
        if(this._smInit) {
            func(this._sm);
        } else {
            Y.Global.on(this.name + ":load", function() {
                func(this._sm);
            }, this);
        }
    },
    
    //async method for getting the sound object. Returns immediately if it exists, otherwise will wait for the SM api to be ready
    //& then create a new sound object
    _sound : function(callback) {
        var func = (typeof callback === "function") ? Y.bind(callback, this) : function() {};
        
        if(this._s) {
            func(this._s);
        } else {
            this._api(function(api) {
                var sync = (this.get("scrubber") || this.get("time")) ? Y.bind(this.syncUI, this) : function() {};
                
                this._s = api.createSound({
                    id : this.get("contentBox").get("id"),
                    url : this.get("url"),
                    volume : this.get("volume"),
                    whileloading : sync,
                    whileplaying : sync,
                    onload : Y.bind(function(result) {
                        if(this._s.readyState == 3 && this._s.bytesLoaded > 0) {
                            this.fire("soundLoad");
                        }
                    }, this),
                    onid3 : Y.bind(function() {
                        this.fire("id3Load");
                    }, this),
                    onfinish : Y.bind(function() {
                        this.set("position", 0);
                        this.stop();
                    }, this)
                });
                
                if(this.get("autoLoad")) {
                    this._s.load();
                }
                
                func(this._s);
            });
        }
    }
}, {
    NAME : NAME,
    ATTRS : {
        js : {
            value : "soundmanager2.js"
        },
        
        swf : {
            value : null
        },
        
        url : {
            value : "",
            setter : function(val) {
                if(val && !this.get("title")) {
                    var split = val.split("/");
                    
                    this.set("title", split[split.length - 1]);
                }
                
                return val;
            }
        },
        
        title : {
            value : ""
        },
        
        autoLoad : {
            value : false 
        },
        
        scrubber : { 
            value : false
        },
        
        volumeControl : {
            value : false
        },
        
        time : {
            value : true
        },
        
        position : {
            value : 0,
            validator Y.Lang.isNumber
        },
        
        volume : {
            value : 50,
            validator Y.Lang.isNumber
        },
        
        BASIC_TEMPLATE : {
            value : "<div id='{id}' class='{className}'><p class='{titleClass}'>{title}</p><a href='#player' class='{playBtnClass}'>Play</a>{volumeBtn}{time}{scrubber}{volumeBar}</div>"
        },
        
        SCRUBBER_TEMPLATE : {
            value : "<div class='{scrubberClass} {barClass}'><div class='{loadbarClass}'>&nbsp;</div><div class='{playbarClass}'>&nbsp;</div></div>"
        },
        
        TIME_TEMPLATE : {
            value : "<span class='{elapsedClass}'>{elapsed}</span> <span class='{separatorClass}'>/</span> <span class='{totalClass}'>{total}</span>"
        },
        
        TIME_CONTAINER_TEMPLATE : {
            value : "<p class='{timeClass}'>{time}</p>"
        },
        
        VOLUME_BTN_TEMPLATE : {
            value : "<a href='#volume' class='{volumeBtnClass}'>Volume</a>"
        },
        
        VOLUME_BAR_TEMPLATE : {
            value : "<div class='{volumeClass} {barClass}'><div class='{volbarClass}'>&nbsp;</div></div>"
        }
    },
    
    HTML_PARSER : {
        url : function(node) {
            return node.getAttribute("href");
        },
        
        title : function(node) {
            var title = node.getAttribute("title");
            return title || null;
        },
        
        scrubber : function(node) {
            return node.hasClass("scrubber");
        },
        
        time : function(node) {
            return !node.hasClass("no-time");
        },
        
        volumeControl : function(node) {
            return node.hasClass("volume");
        },
        
        autoLoad : function(node) {
            return node.hasClass("autoload");
        }
    }
});