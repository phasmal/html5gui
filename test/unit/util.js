test('Immediate Function is called right away', function()
{
    var a = 'wrong'
    var b = u.immediate(function(){ a = 'right'; return 'response'})
    equal(a, 'right');
    equal(b, 'response');
})

test('u.has detects existing function', function()
{
    ok(u.has({a:function(){}}, 'a'))
})

test('u.has ignores non-function', function()
{
    ok(!u.has({a:'value'}, 'a'))
})

test('u.has detects no property', function()
{
    ok(!u.has({b:'value'}, 'a'))
})


test('u.canDo creates function that detects method', function()
{
    var f = u.canDo('a')
    ok(typeof f == 'function')
    ok(f({a:function(){}}))
})

test('u.isArray detects array', function()
{
    ok(u.isArray([]))
})

test('u.isArray is false for non-arrays', function()
{
    ok(!u.isArray(arguments))
})

test('u.isObject detects object', function()
{
    ok(u.isObject([]))
    ok(u.isObject({}))
})

test('u.isObject is false for non-objects', function()
{
    ok(!u.isObject(''))
})

