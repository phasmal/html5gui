u.collection = {}

/**
 * A sequence of items that can be accessed, one at a time in sequence. Streams cannot contain
 * {@u.nil} items
 * @params
 *   items:(*[]|string|function) the items for the stream, one of:
 *     * array, whose elements are the items
 *     * string, whose characters are the items
 *     * function, which returns an item for each iteration, returning u.end once there are no more
 *       items
 */
u.collection.Stream = function(items)
{
    var iterator
    
    // returns a function which calls i for each call but skips past any nils returned by i()
    function stripNils(i)
    {
        function nextNonNil(j)
        {
            var val = j()
            return val == u.nil ? nextNonNil(j) : val
        }
        
        return function()
        {
            return nextNonNil(i)
        }
    }
    
    if (u.isArrayLike(items))
    {
        iterator = u.immediate(function()
        {
            var i = 0
            var f = function()
            {
                return i < items.length ? items[i++] : u.end
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
        iterator = u.returns(u.end)
    }
    
    iterator = stripNils(iterator)
    
    var head = iterator()
    var hasValues = u.returns(head != u.end)
    var tail = u.once(function()
    {
        var next = hasValues() ? new u.collection.Stream(iterator) : u.collection.EmptyStream
        if (next.isEmpty())
        {
            next = u.collection.EmptyStream
        }
        return next
    })
    
    var each = function(iterator)
    {
        if (hasValues())
        {
            iterator(head)
            tail().each(iterator)
        }
    }
    
    var reduce = function(initial, reducer)
    {
        var acc = initial
        each(function(item)
        {
            acc = reducer(acc, item)
        })
        return acc
    }
    
    /** 
     * Returns true if this stream has any values in it. This means that a call to {@#head()} will
     * return a value.
     *  
     * @return:boolean
     */
    this.hasValues = hasValues
    
    /**
     * Returns true if there are no more values in this stream. This means  a call to {@#head()}
     * returns u.end.
     * @return:boolean
     */
    this.isEmpty = u.not(hasValues)
    
    /** 
     * Returns the item at the head of the stream, {@u.end} if there are no items in the stream. 
     * @return:*
     */
    this.head = u.returns(head)
    
    /** 
     * Returns the remainder of the stream (a stream containing everything except for the head). If
     * this stream has no elements, then this is returned.
     * @return:u.collection.Stream
     */
    this.tail = tail
    
    /** 
     * Returns an iterator function which will return each item of this stream for successive calls,
     * {@u.end} if there are no more stream items to return.
     */
    this.iterator = function()
    {
        var s = this
        
        return function()
        {
            var h = s.head()
            s = s.tail()
            return h
        }
    }
    
    /** 
     * Returns a stream where each item is the result of calling mapping on items from this stream.
     * If mapping returns {@u.nil} for an item, then nothing is added to the new stream for that item.
     * 
     * @params
     *   mapping:function
     * @return:u.collection.Stream
     */
    this.map = function(mapping)
    {
        var s = this
        return new u.collection.Stream(function()
        {
            var item = s.head()
            s = s.tail()
            return item != u.end ? mapping(item) : u.end
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
    this.reduce = reduce
    
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
    this.each = each
    
    /**
     * Uses the given reader to read the stream one item at a time
     * 
     * @params
     * reader:function a function that will be passed the elements of the stream, one at a time
     *                 until it returns false 
     */
    this.read = function(reader)
    {
        if (hasValues())
        {
            var readNext = reader(head)
            if (readNext)
            {
                tail().read(reader)
            }
        }
    }
    
    /**
     * Returns a string representation of this stream. This is only valid for finite streams -
     * behavior is undefined if the stream is infinite.
     */
    this.asText = u.once(function()
    {
        return reduce('', function(text, item)
        {
            return text + ' ' + item
        })
    })
}



/** A {@u.collection.Stream} with no items. */
u.collection.EmptyStream = u.singleton(function()
{
    this.hasValues = u.returns(false)
    this.isEmpty = u.not(this.hasValues)
    this.head = u.returns(u.end)
    this.tail = u.returns(this)
    this.read = u.noop
    this.map = u.returns(this)
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
 *    iterator:string|*[]|function a string or array withe the collection items, or a function which 
 *                                 will return the next item in the collection with each call, 
 *                                 returning u.nil if there are no more items to return
 * @extends u.collection.Stream
 */
u.collection.Collection = function(iterator)
{
    u.mixin(this, new u.collection.Stream(iterator))
    
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
        return this.reduce(0, function(count, item)
        {
            return count + 1
        })
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
        var array = []
        this.each(array.push.bind(array))
        return array
    }
}

/**
 * A collection that can have items added to create new longer instances.
 * 
 * @params
 *    iterator:string|*[]|function a string or array with the initial list items, or a function 
 *                                 which will return the next item in the collection with each call, 
 *                                 returning u.nil if there are no more items to return
 * @extends u.collection.Collection
 */
u.collection.Accumulator = function(iterator, toadd, prevCount)
{
    var collection
    var list
    var count
    // if called from another accumulator's add() method
    if (u.isArray(iterator) && toadd !== null)
    {
console.log('called from acc add method with ' + iterator)
        if (prevCount != null) // copying in order to branch
        {
            list = u.arrayCopy(iterator, 0, prevCount + 1) // TODO only copy up to prevCount here
            list[prevCount] = toadd
            count = prevCount + 1
        }
        else // extending existing
        {
            list = iterator
            list.push(toadd)
            count = list.length
        }

        collection = u.mixin(this, u.immediate(function()
        {
            var i = 0
            return new u.collection.Collection(function() {
                return i >= count ? u.end : list[i++]
            })
        }))
    }
    else
    {
console.log('not called from acc add method')
        collection = u.mixin(this, new u.collection.Collection(iterator))
console.log(' ... called with: ' + collection.asArray())
        list = collection.asArray()
        count = list.length
    }
    
    // true if this accumulator has been added to - implements a copy-on-write for adding for the
    // second time to the same point in an accumulated stream
    var branched = false
    
    
    /**
     * Returns a new linked list which is equivalent to this one with the exception that it has
     * {item} as an additional item at the end of the sequence.
     * @params
     *   item:* the item to add to the end of the list
     */
    this.add = function(item)
    {
        var result
        if (!branched)
        {
            branched = true
            result = new u.collection.Accumulator(list, item)
        }
        else // already have used following elements of list, so copy whole list to new accumulator
        {
            result = new u.collection.Accumulator(list, item, count)
        }
        return result
    }
}


/**
 * A stream that supports reporting character and line locations. 
 * 
 * @params
 *   text:string
 *   
 * @throws if text is not a string
 */
u.collection.ParseStream = function(text)
{
    // private inner class
    // implementing the methods that are mixed into the encosing parse stream
    function PositionedStream(line, char, stream)
    {   
        u.mixin(this, stream)
        
        this.position = function()
        {
            return {
                line: line,
                char: char
            }
        }
        
        this.tail = u.once(function()
        {
            var nextLine = line
            var nextChar = char

            if (stream.head() === '\n')
            {
                nextLine++
                nextChar = 1
            }
            else
            {
                nextChar++
            }

            return new PositionedStream(nextLine, nextChar, stream.tail())
        })
    }
    
    // can't use instanceof since each PositionedStream is unique to it's enclosing ParseStream
    var argIsStream = text.constructor.name === 'PositionedStream'
    
    if (!u.isString(text) && !argIsStream)
    {
        throw new Error('Parameter to ParseStream must be a string. Param was:' + text)
    }
    
    var positioned = argIsStream ? text : new PositionedStream(1,1, new u.collection.Stream(text))
    
    u.mixin(this, positioned)
    
    this.tail = u.once(function()
    {
        return new u.collection.ParseStream(positioned.tail())
    })
}
