GUI Markup Format
=================

The GUI markup format uses a stripped-down version of [JSON](http://json.org) (Full JSON is accepted too), which allows quotes to be omitted for simple cases. Since most cases in GUI configuration are simple, this saves lots of typing and has a very clean look.  

The rules that depart from JSON are:

  * single quotes can be used instead of double quotes, providing that single quotes in values are escaped with backslash ('`\`')
  * the first part of a pair (the 'key' on the left) can omit it's quotes if it contains no spaces
  * the second part of a pair (the 'value' on the right) can omit it's quotes if it contains no spaces. Note that in this case whitespace is required after the value to delimit it from the next value's key/left-side

