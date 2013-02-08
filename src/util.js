/** 'u' library of *u*seful functionality related to generating HTML5 guis using Javascript.
 *  u is:
 *  * lean (*u* is like the symbol for micron) and elegant (or so we'd like to think); and
 *  * *u*ncomplicated (and therefore easy to learn, use and debug)
 *
 *  The ethos of u is to create a library that is true to the form of Javascript and HTML, true to the
 *  client-server nature of the web, but allows great power through simple, extensible, elegant mechanisms.
 *  
 *  Whether it achieves that is up to u.... (sorry, couldn't help it)
 */
u = {}

/** 
 * Immediately calls `f` and returns the result. This formalises the common Javascript pattern
 * *'immediate function'*, the purpose of which is to provide enclosed scope to a snippet of code.
 * For reference, the *immediate function* pattern normally looks as follows.
 *
 *   var value = (function()
 *   {
 *       // ... 
 *       return something
 *   })()
 *
 * @params
 *   f:function
 */
u.immediate = function(f)
{
    return f()
}

// wrap the rest of the declarations so they can share implementation.
u.immediate(function()
{
    //
    // Private functions
    //
    
    function isString(toTest)
    {
        return typeof(toTest) == 'string'
    }
    
    function isArray(toTest)
    {
        return Object.prototype.toString.call(toTest) === '[object Array]'
    }
    
    function isArguments(toTest)
    {
        return Object.prototype.toString.call(toTest) === '[object Arguments]'
    }
    
    function isArrayLike(toTest)
    {
        return isString(toTest) || isArray(toTest) || isArguments(toTest)
    }

    function isObject(toTest)
    {
        return typeof(toTest) == 'object'
    }

    function each(list, f)
    {
        if (list.each) // would use u.can.each here, but would create circular dependency
        {
            list.each(f)
        }
        else if (isArrayLike(list))
        {
            for (var i = 0; i < list.length; i++)
            {
                f(list[i], i)
            }
        }
        else if (isObject(list))
        {
            each(Object.keys(list), function(key)
            {
                if (list.hasOwnProperty(key))
                {
                    f(list[key], key)
                }
            })
        }
    }
    
    function cat()
    {
        var array = []
        each(Array.prototype.slice.call(arguments, 0), function(argument)
        {
            if (isArray(argument) || isArguments(argument))
            {
                each(argument, function(item)
                {
                    array.push(item)
                })
            }
            else
            {
                array.push(argument)
            }
        })

        return array
    }
    
    function applyParams(f, paramF)
    {
        var g = function()
        {
            return f.apply(null, cat.apply(u, paramF(arguments)))
        }

        return g
    }
    
    function applyLeft(f, params)
    {
        var g = applyParams(f, function(args)
        {
            return [params, args]
        })
        
        return g
    }
    
    function applyRight(f, params)
    {
        var g = applyParams(f, function(args)
        {
            return [args, params]
        })
        
        return g
    }

    // 
    // Public functions
    //

    /** 
     * Returns true if `o` has a method (property that is a function) of the given name.
     * @params
     *   o:object
     *   method:string
     * @return:boolean
     */
    u.has = function(o, method)
    {
        return o[method] && typeof o[method] == 'function'
    }

    /** 
     * Returns a function that takes a single parameter and returns true if that parameter 
     * {@u.has has a method named} `method`
     * @params
     *   method:string
     */
    u.canDo = function(method)
    {
        return applyRight(u.has, [method])
    }

    /** A collection of definitions of method names. This object is a central place to record 
     *  globally understood names that can be found on methods. Basically this is to duck typed 
     *  objects what interfaces are to objects in other languages - it allows metods/functions 
     *  to specify required properties of objects that are passed to them, but in a Javascript 
     *  way.  
     * 
     *  Since javascript objects are not (as of commonly-available versions in 2013) able to
     *  guarantee any correspondance between types (here we mean the constructor that created 
     *  the object, not the type as returned by `typeof`) and the methods or meaning of methods
     *  that are on an object; we (in general) give up on trying to create generalisable meaning
     *  in objects, and instead assign meaning to the names of the methods of an object. We do
     *  this by creating a convention that certain names mean certain things (globally within an
     *  application, at least).  This is a place to notate that convention, and also creates a
     *  mechanism that allows methods/functions to deal with parameters that don't match the 
     *  intended constraints.
     *
     *  For example, if we were to say that we take a parameter which is an object that we 
     *  expect to contain a method called 'each', which itself should take a function with certain
     *  parameters as its parameter; then we can say in our documentation something like:
     *
     *     'must support \{@u.can.each}'
     *
     *  Then someone reading this interface can look up can.each and will find the definition 
     *  of the convention for that name, which will specify semantics, parameters etc.
     *  
     *  To define a new convention, write code similar to the following, with associated documentation 
     *  describing the semantics.
     *
     *     u.can.myMethod = u.canDo('myMethod')
     *  
     */
    u.can = {}


    /** 
     * Calls the given function once for each item contained in the object (in an object-defined order),
     * passing the item as the first parameter, and it's index within the object (the meaning of which 
     * is, again, object-specific)
     *
     * @params
     *   f:function function to be called for each item in the object
     */
    u.can.each = u.canDo('each')

    /** 
     * Returns true if `toTest` is a Javascript string.
     * @params
     *   toTest:*
     * @return:boolean
     */
    u.isString = isString
  
    /** 
     * Returns true if `toTest` is a Javascript array.
     * @params
     *   toTest:*
     * @return:boolean
     */
    u.isArray = isArray
    
    /**
     * Returns true if `toTest` can be iterated like an array (is a string or array or arguments 
     * object)
     * @return:boolean
     */
    u.isArrayLike = isArrayLike
  
    /** 
     * Returns true if `toTest` is a Javascript object.
     * @params
     *   toTest:*
     */
    u.isObject = isObject

    /**
     * Mixes source into destination. Mixing means that each property of source 
     * is copied to destination
     *
     * @params
     *   source:object
     *   destination:object
     *
     * @return:object returns a reference to destination
     */
    u.mixin = function(destination, source)
    {
        each(source, function(value, key)
        {
            if (source.hasOwnProperty(key))
            {
                destination[key] = value
            }
        })

        return destination
    }

    /**
     * Creates an object of type `constructor` and returns the result.
     * @params
     *   constructor:function
     */
    u.singleton = function(constructor)
    {
        return new constructor()
    }

    /**
     * Returns an array which is the concatenation of the array arguments (or simply a copy of 
     * the array argument if only one argument is passed). If any arguments are not arrays, then
     * they are added to the output array in their position.
     * @return:*[]
     */
    u.cat = cat

    /** Alias for {@u.cat} */
    u.arrayCopy = cat

    /**
     * Binds the given function so it's `this` is always `thisArg`, returning the resulting function.
     * @params
     *   thisArg:object
     *   f:function
     * @return:function function that calls `f` in such a way that when `f` refers to `this`
     *                  it will be using `thisArg`
     */
    u.bind = function(thisArg, f)
    {
        var g = function()
        {
            return f.apply(thisArg, arguments)
        }

        return g
    }

    /** Returns a function which is `f` with the first parameters replaced with the items of `params`
     * @params
     *   f:function 
     *   params:*[]
     * @return:function
     */
    u.apply = applyLeft


    /** Returns a function which is `f` with the last parameters replaced with the items of `params`
     * @params
     *   f:function
     *   params:*[]
     * @return:function
     */
    u.applyRight = applyRight


    /** 
     * Calls `f` for each item of `list`. 
     * @params
     *   list:(*[]|object) if an object, must {@u.can.each support each}
     *   f:function function taking parameters item and index
     */
    u.each = each

    /**
     * Returns a function that simply returns the given value.
     * @params
     *   value:*
     * @return:* the content of the `value` param
     */
    u.returnValue = function(value)
    {
        var f = function()
        {
            return value
        }
        
        return f
    }

    /** A value representing no value. */
    u.nil = {}

    /** 
     * Returns the first element of the given array/first character of the given string, {@u.nil}
     * if the list is empty.
     * 
     * @params
     *   list:(string|*[])
     *   
     * @returns:(string|*[])
     */
    u.head = function(list)
    {
        return isArrayLike(list) && list.length > 0 ? list[0] : u.nil
    }
    
    /**
     * Returns a list containing the elements in the given list from the second (index 1) element
     * onwards, {@{u.nil} if the list is empty. If list is a string, returns a string, otherwise 
     * returns an array.
     * 
     * @params
     *   list:(string|*[])
     *   
     * @returns:(string|*[])
     */
    u.tail = function(list)
    {
        var t = u.nil
       
        if (list.length > 0)
        {
            if (isArguments(list) || isArray(list))
            {
                t = Array.prototype.slice.call(list, 1)
            }
            else if (isString(list))
            {
                t = list.substring(1)
            }
        }
       
        return t
    }
    
    /**
     * Ajax request to url, calling success/fail callback on receipt of response. 
     * If postData is specified, then POST is used,  otherwise GET is used.
     * @params
     *   url:string url to connect to
     *   success:function called on successful response, passed the body of the 
     *                    response as a string
     *   fail:function called on failed response, passed the status code
     *   [postData:string] data to post.
     */
    u.ajaxRequest = function(url, success, fail, postData)
    {
        function createRequest()
        {
            var xmlhttp = false;

            var factories = [
                function () {return new XMLHttpRequest()},
                function () {return new ActiveXObject("Msxml2.XMLHTTP")},
                function () {return new ActiveXObject("Msxml3.XMLHTTP")},
                function () {return new ActiveXObject("Microsoft.XMLHTTP")}
            ]

            for (var i = 0; i < factories.length; i++)
            {
                try 
                {
                    xmlhttp = factories[i]()
                }
                catch (e)
                {
                    continue
                }
                break
            }
            return xmlhttp
        }

        var request = createRequest();
        if (request)
        {
            var method = postData ? "POST" : "GET"

            request.open(method, url, true)
            request.setRequestHeader('User-Agent', 'XMLHTTP/1.0')

            if (postData)
            {
                request.setRequestHeader('Content-type','application/x-www-form-urlencoded')
            }

            request.onreadystatechange = function () 
            {
                if (request.readyState == 4)
                {
                    if (request.status == 200 || request.status == 304) 
                    {
                        success(request)
                    }
                    else
                    {
                        fail(request.status)
                    }
                }
            }

            request.send(postData);
        }
    }

}) // end of u.immediate() block


