
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
function mixin(source, destination)
{
    _.each(source, function(value, key)
    {
        destination[key] = value
    })

    return destination
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
function ajaxRequest(url, success, fail, postData)
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



