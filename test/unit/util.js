
test('Immediate Function is called right away', 2, function()
{
    var a = 'wrong'
    var b = u.immediate(function(){ a = 'right'; return 'response'})
    equal(a, 'right');
    equal(b, 'response');
})

test('u.has detects existing function', 1, function()
{
    ok(u.has({a:function(){}}, 'a'))
})

test('u.has ignores non-function', 1, function()
{
    ok(!u.has({a:'value'}, 'a'))
})

test('u.has detects no property', 1, function()
{
    ok(!u.has({b:'value'}, 'a'))
})


test('u.canDo creates function that detects method', 2, function()
{
    var f = u.canDo('a')
    ok(typeof f == 'function')
    ok(f({a:function(){}}))
})

test('u.isArray detects array', 1, function()
{
    ok(u.isArray([]))
})

test('u.isArray is false for non-arrays', 1, function()
{
    ok(!u.isArray(arguments))
})

test('u.isObject detects object', 2, function()
{
    ok(u.isObject([]))
    ok(u.isObject({}))
})

test('u.isObject is false for non-objects', 1, function()
{
    ok(!u.isObject(''))
})

test('u.mixin mixes in members, overriding existing', 3, function()
{
    var a = {
        a: 'aa',
        b: 'ab'
    }
    
    var b = {
        b: 'bb',
        c: 'bc'
    }
    
    u.mixin(b, a)
    
    equal(b.a, 'aa')
    equal(b.b, 'ab')
    equal(b.c, 'bc')
})

test('u.singleton creates instance of passed constructor', 1, function()
{
    var Cons = function(){}
    
    var result = u.singleton(Cons)
    
    ok(result instanceof Cons)
})

test('u.cat joins arrays in order', 1, function()
{
    var a = [1,2,3]
    var b = [4,5,6]
    
    var c = u.cat(a,b)
    
    deepEqual(c, [1,2,3,4,5,6])
})

test('u.bind changes this arg for function', 1, function()
{
    var a = {
        f: function()
        {
            return this
        }
    }
    
    var b = {}
    
    var g = u.bind(b, a.f)
    
    equal(g(), b)
})

test('u.apply fills in first arguments', 1, function()
{
    var f = function(a,b,c)
    {
        return [a,b,c]
    }
    
    var g = u.apply(f, [1])
    
    deepEqual(g(2,3), [1,2,3])
})

test('u.applyRight fills in last arguments', 1, function()
{
    var f = function(a,b,c)
    {
        return [a,b,c]
    }
    
    var g = u.applyRight(f, [3])
    
    deepEqual(g(1,2), [1,2,3])
})

test('u.each loops through arrays', 1, function()
{
    var a = [1,2,3]
    
    var r = []
    
    u.each(a, function(v)
    {
        r.push(v)
    })
    
    deepEqual(r, a)
})


test('u.each loops through object members', 1, function()
{
    var a = {
        a: 1,
        b: 2
    }
    
    var b = {}
    
    u.each(a, function(v, k)
    {
        b[k] = v
    })
    
    deepEqual(b, a)
})

test('u.each calls objects existing each method', 1, function()
{
    var called = []
    
    var a = {
        each: function(f)
        {
            f('calling')
        }
    }
    
    u.each(a, function(v)
    {
        called.push(v)
    })
    
    deepEqual(called, ['calling'])
})

test('u.returnValue always returns the configured value', 2, function()
{
    var f = u.returnValue('a')
    
    equal(f(), 'a')
    equal(f(), 'a')
})