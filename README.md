jqmonthpicker
=============

A jQuery monthpicker widget. Supports a single month/year or range.

INSTALLATION:

Pretty simple. For those of you new to 3rd party jQuery plugins, simply include
a script tag AFTER your jQuery script tag with the .js file. Unless you're looking to modify the plugin,
go with the minified version.


USE:

The monthpicker can be added to any input field in a jQuery object, and will completely take over all input control.
Simply call:
` .monthpicker()
`
to get a basic single month/year picker with the standard colors.



OPTIONS:

Options can be set at initialization or changed at any time by reinvoking the monthpicker on any field
with a standard Javascript object as argument. (<a href="https://developer.mozilla.org/en/JavaScript/Guide/Working_with_Objects">Don't know what a Javascript Object is?</a>)
The options object has the following controls. Any and all can be included/omitted:

{
  "type": to create a single vs. a range based month picker. ('range' will create a range. Anything else is single),  
  "submitText": what the confirm button should say (any string),  
  "minPoint": the earliest pickable month (javascript date, 'mm/yyyy' string, or 'today'),  
  "maxPoint": the latest pickable month (javascript date, 'mm/yyyy' string, or 'today'),  
  "font": the font family used (any valid CSS for font family),  
  "colorDefault": for the month button backgrounds (any valid CSS for font color),  
  "colorHover": for hovering over the month button backgrounds (any valid CSS for font color),  
  "colorSelected": for selecting the month button (any valid CSS for font color),  
  "colorBknd": the widget's background color (any valid CSS for font color),  
  "colorMonthTxt": the color for the month abbreviations (any valid CSS for font color),  
  "colorYearTxt": the color for the year (any valid CSS for font color),  
  "fontSize": the font size used (any valid CSS for font size),  
  "font": the font family used (any valid CSS for font family),  
  "destroy": removes the widget (must send string 'destroy' as value)
}


TODO:

A nicer, more uniform CSS solution for the month scroll arrows.

NOTE: This plugin is _not_ extended from the jquery-ui project. 