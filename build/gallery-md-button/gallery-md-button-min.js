YUI.add("gallery-md-button",function(c){var e=c.Lang,i="press",h="callback",j="deselectedCallback",f="selected",b="boundingBox",p="contentBox",t="default",s="disabled",a="href",d="icon",o="title",g="value",u="label",r="innerHTML",q="push",v="submit",l="reset",m="type",n="left",k="right";c.Button=c.Base.create("button",c.Widget,[c.MakeNode],{BOUNDING_TEMPLATE:"<a />",CONTENT_TEMPLATE:null,_prevIconClassName:"",renderUI:function(){this.get(b).append(this._makeNode());this._locateNodes(u,d);},_afterDocumentMouseup:function(){this.get(b).removeClass(this._classNames.pressed);},_afterBoundingBoxMousedown:function(){if(!this.get(s)){this.get(b).addClass(this._classNames.pressed);}},_uiSetTitle:function(w){this.get(b).set(o,w);},_uiSetDefault:function(x){var w=this.get(b);if(x){w.addClass(this._classNames[t]);w.setAttribute(t,t);}else{w.removeClass(this._classNames[t]);w.set(t,"");}},_uiSetIcon:function(x){x=x||"none";var w=this._classNames[d]+"-"+x;this.get(b).replaceClass(this._prevIconClassName,w);this._prevIconClassName=w;},_uiSetIconPosition:function(w){var x=this._classNames;this.get(p).replaceClass(x[d+(w===n?k:n)],x[d+w]);},_uiSetLabel:function(w){if(!w||w===""){this.get(b).addClass(this._classNames.noLabel);}else{this.get(b).removeClass(this._classNames.noLabel);}this._labelNode.setContent(w||"");},_uiSetHref:function(w){this.get(b).set(a,w);},_afterBoundingBoxClick:function(x){var w=this.get(a);if(this.get(s)){x.preventDefault();return;}if(!w||w==="#"){x.preventDefault();}this.fire(i,{click:x});},_defPressFn:function(x){if(!this.get(s)){var w=this.get(h)||this._callbackFromType();if(w){w.apply(this,x);}}},_callbackFromType:function(){var w=this.get(b),x=w.ancestor("form");if(x){switch(this.get(m)){case v:return c.bind(x[v],x);case l:return c.bind(x[l],x);}}return null;}},{PUSH:q,SUBMIT:v,RESET:l,LEFT:n,RIGHT:k,_TEMPLATE:['<span class="{c icon}"></span>','<span class="{c label}">{@ label}</span>'].join("\n"),_CLASS_NAMES:["pressed",t,"no-label",u,d,d+n,d+k],_EVENTS:{boundingBox:["click","mousedown"],document:"mouseup"},_PUBLISH:{press:{defaultFn:"_defPressFn"}},ATTRS:{label:{value:"",validator:e.isString},callback:{validator:e.isFunction},"default":{value:false,validator:e.isBoolean},icon:{value:null,validator:function(w){return e.isString(w)||e.isNull(w);}},iconPosition:{value:n,validator:function(w){return w===n||w===k;}},href:{value:null},title:{value:"",validator:e.isString},type:{value:q,validator:e.isString,lazyAdd:false}},_ATTRS_2_UI:{BIND:[u,d,o,a,t,"iconPosition"],SYNC:[u,d,o,a,t,"iconPosition"]},HTML_PARSER:{disabled:function(w){return !!w.get(s);},label:function(w){if(w.getAttribute(g)){return w.getAttribute(g);}if(w.get(r)){return w.get(r);}if(w.get("tagName")==="INPUT"){switch(w.get(m)){case l:return l;case v:return v;}}return null;},href:function(x){var w=x.getAttribute(a);if(w){return w;}return null;},type:function(x){var w=x.getAttribute(m);if(w){return w.toLowerCase();}return null;},title:function(w){if(w.getAttribute(o)){return w.getAttribute(o);}if(w.getAttribute(g)){return w.getAttribute(g);}if(w.get(r)){return w.get(r);}return null;}}});c.ButtonToggle=c.Base.create("buttonToggle",c.Button,[],{_defPressFn:function(y){if(!this.get(s)){var w=this.get(f)?0:1,x=this.get(w?h:j);if(x){x.apply(this,y);}this.set(f,w);if(!this.ancestor){if(w){this.get(b).addClass(this._classNames[f]);}else{this.get(b).removeClass(this._classNames[f]);}}}}},{_CLASS_NAMES:[f],ATTRS:{deselectedCallback:{value:null,validator:function(w){return e.isFunction(w)||e.isNull(w);}}}});},"gallery-2011.10.06-19-55",{skinnable:true,requires:["base-build","widget","gallery-makenode"]});