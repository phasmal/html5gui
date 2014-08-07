

module('template')
test('template escapes $', function()
{
    var t = new u.Template('_$$_')
    equal(t.apply(), '_$_')
})

test('template inserts single property value', function()
{
    var t = new u.Template('-$a-')
    equal(t.apply({a:1}), '-1-')
})

test('template fails insertion if expression is not found', function()
{
    var t = new u.Template('-$b-')
    equal(t.apply({a:1}), '--')
})

test('component is accessible from registry after declaration', function()
{
    var c = u.component('aType', {})
    equal(u.ComponentRegistry.get('aType'), c)
})

