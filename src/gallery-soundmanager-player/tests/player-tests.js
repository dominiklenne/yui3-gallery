YUI.add("player-tests", function(Y) {
	
    Y.namespace("SoundManager").PlayerTests = new Y.Test.Case({
		name : "Player Tests",
		
        // SPECIAL INSTRUCTIONS
        
        _should : {
            ignore : {
                /*
                ".play() method should work" : true,
                ".pause() method should work" : true,
                ".stop() method should work" : true,
                "Clicking play should start playback" : true,
                "Clicking pause should pause playback" : true,
                "Clicking scrubber should advance playback" : true,
                "srcNode should be transformed into a div" : true,
                "AutoLoad should make sound start loading" : true,
                "Audio should be audible" : true,
                "Clicking on widget should start playback" : true,
                "Clicking on widget should pause playback" : true,
                "Enabling scrubber should render a scrubber" : true,
                "Enabling volume control should render a volume control" : true,
                "Setting URL but not a Title should generate a title" : true,
                "Clicking on volume button should show the volume bar" : true,
                "Clicking on volume bar should change volume" : true,
                "Scrubber keyboard commands should work" : true,
                "Volume keyboard commands should work" : true,
                "Clicking on scrubber of unloaded player should start loading audio" : true
                */
            }
        },
        
        // SET UP
		setUp : function() {
			this.container = Y.one("#test-container");
			this.mp3 = Y.one("#testmp3");
            
            this.widgets = [];
			
			this.newMP3 = function() {
				var mp3 = this.mp3.cloneNode(true),
					id;
				
				mp3.set("id", "");
				mp3.set("id", Y.Event.generateId(Y.Node.getDOMNode(mp3)));
				
				this.container.append(mp3);
				
				return mp3;
			};
			
			this.argBuilder = function(mp3, args) {
				return Y.merge({
					srcNode : "#" + mp3.get("id"), 
					js : "soundmanager2-nodebug-jsmin.js",
					volume : 5
				}, args);
			};
			
			this.container.removeClass("hide");
		},
        
        // TEAR DOWN
		tearDown : function() {
			this.container.addClass("hide");
			
			delete this.container;
			delete this.mp3;
            
            Y.each(this.widgets, function(w) {
                if(w && typeof w.destroy === "function") {
                    w.destroy();
                }
            });
		},
		
        ".play() method should work" : function() {
            var mp3 = this.newMP3(), 
                w = new Y.SoundManager.Player(this.argBuilder(mp3)).render(),
                hasClass;
			
            this.widgets.push(w);
            
            w.on("play", function(e) {
                this.resume(function() {
                    Y.assert(w._cb.hasClass(w.getClassName("playing")));
                });
            }, this);
            
            w.play();
            
			this.wait(5000);
        },
        
        ".pause() method should work" : function() {
            var mp3 = this.newMP3(), 
                w = new Y.SoundManager.Player(this.argBuilder(mp3)).render(),
                hasClass;
			
            this.widgets.push(w);
            
            w.on("play", function() {
                w.pause();
            });
            
            w.on("pause", function() {
                this.resume(function() {
                    Y.assert(w._cb.hasClass(w.getClassName("paused")));
                });
            }, this);
            
            w.play();
            
			this.wait(5000);
        },
        
        ".stop() method should work" : function() {
            var mp3 = this.newMP3(), 
                w = new Y.SoundManager.Player(this.argBuilder(mp3)).render(),
                hasClass;
			
            this.widgets.push(w);
            
            w.on("play", function() {
                w.stop();
            });
            
            w.on("stop", function() {
                this.resume(function() {
                    Y.assert(w._cb.hasClass(w.getClassName("stopped")));
                });
            }, this);
            
            w.play();
            
			this.wait(5000);
        },
        
		"Clicking play should start playback" : function() {
            var mp3 = this.newMP3(), 
                w = new Y.SoundManager.Player(this.argBuilder(mp3)).render(),
                hasClass;
			
            this.widgets.push(w);
            
            w.on("play", function() {
                this.resume(function() {
                    Y.assert(w._cb.hasClass(w.getClassName("playing")));
                });
            }, this);
            
            w.after("bind", function() {
                Y.one("#" + mp3.get("id") + " a").simulate("click");
			}, this);
            
			this.wait(5000);
		},
        
        "Clicking pause should pause playback" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3)).render(),
                hasClass;
			
            this.widgets.push(w);
            
            w.on("play", function() {
                w._cb.one("." + w.getClassName("play")).simulate("click");
            }, this);
            
            w.on("pause", function() {
                this.resume(function() {
                    Y.assert(w._cb.hasClass(w.getClassName("paused")));
                });
            }, this);
            
            w.play();
            
            this.wait(5000);
        },
        
        "Clicking scrubber should advance playback" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { scrubber : true })),
                scrubber;
			
            this.widgets.push(w);
            
			w.on("id3Load", function() {
				this.resume(function() {
					this.wait(function() {
						scrubber = w._cb.one("." + w.getClassName("scrubber"));
						scrubber.simulate("mousedown", { clientX : (scrubber.getX() + Math.floor(Math.random() * parseInt(scrubber.getComputedStyle("width"), 10))) });
						
						//so that position will be updated
						w.play();
						
						w._sound(function(sound) {
							Y.assert(sound.position > 0, "Sound's position was zero: " + sound.position);
						});
					}, 2000);
				});
			}, this);
			
			w.render();
			
            w._sound(function(sound) { 
				sound.load();
			});
			
			this.wait(10000);
        },
        
        "Progressive enhancement of link should work" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3)).render(),
                isDiv;
			
            this.widgets.push(w);
            
            Y.assert(w.get("boundingBox").test("div"));
		},
        
        "Setting up without a link should work" : function() {
            var w = new Y.SoundManager.Player({ volume: 5, js : "soundmanager2.js", url : "04 - Alestorm - Keelhauled.mp3" }).render("#test-container");
            
            this.widgets.push(w);
            
            Y.assert(w.get("boundingBox").test("div"));
        },
        
        "AutoLoad should make sound start loading" : function() {
			var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { autoLoad : true }));
			
            this.widgets.push(w);
            
            //watch for both load & id3 load, to get out of here asap
            w.on("id3Load", function() {
                this.resume(function() {
                    return true; //we got the ID3 tag, so it totally worked
                });
            }, this);
            
            w.on("soundLoad", function() {
                this.resume(function() {
                    Y.assert(w._s.bytesLoaded > 0, "Should have loaded some bytes");
                });
            }, this);
            
            w.render();
            
            this.wait(15000);
        },
		
		"Audio should be audible" : function() {
			var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { volume : 50 })).render();
			
            this.widgets.push(w);
			
			w.play();
			
			this.wait(function() {
				w.stop();
			}, 1000);
		},
        
        "Clicking on widget should start playback" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3)).render();
			
            this.widgets.push(w);
            
            w.on("play", function() {
                this.resume(function() {
                    Y.assert(w._cb.hasClass(w.getClassName("playing")));
                });
            }, this);
            
            w._cb.simulate("click");
            
			this.wait(5000);
        },
        
        "Clicking on widget should pause playback" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3));
			
            this.widgets.push(w);
            
            w.on("play", function() {
                w._cb.simulate("click");
            }, this);
            
            w.on("pause", function() {
                this.resume(function() {
                    Y.assert(w._cb.hasClass(w.getClassName("paused")));
                });
            }, this);
            
            w.render();
            w.play();
            
			this.wait(5000);
        },
        
        "Enabling scrubber should render a scrubber" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { scrubber : true })).render();
			
            this.widgets.push(w);
            
            Y.assert(w._cb.one("." + w.getClassName("scrubber")).test("div"));
        },
        
        "Enabling volume control should render a volume control" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { volumeControl : true })).render();
			
            this.widgets.push(w);
            
            Y.assert(w._cb.one("." + w.getClassName("volume-btn")).test("a") && 
                     w._cb.one("." + w.getClassName("volume")).test("div"));
        },
        
        "Setting URL but not a Title should generate a title" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { volumeControl : true })).render();
			
            this.widgets.push(w);
            
            Y.assert(w.get("title") && w.get("title") != "");
        },
        
        "Clicking on volume button should show the volume bar" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { volumeControl : true })).render();
                
            this.widgets.push(w);
            
            w._cb.one("." + w.getClassName("volume-btn")).simulate("click");
            
            Y.assert(w._cb.hasClass(w.getClassName("volume-open")) && 
                     (w._cb.one("." + w.getClassName("volume")).getStyle("display") == "block"));
        },
        
        "Clicking on volume bar should change volume" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { volumeControl : true })).render(),
                volume = w.get("volume"),
                volBar = w._cb.one("." + w.getClassName("volume"));
            
            this.widgets.push(w);
            
            w.after("volumeChange", function() {
                this.resume(function() {
                    Y.assert(volume != w.get("volume"));
                });
            }, this);
            
            w._cb.one("." + w.getClassName("volume-btn")).simulate("click");
            
            volBar.simulate("mousedown", { clientX : (volBar.getX() + Math.floor(Math.random() * parseInt(volBar.getComputedStyle("width"), 10))) });
            
            this.wait(5000);
        },
        
        "Scrubber keyboard commands should work" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { scrubber : true }));
			
            this.widgets.push(w);
            
			w.on("id3Load", function() {
				this.resume(function() {
					this.wait(function() {
						w._cb.one("." + w.getClassName("play")).simulate("keydown", { keyCode : 39 });
						
						//so that position will be updated
						w.play();
						
						w._sound(function(sound) {
							Y.assert(sound.position > 0, "Sound's position was zero: " + sound.position);
						});
					}, 2000);
				});
			}, this);
			
			w.render();
			
            w._sound(function(sound) { 
				sound.load();
			});
			
			this.wait(10000);
        },
        
        "Volume keyboard commands should work" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { volumeControl : true })).render(),
                volume = w.get("volume");
            
            this.widgets.push(w);
            
            w.after("volumeChange", function() {
                this.resume(function() {
                    Y.assert(volume != w.get("volume"));
                });
            }, this);
            
            w._cb.one("." + w.getClassName("volume-btn")).simulate("keydown", { keyCode : 39 });
            
            this.wait(5000);
        },
        
        "Clicking on scrubber of unloaded player should start loading audio" : function() {
            var mp3 = this.newMP3(),
                w = new Y.SoundManager.Player(this.argBuilder(mp3, { scrubber : true })),
                scrubber;
			
            this.widgets.push(w);
            
            //watch for both load & id3 load, to get out of here asap
            w.on("id3Load", function() {
                this.resume(); 
            }, this);
            
            w.render();
            
            scrubber = w._cb.one("." + w.getClassName("scrubber"));
            scrubber.simulate("mousedown", { clientX : (scrubber.getX() + Math.floor(Math.random() * parseInt(scrubber.getComputedStyle("width"), 10))) });
            
            this.wait(15000);
        }
	});
    
    
}, "@VERSION@", { requires : [ "soundmanager-player", "test", "node-event-simulate" ] });