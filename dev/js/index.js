// Import 3rd party libraries 
// ex: import "babel-polyfill";

// global namespace
window.home = window.home || {};

/**
 * page_type.functionName
 * Takes in a string and console logs input with text
 * 
 * @author <Mark Chang>
 * @param {string} page_type 
 */
home.initScriptsExample = function (page_type) {
  console.log(page_type + " ready...");
}

/** 
 * Wait for DOM 
 */
document.addEventListener("DOMContentLoaded", () => {

  // init
  home.initScriptsExample("Index JS");
  
});
