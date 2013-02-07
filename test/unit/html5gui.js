module('html5gui')

test('component is accessible from registry after declaration', function()
{
    var c = u.component('aType', {})
    equal(u.ComponentRegistry.get('aType'), c)
})


