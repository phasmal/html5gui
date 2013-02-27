u.collection = {}

/**
 * A sequence of items that can be accessed, one at a time in sequence.
 * @params
 *   items:(*[]|string|function) the items for the stream, one of:
 *     * array, whose elements are the items
 *     * string, whose characters are the items
 *     * function, which returns an item for each iteration, returning u.nil once there are no more
 *       items
 */
u.collection.Stream = function(items)
{
    var iterator
    
    if (u.isArrayLike(items))
    {
        iterator = u.immediate(function()
        {
            var i = 0
            var f = function()
            {
                return i < items.length ? items[i++] : u.nil
            }
            return f
        })
    }
    else if (u.isFunction(items))
    {
        iterator = items
    }
    else
    {
        iterator = u.returns(u.nil)
    }
    
    var head = iterator()
    var next = u.nil
    
    /** 
     * Returns true if this stream has any values in it. This means that a call to {@#head()} will
     * return a value.
     *  
     * @return:boolean
     */
    this.hasValues = u.returns(head != u.nil)
    
    /**
     * Returns true if there are no more values in this stream. This means  a call to {@#head()}
     * returns u.nil.
     * @return:boolean
     */
    this.isEmpty = u.not(this.hasValues)
    
    /** 
     * Returns the item at the head of the stream, {@u.nil} if there are no items in the stream. 
     * @return:*
     */
    this.head = u.returns(head)
    
    /** Returns the remainder of the stream (a stream containing everything except for the head). If
     *  this stream has no elements, then this is returned.
     *  @return:u.collection.Stream
     */
    this.tail = function()
    {
        if (next.isNil)
        {
            next = this.hasValues() ? new u.collection.Stream(iterator) : u.collection.EmptyStream
            if (next.isEmpty())
            {
                next = u.collection.EmptyStream
            }
        }
        return next
    }
    
    /** Returns a stream where each item is the result of calling mapping on items from this stream 
     * @params
     *   mapping:function
     */
    this.map = function(mapping)
    {
        var s = this
        return new u.collection.Stream(function()
        {
            var item = s.head()
            s = s.tail()
            return item != u.nil ? mapping(item) : item
        })
    }
    
    /** 
     * Returns the result of calling the reducer function on each item of the stream 
     * @params
     *   initial:* the initial value that is passed to the first call to reducer
     *   reducer:function a function that is passed two parameters, the current accumulated 
     *                    value/total and the current value
     * @return:* the final accumulated value/total
     */
    this.reduce = function(initial, reducer)
    {
        var acc = initial
        this.each(function(item)
        {
            acc = reducer(acc, item)
        })
        return acc
    }
    
    /**
     * Returns a stream which contains all the items from this stream that the test function
     * returns true for.
     * @params
     *   tester:function is passed each item from the stream and should return true if it should
     *                   stay in the new stream
     * @return:u.collection.Stream 
     */
    this.filter = function(tester)
    {
        function nextMatch(stream)
        {
            return (!stream.hasValues() || tester(stream.head())) ? stream : nextMatch(stream.tail())
        }
        
        var s = this
        return new u.collection.Stream(function()
        {
            s = nextMatch(s)
            var v = s.head()
            s = s.tail()
            return v
        })
    }
    
    /** 
     * Passes each item of the stream in turn to the iterator function.
     * @params
     *   iterator:function
     */
    this.each = function(iterator)
    {
        var s = this
        while (s.hasValues())
        {
            iterator(s.head())
            s = s.tail()
        }
    }
    
    /**
     * Uses the given reader to read the stream one item at a time
     * 
     * @params
     * reader:function a function that will be passed the elements of the stream, one at a time
     *                 until it returns false 
     */
    this.read = function(reader)
    {
        if (this.hasValues())
        {
            var readNext = reader(head)
            if (readNext)
            {
                this.tail().read(reader)
            }
        }
    }
}



/** A {@u.collection.Stream} with no items. */
u.collection.EmptyStream = u.singleton(function()
{
    this.hasValues = u.returns(false)
    this.isEmpty = u.not(this.hasValues)
    this.head = u.returns(u.nil)
    this.tail = u.returns(this)
    this.read = u.noop
    this.map = u.noop
    this.reduce = function(initial, reducer)
    {
        return initial
    }
    this.filter = u.returns(this)
    this.each = u.noop
})


/** 
 * An abstract grouping of items 
 *  @params
 *    iterator:function a function which will return the next item in the collection with each call, 
 *                      returning u.nil if there are no more items to return
 * @extends u.collection.Stream
 */
u.collection.Collection = function(iterator)
{
    u.mixin(this, new u.collection.Stream(iterator))
    
    var array = u.nil
    
    /** 
     * Returns true if `test` return true for every item in the list. 
     * @params
     *   test:function
     * @return:boolean
     */
    this.every = function(test)
    {
        return this.reduce(true, function(every, item)
        {
            return every && test(item)
        })
    }
    
    /** 
     * Returns true if `test` returns true for any item in the list.
     * @params
     *   test:function
     * @return:boolean
     */
    this.any = function(test)
    {
        return this.reduce(false, function(any, item)
        {
            return any || test(item)
        })
    }
    
    /**
     * Returns true if the given item can be found in the collection.
     * @params
     *   toMatch:*
     */
    this.contains = function(toMatch)
    {
        return this.any(function(item)
        {
            return item == toMatch
        })
    }
    
    /**
     * Returns the number of items in the collection.
     * @return:number
     */
    this.size = function()
    {
        return this.asArray().length
    }
    
    this.toString = function()
    {
        return '[' + this.asArray().join(', ') + ']'
    }
    
    /** 
     * Returns the contents of this collection in order as an array.
     * @return:*[]
     */
    this.asArray = function()
    {
        if (array.isNil)
        {
            array = []
            this.each(array.push.bind(array))
        }
        return array
    }
}