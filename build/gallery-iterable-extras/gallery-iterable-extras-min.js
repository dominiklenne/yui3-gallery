YUI.add("gallery-iterable-extras",function(a){a.Iterable={each:function(e,g){var b=this.iterator(),d=0;while(!b.atEnd()){e.call(g,b.next(),d,this);d++;}},every:function(e,g){var b=this.iterator(),d=0;while(!b.atEnd()){if(!e.call(g,b.next(),d,this)){return false;}d++;}return true;},filter:function(h,j){var b=this.newInstance();var d=this.iterator(),e=0;while(!d.atEnd()){var g=d.next();if(h.call(j,g,e,this)){b.append(g);}e++;}return b;},find:function(g,h){var b=this.iterator(),d=0;while(!b.atEnd()){var e=b.next();if(g.call(h,e,d,this)){return e;}d++;}return null;},map:function(g,h){var b=this.newInstance();var d=this.iterator(),e=0;while(!d.atEnd()){b.append(g.call(h,d.next(),e,this));e++;}return b;},partition:function(h,j){var b={matches:this.newInstance(),rejects:this.newInstance()};var d=this.iterator(),e=0;while(!d.atEnd()){var g=d.next();b[h.call(j,g,e,this)?"matches":"rejects"].append(g);e++;}return b;},reduce:function(h,g,j){var b=h;var d=this.iterator(),e=0;while(!d.atEnd()){b=g.call(j,b,d.next(),e,this);e++;}return b;},reject:function(h,j){var b=this.newInstance();var d=this.iterator(),e=0;while(!d.atEnd()){var g=d.next();if(!h.call(j,g,e,this)){b.append(g);}e++;}return b;},some:function(e,g){var b=this.iterator(),d=0;while(!b.atEnd()){if(e.call(g,b.next(),d,this)){return true;}d++;}return false;}};},"gallery-2012.03.23-18-00",{optional:["gallery-funcprog"]});