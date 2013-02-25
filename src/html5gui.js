/** Global logging mechanism, uses browser console where available. */
u.log = u.singleton(function()
{
    var logObject = this
    u.each(['log', 'info', 'warn', 'error'], function(method)
    {
        logObject[method] = u.bind(console, console[method])
    })
})

/** A template that can be converted into a string relative to a set of properties. 
 * 
 *  Template Substitution
 *  =====================
 *  
 *  Property values are substituted into the body of the template spec as follows.
 *
 *  * `$` followed by `$` results in a single `$`
 *  * `$` followed by an identifier (starts with a letter, followed by letters and numbers) results
 *    in the value of the property matching the identifier
 *  * `${` followed by an expression, followed by a `}` results in the evaluation of the expression.
 *  
 *  Expressions
 *  ===========
 *  An expression is only an identifier that results in the corresponding properties value.
 *  
 *  @params
 *    spec:string the spec string representing the template
 */
u.Template = function(spec)
{
    function Block()
    {
        var statements = new u.collection.List()
        this.add = statements.add
        this.apply = function(context)
        {
            var result = ''
            statements.each(function(statement)
            {
                result = result + statement.apply(context)
            })
            return result
        }
    }
    
    function Expression(name)
    {
        this.apply = function(context)
        {
            var value = ''
            if (context[name])
            {
                value = context[name]
            }
            else
            {
                u.log.warn(
                    "Applying expression '" + name + "' with no matching property, returning blank.")
            }
            return value
        }
    }
    
    function ParseResult(expression, remaining)
    {
        this.expression = expression
        this.remaining = remaining
        this.apply = expression.apply
    }
    
    var parsers = {
        block: function(stream)
        {
        },
        
        identifier: function(stream)
        {
            
        },

        expression: function(stream)
        {
            
        }
    }
    
    function parse(stream)
    {
        var symbols = [] // TODO[RM]*** List instead of array
        if (stream.hasValues())
        {
            var h = stream.head()
            var tail = stream.tail()
            if (h == '$')
            {
                var next = tail.head()
                if (next == '$')
                {
                    symbols = u.cat('$', parse(tail.tail()))
                }
                else
                {
                    var split = parsers.readIdentifier(tail)
                    if (split != null)
                    {
                        symbols = u.cat(new Expression(split.identifier), parse(split.remainder))
                    }
                    else
                    {
                        symbols = u.cat('$', parse(tail))
                    }
                }
            }
            else
            {
                symbols = u.cat(parse(tail))
            }
        }
        return symbols
    }
    
    var parts = parse(new u.collection.Stream(spec)).parts
    
    /** Applies this template in the context of the given objects.
     *
     * @params
     *   context:object? an object whose properties are exposed to the template as variables, 
     *                   default is an empty object
     */
    this.apply = parts.apply
}

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
 * @return:u.Component
 */
u.component = function(type, config)
{
    var properties = config.properties ? config.properties : []
    var output = config.output ? output : ''
    var component = new u.Component(type, properties, output)
    u.ComponentRegistry.register(type, component)
    return component
}

