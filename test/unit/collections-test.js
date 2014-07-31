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
        return i < a.length ? a[i++] : u.end
    })
    
    deepEqual(toArray(s), a)
})

test('stream iterates through other streams values', function()
{
    var a = [1,2,3]
    var i = 0
    var s = new u.collection.Stream(function()
    {
        return i < a.length ? a[i++] : u.end
    })
    var s2 = new u.collection.Stream(s)
    
    deepEqual(toArray(s2), a)
})

test('stream iterator iterates through array', function()
{
    var a = [1,2,3]
    var s = new u.collection.Stream(a)
    
    var i = s.iterator()
    
    var result = []
    
    var x = i()
    while (x != u.end)
    {
        result.push(x)
        x = i()
    }
    
    deepEqual(result, a)
})
    

test('stream skips nil values', function()
{
    var a = [1, 2, u.nil, 3]
    var expected = [1, 2, 3]
    var i = 0
    var s = new u.collection.Stream(function()
    {
        return i < a.length ? a[i++] : u.end //TODO implement u.end as end of stream!!
    })
    
    deepEqual(toArray(s), expected)
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

test('stream mapping removes nil-mapped entries', function()
{
    var s = new u.collection.Stream([1,2,3,4,5])
    
    var s2 = s.map(function(i)
    {
        return i % 2 == 0 ? i : u.nil
    })
    
    deepEqual(toArray(s2), [2,4])
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
        return n >= 100 ? u.end : n++
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
    equal(new u.collection.Collection(u.returns(u.end)).size(), 0)
    
    var n = 0
    var c = new u.collection.Collection(function()
    {
        return n >= 5 ? u.end : n++
    })
    
    equal(c.size(), 5)
})

test('collection converts to string', function()
{
    var n = 0
    var c = new u.collection.Collection(function()
    {
        return n >= 5 ? u.end : n++
    })
    
    equal(c.toString(), '[0, 1, 2, 3, 4]')
})

module('u.collection.Accumulator')

test('accumulator starts out empty', function()
{
    var l = new u.collection.Accumulator()
    ok(!l.hasValues())
})

test('accumulator can have items added', function()
{
    var l = new u.collection.Accumulator()
    var dl = l.add('a')
    ok(dl.hasValues())
    equal(dl.head(), 'a')
})

test('accumulator with item added is different list instance', function()
{
    var l = new u.collection.Accumulator()
    var dl = l.add('a')
    ok(dl !== l)
    ok(dl.size() == (l.size() + 1))
})

test('accumulator adds items in order', function()
{
    var l = new u.collection.Accumulator()
    var l2 = l.add('a')
    var l3 = l2.add('b')

    deepEqual(l3.asArray(), ['a','b'])
})

test('accumulator added to twice leaves result of first add unaffected', 2, function()
{
    var l = new u.collection.Accumulator()
    var l2 = l.add('a')
    var l2a = l2.add('b')
    var l2b = l2.add('c')

    deepEqual(l2a.asArray(), ['a', 'b'])
    deepEqual(l2b.asArray(), ['a', 'c'])
})

test('accumulator addAll adds all items from array', 1, function()
{
    var a = [1, 2, 3]
    var b = [4, 5, 6]
    var l = new u.collection.Accumulator()
    var r = l.addAll(a).addAll(b)

    deepEqual(r.asArray(), [1, 2, 3, 4, 5, 6])
})

test('accumulator addAll adds all items from sequence', 1, function()
{
    var a = [1, 2, 3]
    var b = new u.collection.Collection([4, 5, 6])
    var l = new u.collection.Accumulator()
    var r = l.addAll(a).addAll(b)

    deepEqual(r.asArray(), [1, 2, 3, 4, 5, 6])
})

module('u.collection.ParseStream')

test('reports char location', function()
{
    var s = new u.collection.ParseStream('abc')
    equal(s.head(), 'a')
    equal(s.position().char, 1)
    s = s.tail()
    equal(s.head(), 'b')
    equal(s.position().char, 2)
    s = s.tail()
    equal(s.head(), 'c')
    equal(s.position().char, 3)
})

test('reports line', function()
{
    var s = new u.collection.ParseStream('a\nbc\r\nde')
    equal(s.head(), 'a')
    equal(s.position().line, 1)
    s = s.tail()
    equal(s.head(), '\n')
    equal(s.position().line, 1)
    s = s.tail()
    equal(s.head(), 'b')
    equal(s.position().line, 2)
    s = s.tail()
    equal(s.head(), 'c')
    equal(s.position().line, 2)
    s = s.tail()
    equal(s.head(), '\r')
    equal(s.position().line, 2)
    s = s.tail()
    equal(s.head(), '\n')
    equal(s.position().line, 2)
    s = s.tail()
    equal(s.head(), 'd')
    equal(s.position().line, 3)
    s = s.tail()
    equal(s.head(), 'e')
    equal(s.position().line, 3)
})

test('reports char on line', function()
{
    var s = new u.collection.ParseStream('a\nbc\r\nde')
    equal(s.head(), 'a')
    equal(s.position().char, 1)
    s = s.tail()
    equal(s.head(), '\n')
    equal(s.position().char, 2)
    s = s.tail()
    equal(s.head(), 'b')
    equal(s.position().char, 1)
    s = s.tail()
    equal(s.head(), 'c')
    equal(s.position().char, 2)
    s = s.tail()
    equal(s.head(), '\r')
    equal(s.position().char, 3)
    s = s.tail()
    equal(s.head(), '\n')
    equal(s.position().char, 4)
    s = s.tail()
    equal(s.head(), 'd')
    equal(s.position().char, 1)
    s = s.tail()
    equal(s.head(), 'e')
    equal(s.position().char, 2)
})

