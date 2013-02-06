u = u || {}

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
u.mixin = function(source, destination)
{
    _.each(source, function(value, key)
    {
        destination[key] = value
    })

    return destination
}

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
 * Binds the given function so it's `this` is always `thisArg`
 * @params
 *   thisArg:object
 *   f:function
 */
u.bind = function(thisArg, f)
{
    var g = function()
    {
        return f.apply(thisArg, arguments)
    }

    return g
}

/** 
 * Calls `f` for each item of `list`. 
 * @params
 *   list:(ANY[]|object) if an object, must {@can.each support each}
 *   f:function function taking parameters item and index
 */
u.each = function(list, f)
{
    if (list.each) 
    {
        list.each(f)
    }
    else
    {
        for (var i = 0; i < list.length; i++)
        {
            f(list[i], i)
        }
    }
}

/**
 * Returns a function that simply returns the given value.
 * @params
 *   value:ANY
 * @return:ANY the content of the `value` param
 */
u.returnValue = function(value)
{
    var f = function()
    {
        return value
    }
    return f
}


/**
 * Ajax request to url, calling success/fail callback on receipt of response. 
 * If postData is specified, then POST is used,  otherwise GET is used.
 * @params
 *   url:string url to connect to
 *   success:function called on successful response, passed the body of the 
                      response as a string
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



