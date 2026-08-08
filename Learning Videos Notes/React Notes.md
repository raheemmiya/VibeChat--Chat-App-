react first renders the whole page then forgets about the variables 

then when the variable is changed then it still does not shows in the screen as it does not rerenders as it doesnot know the variable was changed 

so when react does rerender it still shows the original variable value but not the updated one because it creates a new variable because of the rerendering, it forgets about what was happened to thelast one 

so to let react rember the variable values, we use state, 

so when a state is changed, react senses some thing is changed, so it rerenders the whole page, then displays the updated state in teh ui, 

so it goes on and on, 

now similar to state there is useRef, this data structure also is stored inside of the react memory, and when it is changed then the react stores the new value but it doesnot rerender the ui 
----------------------
- question, suppose changing the ref somehow changed something in the ui, will react rerender the component, and will it still remember the updated ref value? 

no, even the ref changes the ui, react will still not now if anything is changed. so it still displays the same old value of ref not the current one. 

but if a state is chnaged then the updated value of ref will be remembered by the react and displays in the UI. 

---------------------------

STATE vs REF

- to  make something in the UI appear we use state, 
- to do some tasks behind the scene then we use useref 

USEEFFECT () 
- so it is run a single time as per the dependency variable, after rendering the whole component 

- render - paint screen - runs the effect


RENDERIING: NESTED RENDERS, STATE VARIABLES 

- so when the parent is rerendered because of the state changed in the parent component, 
then the child also rerenders 

-when doing so, the child state will be rememberd by the react but if there was a variable then it would be recreated? 

------------------------------
-suppose there is a useRef inside a context which is accessed by both the parent and the child, then as chaning the useref does not cause the rerendering, then if the parent updates the useref value then will child also get the updated value?

-yes child will get the updated ref, and it will be stored in the js memory 
-----------------------------


-also if the useref property is so, then chanigng a local or a global variable also doenot trigger the rerendering, then why not just use the text varible, i mean if the parent updates the text, will not the child also get the updated text ? 




React re-executes the affected component function(s), compares the new JSX with the previous JSX, and only updates the parts of the real DOM that actually changed.