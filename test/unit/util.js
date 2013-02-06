test('Immediate Function is called right away', function()
{
    var a = 'wrong'
    var b = u.immediate(function(){ a = 'right'; return 'response'})
    equal(a, 'right');
    equal(b, 'response');
})

