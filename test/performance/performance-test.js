// run performance test
// count - the number of iterations to test
// size - the size to apply each iteration
// writer a function which accepts text output as a single string parameter
function performanceTest(count, size, writer)
{
    var times = new u.collection.Accumulator()
    for (var i = 0; i < count; i++)
    {
        var t0 = performance.now()
        var a = new u.collection.Accumulator()
        for (var j = 0; j < size; j++)
        {
            a = a.add(j)
        }
        var t1 = performance.now()
        var time = t1 - t0
        times = times.add(time)
        writer(i + ': ' + time + ' ms')
    }
    var total = times.reduce(0, function(t, x) { return t + x })
    writer('total: ' + total + ' ms')
    writer('average: ' + (total / count) + ' ms')
}