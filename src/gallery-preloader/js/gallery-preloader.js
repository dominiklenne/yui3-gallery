/**
 * Y.preloader() function for YUI3
 * Uses Caridy's gallery-preload & Loader.resolve to easily preload YUI modules
 * 
 * @module gallery-preloader
 */

/**
 * Preload YUI modules & CSS
 * @namespace Y
 * @class preload
 * @static
 * @param {String|Array} modules Modules to be loaded
 * @return {YUI} Y instance for chaining
 */
Y.preloader = function(modules) {
	var config = Y.merge(Y.config, { 
            require : Y.Lang.isArray(modules) ? modules : Y.Array(arguments, 0, true)
        }),
        loader = new Y.Loader(config),
        details = loader.resolve(true),
        files = details.js.concat(details.css);
        
    Y.preload(files);
	
	return Y;
};