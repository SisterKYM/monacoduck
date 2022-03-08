/**
 * Theme Layout Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts and styles for all pages.
 *
 */

/**
 * Javascript-Equal-Height-Responsive-Rows
 * https://github.com/Sam152/Javascript-Equal-Height-Responsive-Rows
 */
(function ($) {
  'use strict'; $.fn.equalHeight = function () {
    var heights = []; $.each(this, function (i, element) {
      var $element = $(element); var elementHeight; var includePadding = ($element.css('box-sizing') === 'border-box') || ($element.css('-moz-box-sizing') === 'border-box'); if (includePadding) { elementHeight = $element.innerHeight(); } else { elementHeight = $element.height(); }
      heights.push(elementHeight);
    }); this.css('height', Math.max.apply(window, heights) + 'px'); return this;
  }; $.fn.equalHeightGrid = function (columns) {
    var $tiles = this.filter(':visible'); $tiles.css('height', 'auto'); for (var i = 0; i < $tiles.length; i++) {
      if (i % columns === 0) {
        var row = $($tiles[i]); for (var n = 1; n < columns; n++) { row = row.add($tiles[i + n]); }
        row.equalHeight();
      }
    }
    return this;
  }; $.fn.detectGridColumns = function () { var offset = 0, cols = 0, $tiles = this.filter(':visible'); $tiles.each(function (i, elem) { var elemOffset = $(elem).offset().top; if (offset === 0 || elemOffset === offset) { cols++; offset = elemOffset; } else { return false; } }); return cols; }; var grids_event_uid = 0; $.fn.responsiveEqualHeightGrid = function () {
    var _this = this; var event_namespace = '.grids_' + grids_event_uid; _this.data('grids-event-namespace', event_namespace); function syncHeights() { var cols = _this.detectGridColumns(); _this.equalHeightGrid(cols); }
    $(window).bind('resize' + event_namespace + ' load' + event_namespace, syncHeights); syncHeights(); grids_event_uid++; return this;
  }; $.fn.responsiveEqualHeightGridDestroy = function () { var _this = this; _this.css('height', 'auto'); $(window).unbind(_this.data('grids-event-namespace')); return this; };
})(window.jQuery);

