WEXAMINE
========



COPYRIGHT
---------
Copyright Romain WEEGER 2014  
http://www.wexample.com  
  
Licensed under the MIT and GPL licenses :  
  
 - http://www.opensource.org/licenses/mit-license.php  
 - http://www.gnu.org/licenses/gpl.html

DESCRIPTION
-----------
Wexamine  
========  
  
Wexamine is a simple javascript objects diff tool for your developement tests. It allow you to make snapshots of your objects and of the global window, and keep an eye of every change.  
  
  
```javascript  
// Take a first snapshot of you object.  
wexamine.variableSnap('testObject', testObject);  
  
// Continue your code...  
  
// Then inspect changes in your console.  
wexamine.changeLog('testObject', testObject);  
```  
  
Your console will display informations about changes :  
```  
wexamine> testObject.chub: object value changed : "foo" to "bar".  
wexamine> testObject.baz: object type changed : undefined to string (woop).  
```  
  
Usage  
-----  
  
Download and install the wexamin.js file on your test environment.  
  
```javascript  
// First take a snapshot of window object.  
wexamine.windowSnap();  
  
// Create an object  
var testObject = {  
    bat: 'man',  
    spider: 'man',  
    chub: 'morris',  
    arr: [  
      'foo',  
      'bar'  
    ]};  
  
// Create a snapshot of your object  
wexamine.variableSnap('testObject', testObject);  
  
// Edit your object.  
delete testObject.bat;  
testObject.bar = 'man';  
testObject.chub = 'loris';  
  
// This display changes into console.  
wexamine.changeLog('testObject', testObject);  
  
// Retirve diff for another use.  
var result = wexamine.variableCheck('testObject', testObject);  
console.error(result);  
  
// Check with ignore.  
wexamine.changeLog('testObject', testObject, [  
  'root.chub' // Don't alert on 'chub' key changes.  
]);  
  
// Check changes on window global object.  
wexamine.windowChangeLog();  
  
// Retirve diff for another use.  
var result = wexamine.windowCheck();  
console.error(result);  
  
  
```

THANKS
------
I would like to thanks all people who have trusted an encouraged me, consciously or not. Like all of my projects, this program is the result of a lot of loneliness, questions, doubts, pain, but hope and love too. I sincerely hope you'll enjoy it. Thanks to Carole for her incredible Love.