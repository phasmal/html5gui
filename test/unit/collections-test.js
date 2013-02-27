module('collection')


module('collection.Stream')

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
    
    equal(n, u.collection.EmptyStream)
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

function toArray(s)
{
    var b = []
    while (s.hasValues())
    {
        b.push(s.head())
        s = s.tail()
    }
    return b
}

test('stream iterates through function values', function()
{
    
    var a = [1,2,3]
    var i = 0
    var s = new u.collection.Stream(function()
    {
        return i < a.length ? a[i++] : u.nil
    })
    
    deepEqual(toArray(s), a)
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

test('stream maps to new stream', function()
{
    var s = new u.collection.Stream([1,2,3,4,5])
    
    var s2 = s.map(function(i)
    {
        return i + 1
    })
    
    deepEqual(toArray(s2), [2,3,4,5,6])
})

test('stream reduces to a result', function()
{
    var s = new u.collection.Stream([1,2,3,4,5])
    
    var r = s.reduce(
        0,
        function(total, next)
        {
            return total + next
        })
        
    equal(r, 15)
})

test('stream filters', function()
{
    var s = new u.collection.Stream([1,2,3,4,5])
    var r = s.filter(function(i)
    {
        return i % 2 == 0
    })
    deepEqual(toArray(r), [2,4])
})


module('collection.Collection')

var testCol = function()
{
    var n = 0
    return new u.collection.Collection(function()
    {
        return n >= 100 ? u.nil : n++
    })
}


test('collection converts to array', function()
{
    var c = testCol()
    
    var a = []
    for (var i = 0; i < 100; i++)
    {
        a[i] = i
    }
    
    deepEqual(c.asArray(), a)
})

test('collection checks if every item matches', function()
{
    var c = testCol()
    
    ok(c.every(function(i){ return i < 100 && i >= 0 }))
    ok(!c.every(function(i){ return i != 50 }))
})

test('collection checks if any match', function()
{
    var c = testCol()
    
    ok(c.any(function(i){ return i == 50 }))
    ok(!c.any(function(i){ return i == 101 }))
})

test('collection checks if it contains', function()
{
    var c = testCol()
    ok(c.contains(50))
    ok(!c.contains(101))
})

test('collection size', function()
{
    equal(new u.collection.Collection(u.returns(u.nil)).size(), 0)
    
    var n = 0
    var c = new u.collection.Collection(function()
    {
        return n >= 5 ? u.nil : n++
    })
    
    equal(c.size(), 5)
})

test('collection converts to string', function()
{
    var n = 0
    var c = new u.collection.Collection(function()
    {
        return n >= 5 ? u.nil : n++
    })
    
    equal(c.toString(), '[0, 1, 2, 3, 4]')
})

module('parse stream')

test('reports char location', function()
{
    var s = new u.collection.ParseStream('abc')
    equal(s.head(), 'a')
    equal(s.location().char, 1)
    s = s.tail()
    equal(s.head(), 'b')
    equal(s.location().char, 2)
    s = s.tail()
    equal(s.head(), 'c')
    equal(s.location().char, 3)
})

test('reports line', function()
{
    var s = new u.collection.ParseStream('a\nbc\r\nde')
    equal(s.head(), 'a')
    equal(s.location().line, 1)
    s = s.tail()
    equal(s.head(), '\n')
    equal(s.location().line, 1)
    s = s.tail()
    equal(s.head(), 'b')
    equal(s.location().line, 2)
    s = s.tail()
    equal(s.head(), 'c')
    equal(s.location().line, 2)
    s = s.tail()
    equal(s.head(), '\r')
    equal(s.location().line, 2)
    s = s.tail()
    equal(s.head(), '\n')
    equal(s.location().line, 2)
    s = s.tail()
    equal(s.head(), 'd')
    equal(s.location().line, 3)
    s = s.tail()
    equal(s.head(), 'e')
    equal(s.location().line, 3)
})

test('reports char on line', function()
{
    var s = new u.collection.ParseStream('a\nbc\r\nde')
    equal(s.head(), 'a')
    equal(s.location().char, 1)
    s = s.tail()
    equal(s.head(), '\n')
    equal(s.location().char, 2)
    s = s.tail()
    equal(s.head(), 'b')
    equal(s.location().char, 1)
    s = s.tail()
    equal(s.head(), 'c')
    equal(s.location().char, 2)
    s = s.tail()
    equal(s.head(), '\r')
    equal(s.location().char, 3)
    s = s.tail()
    equal(s.head(), '\n')
    equal(s.location().char, 4)
    s = s.tail()
    equal(s.head(), 'd')
    equal(s.location().char, 1)
    s = s.tail()
    equal(s.head(), 'e')
    equal(s.location().char, 2)
})

