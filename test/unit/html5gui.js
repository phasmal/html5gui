module('html5gui')

test('template inserts single property value', function()
{
    var t = new u.Template('_$a_')
    equal(t.apply({a:1}), '_1_')
})

test('component is accessible from registry after declaration', function()
{
    var c = u.component('aType', {})
    equal(u.ComponentRegistry.get('aType'), c)
})

