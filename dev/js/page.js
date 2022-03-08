

// <![CDATA[
window.SwymCallbacks = window.SwymCallbacks || [];

window.SwymCallbacks.push(function (swat) {

  // exit code if the element does exist
  if( document.querySelector("#swym-wishlist-render-container") === null) return;

  var wishlistContainerElement = document.querySelector("#swym-wishlist-render-container");

  swat.ui.renderWishlistInContainer(wishlistContainerElement);

  function convertToSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '')
      .replace(/-+/g, '');
  }

  function wishlistElement(productJson, item) {
    var productJSON = JSON.stringify(productJson);
    var itemJSON = JSON.stringify(item);
    var secondaryImg = '';
    if(productJson.images[1] != undefined) {
        secondaryImg += '<div data-bgset="'+productJson.images[1] +'"600w" class="grid__image-ratio grid__image-ratio--landscape grid-product__secondary-image small--hide" style="background-image: url('+productJson.images[1]+');"></div>';
    }
    // <span class="shopify-product-reviews-badge" data-id="${productJson.id}"></span>
    var html = '';
    var price = theme.Currency.formatMoney(productJson.price, theme.settings.moneyFormat);
    html += `
                <div key="${productJson.id}" data-product-handle="${productJson.handle}" class="grid__item grid-product small--one-half medium-up--one-quarter" data-aos="row-of-4">
                    <button class="swym-delete-btn btn-delete-swym swym-nav swym-is-button" data-remove='${itemJSON}' aria-label="Delete">X</button>
                    <div class="grid-product__content">
                        <a href="${productJson.url}" class="grid-product__link ">
                            <div class="grid-product__image-mask ${productJson.type}" type="${productJson.type}">
                                <div data-bgset="${item.iu} 600w" class="grid__image-ratio grid__image-ratio--landscape lazyload" style="background-image: url(${item.iu});"></div>
                                ${secondaryImg}
                            </div>
                            <div class="grid-product__meta">
                                <div class="grid-product__title grid-product__title--body">${productJson.title}</div>
                                
                                <div class="grid-product__price">
                                    <span class="money">${price}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                    <form id="quick-form--${productJson.id}" data-id="${productJson.id}" accept-charset="UTF-8" action="/cart/add" method="post" class="variants--form grid-product__colors grid-product__colors--${productJson.id}">
                        
                        <button type="submit" name="add" data-form="${productJson.id}" id="AddToCart-${productJson.id}" class="product-btn btn handler-${productJson.type} btn-default btn add-to-cart--handler add-to-cart hide">Add to cart</button>
                        <a data-product-data='${productJSON}' class="product-btn BIS_trigger btn btn-backinstock btn--default sold--out-${productJson.id} hide" style="cursor: pointer;" data-variant-id="${productJson.variants[0].id}">E-Mail wenn lieferbar</a>
                    </form>
                </div>
            `;
    $('#swym-wishlist-render-container-custom').append(html);
  }

  window._swat.fetchWrtEventTypeET(
    function (r) {
      // Get wishlist items
      if (r.length == 0) {
        $("#swym-wishlist-render-container-custom").append(window.wishlist_layout);
        $(".swym-wishlist.site-nav__link").addClass("ion-ios-heart-empty").removeClass("ion-ios-heart");
        return false;
      }
      let productArr = [];
      $.each(r, function (i, item) {
        if(productArr.indexOf(item.empi) == -1) {
            productArr.push(item.empi);
            window._swat.getProductDetails(
              item,
              function (productJson) {
                wishlistElement(productJson, item);
              },
              function (e) {
                console.log(e);
              }
            );
        }
      });
    },
    window._swat.EventTypes.addToWishList
  );
  $('body').on('click', '.btn-delete-swym', function (e) {
    e.preventDefault();
    var variantStringify = $(this).attr('data-remove');
    var variantJSON = JSON.parse(variantStringify);
    $('#swym-wishlist-render-container-custom').html('');
    window._swat.removeFromWishList(
      variantJSON,
      function (r) {
        window._swat.fetchWrtEventTypeET(
          function (r) {
            // Get wishlist items
            if (r.length == 0) {
                $("#swym-wishlist-render-container-custom").append(window.wishlist_layout);
                $(".swym-wishlist.site-nav__link").addClass("ion-ios-heart-empty").removeClass("ion-ios-heart");
                return false;
            }
            let productArr = [];
            $.each(r, function (i, item) {
                if(productArr.indexOf(item.empi) == -1) {
                    productArr.push(item.empi);
                    window._swat.getProductDetails(
                      item,
                      function (productJson) {
                        wishlistElement(productJson, item);
                      },
                      function (e) {
                        console.log(e);
                      }
                    );
                }
            });
          },
          window._swat.EventTypes.addToWishList
        );
      }
    );
  });
  
});
