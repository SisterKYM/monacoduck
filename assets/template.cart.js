!function(t){var e={};function n(r){if(e[r])return e[r].exports;var a=e[r]={i:r,l:!1,exports:{}};return t[r].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)n.d(r,a,function(e){return t[e]}.bind(null,a));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=6)}({2:function(t,e){t.exports=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}},6:function(t,e,n){"use strict";n.r(e);var r=n(2),a=n.n(r);document.addEventListener("page:loaded",(function(){window.custom=window.custom||{},jQuery((function(t){custom.initMyCartFunction=function(){console.log("Cart JS ready...")},custom.initAjaxCartFunctions=function(){function e(e){e.items.forEach((function(e){var r=t("#cart__price--"+e.id);r.html(n(e.price*e.quantity)),1==e.quantity?r.hide():r.show()})),t("#cart__total-price").html(n(e.total_price))}function n(t){var e="";return t%100<10&&(e="0"),"€"+(t=parseInt(t/100)+","+e+t%100)}t('\n        <div \n          id="cart__ajax-overlay"\n          style="display: none; position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 1000; background: rgba(255,255,255,0.4);"\n        ></div>\n      ').appendTo("body"),t("body").on("change","select[id^=cart_updates]",(function(n){t("#cart__ajax-overlay").show();var r=parseInt(t(this).val()),o=t(this).parents(".cart__product").data("id"),c={updates:a()({},o,r)};t.ajax({type:"post",url:"/cart/update.js",data:c,dataType:"json",success:function(a){e(a),t("#cart-counter").html(a.item_count),0==r&&t(n.target).parents(".cart__product").remove(),t("#cart__ajax-overlay").hide()}})})),t("body").on("click",".cart__button-remove",(function(n){n.preventDefault(),t("#cart__ajax-overlay").show();var r=t(this).parents(".cart__product").data("id"),o={updates:a()({},r,0)};t.ajax({type:"post",url:"/cart/update.js",data:o,dataType:"json",success:function(r){e(r),t("#cart-counter").html(r.item_count),t(n.target).parents(".cart__product").remove(),t("#cart__ajax-overlay").hide()}})}))},custom.initMyCartFunction(),custom.initAjaxCartFunctions()}))}))}});