/** Global logging mechanism, uses browser console where available. */
u.log = u.singleton(function()
{
    var logObject = this
    u.each(['log', 'info', 'warn', 'error'], function(method)
    {
        logObject[method] = u.bind(console, console[method])
    })
})

/**
 * Central Component Registry.
 *  
 */
u.ComponentRegistry = u.singleton(function()
{
    // mapping from type name to component object
    var registry = {}

    /**
     * Registers the given component in this registry.
     * @params
     *   type:string the unique type name to register the component under
     *   component:object
     */
    this.register = function(type, component)
    {
        if (registry[type])
        {
            u.warn('Component type ' + type + ' was already defined, now being overridden')
        }
        registry[type] = component
    }

    /**
     * Returns the component of the given type, null if no component matches that type.
     * @return:object
     */
    this.get = function(type)
    {
        var c = null
        if (registry[type])
        {
            c = registry[type]
        }
        return c
    }
})

/**
 * A visual component that renders as html.
 * @params
 *   type:string
 *   properties:string[]
 *   output:(object|string) either a specification object, or a template string that is to 
 *                          be converted to html
 */
u.Component = function(type, properties, output)
{
    /** 
     * Returns the type name of this component
     * @return:string
     */
    this.type = u.returnValue(type)

    // TODO[RM]** deal with properties and output
}

/** 
 * Creates a new component
 * @params
 *   type:string the unique type name of the component
 *   config:object a basic object containing any of the following properties:
 *       * properties - an array of names of properties that can be passed to the 
 *                      component in it's config
 *       * output - either a string which is a template that can have properties replaced in it; or
 *                  a gui *specification object* which contains a specification for the inner-components that
 *                  will be used to implement this component
 */
u.component = function(type, config)
{
    var properties = config.properties ? config.properties : []
    var output = config.output ? output : ''
    return new Component(type, properties, output)
}

