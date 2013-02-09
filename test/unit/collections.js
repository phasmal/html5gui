module('collection')

test('stream iterates through whole array', function()
{
    var a = [1,2,3]
    var i = 0
    var s = new u.collection.Stream(function()
    {
        
        return a[i++]
    })
    
    
    var n = s
    u.each(a, function(i)
    {
        equal(n.head(), i)
        n = n.next()
    })
    
    equal(n.next(), u.nil)
})

