YUI.add("gallery-slider-value",function(E){var B="host",C="output",D="value";function A(F){A.superclass.constructor.apply(this,arguments);}A.NS=D;A.NAME="sliderValuePlugin";A.ATTRS={host:{value:null,validator:function(G,F){return !(E.Lang.isNull(G));}},output:{value:null,setter:function(G,F){return E.one(G);}}};E.extend(A,E.Base,{_handle:null,_type:null,initializer:function(F){this.set(C,F.output);this._type=this.get(C).get("nodeName").toLowerCase();this._handle=this.get(B).after("valueChange",function(){var I=this.get(C),K=this.get(B).get(D);if(this._type==="input"){I.set(D,K);}else{if(this._type==="select"){var H=I.get("options"),J,G;for(J=0,G=H.size();J<G;J++){if(H.item(J).get(D)==K){I.set("selectedIndex",J);return;}}}else{I.setContent(K);}}},this);return this;},destructor:function(){this._handle.detach();}});E.SliderValuePlugin=A;},"@VERSION@",{requires:["base"]});