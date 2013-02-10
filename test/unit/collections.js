module('collection')

test('stream iterates through whole array', function()
{
    var a = [1,2,3]
    var i = 0
    var s = new u.collection.Stream(a)
    
    var n = s
    u.each(a, function(i)
    {
        equal(n.head(), i)
        n = n.tail()
    })
    
    equal(n.tail(), u.collection.EmptyStream)
    
    n = s
    i = 0
    while (n.hasValues())
    {
        equal(n.head(), a[i++])
        n = n.tail()
    }
    equal(n, u.collection.EmptyStream)
})

test('stream iterates through whole string', function()
{
    var a = 'abc'
    var i = 0
    var s = new u.collection.Stream(a)
    
    var n = s
    u.each(a, function(i)
    {
        equal(n.head(), i)
        n = n.tail()
    })
    
    equal(n.tail(), u.collection.EmptyStream)
    
    n = s
    i = 0
    while (n.hasValues())
    {
        equal(n.head(), a[i++])
        n = n.tail()
    }
    equal(n, u.collection.EmptyStream)
})

test('stream iterates through function values', function()
{
    
    var a = [1,2,3]
    var i = 0
    var s = new u.collection.Stream(function()
    {
        return i < a.length ? a[i++] : u.nil
    })
    
    var b = []
    while (s.hasValues())
    {
        b.push(s.head())
        s = s.tail()
    }
    deepEqual(b, a)
    equal(s, u.collection.EmptyStream)
})

test('stream reader reads part of stream', function()
{
    var s = new u.collection.Stream([1,2,3,4,5])
    
    var l = []
    
    s.read(function(value)
    {
        l.push(value)
        return value < 4
    })
    
    deepEqual(l, [1,2,3,4])
})