document.addEventListener('page:loaded', function () {
  /** =========================================================== **/
  /** =========      GLOBAL JAVASCRIPT FUNCTIONS    ============= **/
  /** =========================================================== **/
  window.custom = window.custom || {};
  jQuery(function ($) {

    /**
     * Sample function title
     * Sample function description - in short what it does and/or returns
     * @params  takes some parameters
     * @returns something
     */
    custom.initMyGlobalFunction = function () {
      console.log("Global JS ready...");
    }

    /**
     * Add cart products counter
     */
    custom.CartProductsCounter = function () {
      document.addEventListener('cart:updated', function (evt) {
        // adjust quantity
        var cartCount = evt.detail.cart.item_count;
        $("#cart-counter").html(cartCount);
      });
    }

    /**
     * Function for Cart Upsell product
     */
    custom.initCartUpsell = function () {
      //drawer cart upsell init
      document.addEventListener('cart:updated', function (evt) {
        upsell_init();
      });

      //cart page upsell init
      upsell_init();

      function upsell_init() {
        if (!$(".upsell-add").length) return;

        //move upsell modals from drawer cart into body (appearance fix)
        $("#Upsell__ProductModals-container").appendTo("body");

        //initiate modals
        $(".btnSelectSize").each(function () {
          let modalId = "ProductModal-" + $(this).data("product-id");
          let name = modalId; // name = class on modal open button
          let modal = new theme.Modals(modalId, name);

          //size button click
          modal.$modal.find(".upsell-product__size-button").each(function (k, button) {
            $(button).bind("click", function () {
              let variant_id = $(this).data("variant-id");
              window.addUpsellProduct(variant_id);
              modal.close();
            });
          });
          console.log("Upsell products initialized!");
        });

        window.addUpsellProduct = function (variant_id) {
          $.ajax({
            url: '/cart/add.js',
            data: {
              items: [
                {
                  quantity: 1,
                  id: variant_id
                }
              ]
            },
            dataType: "json",
            success: function (response) {
              console.log("Product added:" + variant_id);
              window.location.reload();
            }
          });
        }
      }
    }


    /**
     * Drawer menu only one expanded item
     */
    $("#NavDrawer").find(".collapsible-trigger").on("click", function () {
      let $collapsible_triggers = $(this).closest("ul").find(".collapsible-trigger").not($(this));
      $collapsible_triggers.removeClass("is-open");
      let $collapsible = $(this).closest("ul").find(".collapsible-content");
      $collapsible.removeClass("is-open").css("height", "0px");
    });

    /**
    * Mobile menu 3rd page sliding
    */
    custom.MobileMenuSliding = function () {
      $("#NavDrawer").find(".page-3-trigger").bind("click", function () {
        let triggeredContent = $("#" + $(this).attr("aria-controls"));
        let menuTitle = $(this).parent().text();
        if (menuTitle == "") {
          menuTitle = "Back";
        }
        $("#drawer__sliding-page .sliding__heading").html(menuTitle);
        $("#drawer__sliding-page .sliding__content").html(triggeredContent.html());
        $("#NavDrawer").addClass("page-3-active");
      });
      $("#drawer__sliding-page .sliding__heading").bind("click", function () {
        $("#NavDrawer").removeClass("page-3-active");
        $("#NavDrawer").find(".page-3-trigger").removeClass("is-open");
      });
    }

    /** 
     * Mobile Menu bar jumping fix
     */
    if ($(window).width() <= 798
      && $("#shopify-section-header .announcement-bar").length // need only when announcement bar enabled
      && $("body").hasClass("template-index") // need only on home page
    ) {
      let lastScrollTop = 0;
      $(window).scroll(function () {
        let scroll = $(window).scrollTop();
        let direction = scroll > lastScrollTop && "down" || "up";
        let header_sticky = $("#shopify-section-header").find(".header-sticky-wrapper").not(".homepage-logo-scroll-wrapper").find(".header-wrapper--sticky");
        let offset_initial = 66;
        let offset_top = 15;
        let offset_new = 0;
        if (direction == "down") {
          offset_new = offset_initial - scroll;
          if (offset_new < offset_top) {
            offset_new = offset_top;
          }
        }
        else {
          offset_new = offset_top;
          if (scroll < offset_top) {
            offset_new = offset_initial;
          }
        }
        header_sticky[0].setAttribute("style", "top: " + offset_new + "px !important;");
        lastScrollTop = scroll;
      });
    }

    custom.updateTrustedShopsWidget = function () {

      // hide TS Widget when menu opens
      document.getElementById("openNav").addEventListener("click", function (event) {

        const getTSWidgetElId = document.querySelector('[id^="trustbadge-container-"]').id;
        const selectorTSWidget = document.getElementById(getTSWidgetElId);
        const gorgiasWidgetEl = document.getElementById("gorgias-chat-container");

        gorgiasWidgetEl.style.display = "none";
        selectorTSWidget.style.display = "none";

        event.stopPropagation();

      });
    }

    /* Wishlist button click callback */
    $(".swym-button").bind("click", function () {
      let header_icon = $(".site-nav__link.swym-wishlist");
      setTimeout(function () {
        window._swat.fetchWrtEventTypeET(
          function (r) {
            if (r.length == 0) {
              header_icon.removeClass('active');
            }
            else {
              header_icon.addClass('active');
            }
          }
        );
      }, 500);
    });

    /**
     * Video play button
     */
    let play_btns = document.querySelectorAll(".video_play_btn");
    if(play_btns.length > 0) {
      play_btns.forEach(play_btn => {
        play_btn.addEventListener('click', function (e) {
          let parent = e.target.closest('.hero').querySelector('.hero__media-container');
          parent.classList.remove('hide');
          YoutubeDefer.loadVideo(parent.querySelector(".youtube-video-deferred"));
        });
      });
    }

    const $blogGridDivEl = $('#blog-grid > div');
    if ($blogGridDivEl.length > 0) {
      $blogGridDivEl.responsiveEqualHeightGrid();
    }

    
    /** =============================================== **/
    /** ========= INIT custom functions =========== **/
    /** =============================================== **/
    custom.initMyGlobalFunction();

    custom.CartProductsCounter();
    custom.initCartUpsell();
    custom.MobileMenuSliding();
    custom.updateTrustedShopsWidget();
    /** =============================================== **/
  });
});