/**
 * Product Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Product template.
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
    custom.initMyProductFunction = function() {
      console.log("Product JS ready...");
    }

    /**
     * Function for ajax add to cart
     */
    custom.AjaxAddToCart = function() {
      let addToCartBtn = document.querySelector("button.add-to-cart");
      let addToCartForm = document.querySelector('form[action="/cart/add"]');
      let addToCartModal = document.querySelector("#modal__add-to-cart");
      let addToCartModalProdTitle = document.querySelector("#modal__add-to-cart .modal__body");
      let addToCartModalClose = document.querySelectorAll("#modal__add-to-cart .close");

      const showModalAddToCart = function(title, error = false) {
        changePopupVisibility(addToCartModal, "show"); //show notification msg
        addToCartModalProdTitle.innerHTML = title; //change
        setTimeout(() => {
          //hide notification msg
          changePopupVisibility(addToCartModal, "hide");
        }, 8000);
      }

      const changePopupVisibility = function(elem, type) {
        let disp = (type == "show" ? "display" : "none");
        let opac = (type == "show" ? "1" : "0"); //for slowly effect elem must have transition prop.
        elem.setAttribute("style","") //empty style attr for bugs free load
        elem.style.opacity = opac;
        elem.style.display = disp.toString();
      }
    
      const fetchAddToCart = function(formData) {
        fetch("/cart/add.js", {
          method: "POST", 
          body: formData,
        })
        .then((response) => {
          return response.json();
        })
        .then((product) => {
          showModalAddToCart(product.product_title);
          if($("#cart-counter").html() != "") {
            let value = parseInt($("#cart-counter").html()) + 1;
            $("#cart-counter").html(value); 
          }
          else {
            $("#cart-counter").html("1");
            $("header .cart-link__bubble").addClass("cart-link__bubble--visible");
          }

          // fire custom trackings
          sendCustomTrackingEvents(product);
        });
      }

      const sendCustomTrackingEvents = function(product) {
        window.dataLayer = window.dataLayer || [];

        // format price
        let priceFormatNice = product.price / 100;
        
        window.dataLayer.push({
          'event': 'addToCart',
          'ecommerce': {
            'currencyCode': 'EUR',
            'add': {                                // 'add' actionFieldObject measures.
              'products': [{                        //  adding a product to a shopping cart.
                'name': product.title,
                'id': product.id,
                'price': priceFormatNice.toFixed(2),
                'brand': product.vendor,
                'category': product.product_type,
                'variant': product.variant_title,
                'quantity': product.quantity
              }]
            }
          }
        });
  
        console.log(window.dataLayer);
      }

      if(addToCartBtn != null) {
        addToCartBtn.addEventListener("click", function (e) {
          e.preventDefault(); // stop default addtoCart process
          let formData = new FormData(addToCartForm); // colect data from the page form on Click
          fetchAddToCart(formData); //fetch data from Shopify Ajax Api
        });
      }

      if(addToCartModalClose.length != 0) {
        addToCartModalClose.forEach(function(el) {
          el.addEventListener("click", function (e) {
            e.preventDefault();
            changePopupVisibility(addToCartModal, "hide");
          });
        });
      }
    }

    /**
     * Sticky AddToCart Button
     */
    custom.StickyAddToCart = () => {
      let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const newDiv = document.createElement("div");
      newDiv.id ="stickyAddToCartDiv";
      newDiv.style= `
        width: 100%;
      `;
      let priceDiv = document.createElement("div");
      priceDiv.style=`
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      `;
      
      let venderspan = document.createElement("span")
      venderspan.style = `font-size: calc(var(--typeBaseSize)*.85);display: flex;align-items: center;`
      let vendorname =  document.getElementById('productSingleData').dataset.productVendor;
      let producttitle =  document.getElementById('productSingleData').dataset.productTitle;
      venderspan.innerHTML = producttitle;
      let price_text = document.querySelector('span.product__price').cloneNode(true);
      price_text.style = `font-size: calc(var(--typeBaseSize)*.85);`
      if(width > 768){
        let thumbImage = document.querySelector(".product__thumb-item img").cloneNode(true);
        thumbImage.style = `width: 30px; margin: 0 5px`;
        venderspan.prepend(thumbImage)
      }
      priceDiv.appendChild(venderspan);
      priceDiv.appendChild(price_text);
      
      let button = document.querySelector("button[id*=AddToCart]").cloneNode(true);
      button.id = "StickyAddToCart";
      button.type = "";
      button.name = "";
      button.style= `
        border: none;
        border-radius: 10px;
        color: #fff;
        background: #ffbe28;
        text-transform: none;
        font-size: calc(var(--typeBaseSize)*.85);
        z-index: 5;
        width: 100%;
      `;
      if(width>768){
        newDiv.style= `
          width: 100%;
        `;
        button.style= `
          border: none;
          border-radius: 10px;
          color: #fff;
          background: #ffbe28;
          text-transform: none;
          font-size: calc(var(--typeBaseSize)*.85);
          z-index: 5;
          max-width: 250px;
        `;
      }
      newDiv.appendChild(priceDiv)
      newDiv.appendChild(button)
      button.addEventListener('click', event => {
        let button = document.querySelector("button[id*=AddToCart]"); 
        button.scrollIntoView({block: "center", behavior: "smooth"}); 
        return false;
      });
      document.body.appendChild(newDiv);

      // Scroll
      window.addEventListener('scroll', function(e) {
        let isButtonVisible = theme.isElementVisible($("button[id*=AddToCart]"));
        let StickyButton = document.getElementById("stickyAddToCartDiv");
        if(isButtonVisible) {
          StickyButton.style = StickyButton.getAttribute("style").replace("display: none;", "") + "display: none;";
        }
        else {
          StickyButton.style = StickyButton.getAttribute("style").replace("display: none;", "display: flex");
        }
      });
      window.dispatchEvent(new Event('scroll')); // initial state
    }

    /** =============================================== **/
    /** ========= INIT custom functions =========== **/
    /** =============================================== **/
    custom.initMyProductFunction();

    custom.AjaxAddToCart();
    custom.StickyAddToCart();
    /** =============================================== **/

  });
});