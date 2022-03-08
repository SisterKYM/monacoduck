/**
 * Cart Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Cart template.
 *
 * @namespace cart
 * @file vendors@template.cart.js
 * @file template.cart.js
 *
 */

 document.addEventListener('page:loaded', function () {
  /** =========================================================== **/
  /** =========     PRODUCT JAVASCRIPT FUNCTIONS    ============= **/
  /** =========================================================== **/
  window.custom = window.custom || {};
 
  jQuery(function ($) {

    /**
     * Sample function title
     * Sample function description - in short what it does and/or returns
     * @params  takes some parameters
     * @returns something
     */
    custom.initMyCartFunction = function() {
      console.log("Cart JS ready...");
    }

    /**
     * Function for ajax update qty from drop-down select box
     */
    custom.initAjaxCartFunctions = function() {
      const ajaxOverlay = `
        <div 
          id="cart__ajax-overlay"
          style="display: none; position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 1000; background: rgba(255,255,255,0.4);"
        ></div>
      `;
      $(ajaxOverlay).appendTo("body");
      
      // Quantity update
      $("body").on("change", "select[id^=cart_updates]", function(e) {
        $("#cart__ajax-overlay").show();
        let qty = parseInt($(this).val());
        const variant_id = $(this).parents(".cart__product").data("id");
        let data = {
          updates: {
            [variant_id]: qty
          }
        };
        $.ajax({
          type: "post",
          url: "/cart/update.js",
          data: data,
          dataType: "json",
          success: function(cart) {
            updateCartTotals(cart);
            $("#cart-counter").html(cart.item_count);
            if(qty == 0) {
              $(e.target).parents(".cart__product").remove();
            }
            $("#cart__ajax-overlay").hide();
          }
        });
      });

      // Product remove
      $("body").on("click", ".cart__button-remove", function(e) {
        e.preventDefault();
        $("#cart__ajax-overlay").show();
        let qty = 0;
        const variant_id = $(this).parents(".cart__product").data("id");
        let data = {
          updates: {
            [variant_id]: qty
          }
        };
        $.ajax({
          type: "post",
          url: "/cart/update.js",
          data: data,
          dataType: "json",
          success: function(cart) {
            updateCartTotals(cart);
            $("#cart-counter").html(cart.item_count);
            $(e.target).parents(".cart__product").remove();
            $("#cart__ajax-overlay").hide();
          }
        });
      });

      function updateCartTotals(jsonCart) {
        jsonCart.items.forEach(function(item) {
          let product_total = $("#cart__price--" + item.id);
          product_total.html(formatPrice(item.price * item.quantity));
          if(item.quantity == 1) {
            product_total.hide();
          }
          else {
            product_total.show();
          }
        });
        $("#cart__total-price").html(formatPrice(jsonCart.total_price));
      }

      function formatPrice(price) {
        var cents = "";
        if (price % 100 < 10) {
          cents = "0";   
        }
        price = parseInt(price/100) + "," + cents + price % 100;
        return "€" + price;
      }
    }

    /** =============================================== **/
    /** ========= INIT custom functions =========== **/
    /** =============================================== **/
    custom.initMyCartFunction();

    custom.initAjaxCartFunctions();
    /** =============================================== **/

  });
});