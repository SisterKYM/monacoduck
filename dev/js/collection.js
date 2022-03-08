// Import 3rd party libraries 
// ex: import "babel-polyfill";

// global namespace
window.collection = window.collection || {};

/**
 * page_type.functionName
 * Takes in a string and console logs input with text
 * 
 * @author <Mark Chang>
 * @param {string} page_type 
 */
collection.initScriptsExample = function (page_type) {
  console.log(page_type + " ready...");
}

/**
 * Wait for DOM 
 */
document.addEventListener("DOMContentLoaded", () => {

  // init
  collection.initScriptsExample("collection JS");
});
