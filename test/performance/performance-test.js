// run performance test
// iterations - the number of times to run the test for a timing
// repeats - the number of times to repeat iterations
// action - the function to call to perform the action to test (no parameters are passed)
// writer - a function which accepts text output as a single string parameter
function performanceTest(iterations, repeats, action, writer)
{
    // warmup
    for (var w = 0; w < iterations; w++)
    {
        action()
    }
    
    // timing run
    var times = new u.collection.Accumulator()
    for (var r = 0; r < repeats; r++)
    {
        var t0 = performance.now()
        for (var i = 0; i < iterations; i++)
        {
            action()
        }
        var t1 = performance.now()
        var time = t1 - t0
        times = times.add(time)
        writer(r + ': total=' + time + ' ms, average=' + (time / iterations) + 'ms')
    }
    
    var total = times.reduce(0, function(t, x) { return t + x })
    writer('total test time: ' + total + ' ms')
    writer('average run time: ' + (total / repeats) + ' ms')
    writer('average per iteration/action: ' + (total / repeats / iterations) + ' ms')
}