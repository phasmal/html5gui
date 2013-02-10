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
    else if(u.isFunction(items))
    {
        iterator = items
    }
    else
    {
        iterator = u.returnValue(u.nil)
    }
    
    var head = iterator()
    var next = u.nil
    
    /** 
     * Returns true if this stream has any values in it. This means that a call to {@#head()} will
     * return a value.
     *  
     * @return:boolean
     */
    this.hasValue = u.returnValue(head != u.nil)
    
    /** 
     * Returns the item at the head of the stream, {@u.nil} if there are no items in the stream. 
     * @return:*
     */
    this.head = u.returnValue(head)
    
    /** Returns the remainder of the stream (a stream containing everything except for the head). If
     *  this stream has no elements, then a copy of this is returned.
     *  @return:u.collection.Stream
     */
    this.tail = function()
    {
        if (next.isNil)
        {
            next = this.hasValue() ? new u.collection.Stream(iterator) : this
            if (!next.hasValue())
            {
                next = u.collection.EmptyStream
            }
        }
        return next
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
        if (this.hasValue())
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
u.collection.EmptyStream = u.singleton(function(){
    this.hasValue = u.returnValue(false)
    this.head = u.returnValue(u.nil)
    this.tail = u.returnValue(this)
    this.read = u.noop
})