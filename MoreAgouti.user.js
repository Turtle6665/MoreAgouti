// ==UserScript==
// @name         MoreAgouti
// @namespace    https://github.com/Turtle6665/MoreAgouti
// @version      1.0
// @description  Enhances the functionality and user experience of the Agouti web application.
// @license      MIT
// @match        https://agouti.eu/*
// @match        https://*.agouti.eu/*
// @updateURL    https://raw.githubusercontent.com/Turtle6665/MoreAgouti/main/MoreAgouti.user.js
// @downloadURL  https://raw.githubusercontent.com/Turtle6665/MoreAgouti/main/MoreAgouti.user.js
// ==/UserScript==

// Contrast and brightness Keybinding (the contrast is adjusted at the same time as the brightness)
// UpKey       : increase brightness
// DownKey     : decrease brightness
// PageDownKey : Reset brightness
// PageUpKey   : Reset the zoom
let Key_increase_brightness = "ArrowUp"   // the Up Key
let Key_decrease_brightness = "ArrowDown" // the Down Key
let Key_Reset_brightness    = "PageDown"  // the Page Down Key
let Key_Reset_zoom          = "PageUp"    // the Page Up Key

let n = 0
onkeydown = (event) => {
	//once a key is pressed
	if(window.location.href.indexOf("sequence")>-1){
		//if the url contains sequence
		
		if(Math.abs(contrast.value) < 0.001&&Math.abs(brightness.value) < 0.001){
			//reset the value of n if the contrast and brightness are more or less null
			n=0; 
		}
		
		if([Key_increase_brightness,Key_decrease_brightness, Key_Reset_brightness,Key_Reset_zoom].includes(event.key)){
			//preventDefault if the keypressed is one of set one
			event.preventDefault()
		}	
		if(event.key==Key_increase_brightness){
			//if key pressed is the increase brightness one : increase brightness and change contrast acordingly.
			
			// to have a diffrent contrast behavour for when brightness is below 0 and above 0, the n keeps track of how mutch the up and down arrows have been pressed.
			if( n >=0 ){
				cont = 0.486059;  brig = 0.329219;
			}else{
				brig = 0.7290885;  cont= -0.3;
			}
			contrast.value = parseFloat(contrast.value) + cont/(2+Math.abs(n)); 
			brightness.value = parseFloat(brightness.value)+brig/(2+Math.abs(n));
			n +=1;
			//fake a change event on the contrast and brightness to update the image directly. 
			contrast.dispatchEvent(new Event("change"));
			brightness.dispatchEvent(new Event("change"));
		}else if(event.key==Key_decrease_brightness){
			//if key pressed is the decrease brightness one : decrease brightness and change contrast acordingly.
			
			// to have a diffrent contrast behavour for when brightness is below 0 and above 0, the n keeps track of how mutch the up and down arrows have been pressed.
			n -=1;
			if( n >=0 ){
				cont = 0.486059; brig = 0.329219;
			}else{
				brig = 0.7290885;  cont= -0.3;
			}
			contrast.value = contrast.value - cont/(2+Math.abs(n)); 
			brightness.value = brightness.value-brig/(2+Math.abs(n));
			//fake a change event on the contrast and brightness to update the image directly.
			contrast.dispatchEvent(new Event("change"));
			brightness.dispatchEvent(new Event("change"));
		}else if(event.key==Key_Reset_brightness){
			//if key pressed is the reset brightness one, set contrast and brightness to 0.
			contrast.value = 0.0; 
			brightness.value= 0.0;
			n =0;
			//fake a change event on the contrast and brightness to update the image directly.
			contrast.dispatchEvent(new Event("change"));
			brightness.dispatchEvent(new Event("change"));
		}else if(event.key==Key_Reset_zoom){
			//reset zoom by fake clicking to the reset zoom button
			document.getElementsByClassName("action")[1].click()
		}
		
		//saveguards for when the brightness and contrast are set to be out of [-1,1]
		if(contrast.value<-1){contrast.value = -1}
		else if (contrast.value>1){contrast.value = 1}
		else if (brightness.value>1){brightness.value = 1}
		else if (brightness.value<-1){brightness.value = -1}
	}
};


// Remove last shortcut Species button
// it adds the ability to remove the last shortcut Species
// you have to validate by clicking once again


var observeDOM = (function(){
  //a function to trigger update when a DOM element changes
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  return function( obj, callback ){
    if( !obj || obj.nodeType !== 1 ) return; 

    if( MutationObserver ){
      // define a new observer
      var mutationObserver = new MutationObserver(callback)

      // have the observer observe for changes in children
      mutationObserver.observe( obj, { childList:true, subtree:true })
      return mutationObserver
    }
    
    // browser support fallback
    else if( window.addEventListener ){
      obj.addEventListener('DOMNodeInserted', callback, false)
      obj.addEventListener('DOMNodeRemoved', callback, false)
    }
  }
})()


removeLastShortcutSpecies = function(validated = false){
	//function to handle click on the Remove last shortcut Species button.
	
	//select the Remove last shortcut Species button
	rmbtn = [...document.getElementsByClassName("app--annotate-sequence--form")[0].getElementsByTagName("button")].slice(-1,)[0]
	if(validated){
		//if already clicked once, this validate the removal of the last shortcut species : 
		
		//find the name of the localStorageElement containing the list of shortcut species of this project
		localstorName = "shortcutSpecies_"+window.location.href.split("/")[5]
		
		//getting only the non duplicate values onf the list from the localStorage.
		shortcutList = JSON.parse(localStorage.getItem(localstorName)).filter((value, index, array) => array.indexOf(value) === index) 
		
		//get the last shortcut species button
		lastbtn = [...document.getElementsByClassName("app--annotate-sequence--form")[0].getElementsByTagName("button")].slice(-2,)[0]
		
		//set the localStorageElement without the last species
		localStorage.setItem(localstorName,JSON.stringify(shortcutList.slice(0,-1)))
		
		//remove the last species button and the remove button (it will be replaced by a new one)
		lastbtn.remove()
		rmbtn.remove()
	}else{
		//if it's the first click, ask for a validation.
		Object.assign(rmbtn,{textContent:"Are you sure ?"});
		//change the onclick function
		rmbtn.onclick = function(){removeLastShortcutSpecies(true);};
		//add a event listener for when the mouse is out of the button
		rmbtn.addEventListener("mouseout", ()=>{
			//reset the button by deleting it (a new one will be placed)
			rmbtn.remove()
		});
	}
}

observeDOM(document.body, ()=>{
	//if the page changes (the body is updated)
	if(window.location.href.indexOf("sequence")>-1){
		//if the URL contains sequence
		mainel = document.getElementsByClassName("app--annotate-sequence--form-content")[0];
		if(!(mainel == null)){
			//if the page contains the list of shortcut species
			document.body.addEventListener("mouseover", ()=>{
				//when the user has his mouse over the app
				if((mainel.getElementsByClassName("rmLastbtn").length < 1)&&
				   (mainel.querySelectorAll(".app--annotate-sequence--form-content>button").length >= 1)){
					//add the "Remove last shortcut Species" only if not present and one shortcut or more are present. 
					Newbutton = document.createElement("button");
					Object.assign(Newbutton, {"className":"btn btn-outline-secondary-orange margin-top-1 rmLastbtn", textContent:"Remove last shortcut Species", style:"width:100%"});
					Newbutton.onclick = function(){removeLastShortcutSpecies();};
					mainel.append(Newbutton);
				}
			});
		}
	}
})