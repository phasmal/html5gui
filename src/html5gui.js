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
    
    function Expression(position, name)
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
                //TODO %s support for u.log
                //TODO know character position of source here so we can output it
                u.log.warn(
                    "Applying expression '" + name + "' with no matching property at line " + position.line + ", char " + position.char + ", returning blank.")
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
    
    function isWhite(c)
    {
        return c == ' ' || c == '\t' || c == '\n' || c == '\r'
    }

    function isIdentifierChar(c)
    {
        var isIdent = /[a-zA-Z_]/
        return isIdent.test(c)
    }
    
    function stripWhite(stream)
    {
        var s = stream
        while (isWhite(s.head()))
        {
            s = s.tail()
        }
        return s
    }
    
    function apply(context, stream)
    {
        return stream.reduce('', function(text, item)
        {
            return text + (u.isObject(item) ? item.apply(context) : item);
        })
    }
    
    var parsers = {
        /** The outer part of an expression that is $ followed by { */
        wrappedValue: function(stream)
        {
            if (stream.head() == '{')
            {
                var result = parsers.expression(stream.next())
                var remaining = stripWhite(result.remaining)
                if (remaining.head() == '}')
                {
                    result.remaining = remaining.tail()
                    return result
                }
                else
                {
                    // TODO[RM]** add line and char by wrapping the stream as a ... 'ParsingStream'?
                    throw new Error("Parse Error: expected '}', but found " + toString(remaining))
                }
            }
            else
            {
                return parsers.value(stream)
            }
        },
        /** 
         * extract a single identifier from stream, return object with 
         * `identifier` containing the name of the identifier and `remaining` 
         * containing the stream immediately following the identifier
         */
        readIdentifier: function(stream)
        {
            var identifier = ""
            var remaining = stream

            while (remaining.hasValues() && isIdentifierChar(remaining.head()))
            {
                identifier += remaining.head()
                remaining = remaining.tail()
            }

            return {
                identifier: identifier,
                remaining: remaining
            }
        },
        value: function(stream)
        {
            
        }
    }
    
    function parse(stream)
    {
        var symbols = new u.collection.Accumulator()
        if (stream.hasValues())
        {
            var h = stream.head()
            var tail = stream.tail()
            if (h == '$')
            {
                var next = tail.head()
                if (next == '$')
                {
                    symbols = symbols.add('$').addAll(parse(tail.tail()))
                }
                else
                {
                    var split = parsers.readIdentifier(tail)
                    if (split != null)
                    {
                        symbols = symbols.add(new Expression(stream.position(), split.identifier))
                            .addAll(parse(split.remaining))
                    }
                    else
                    {
                        symbols = symbols.add('$').addAll(parse(tail))
                    }
                }
            }
            else
            {
                symbols = symbols.add(h).addAll(parse(tail))
            }
        }
        return symbols
    }
    
    var result = parse(new u.collection.ParseStream(spec))
    
    /** Applies this template in the context of the given objects.
     *
     * @params
     *   context:object? an object whose properties are exposed to the template as variables, 
     *                   default is an empty object
     */
    this.apply = function(context)
    {
        return apply(context, result);
    }
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
    this.type = u.returns(type)

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

