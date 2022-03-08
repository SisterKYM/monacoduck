document.addEventListener('page:loaded', function () {
  jQuery(function ($) {
    /**
     * Color swatcher images
     * @param string currentClusterTag - tag for search products for
     * @param string currentHandle - handle for exclude current product 
     */
    function SingleProductImageSwatcher(currentClusterTag, currentHandle) {
      const $swatcherContainer = $("#color-swatcher-images .color-swatcher-images__variants"); // available colors will be appened here
      const query = currentClusterTag + '&resources[type]=product&resources[limit]=9&resources[options][fields]=tag';
      let colorsLoaded = 0;
      let allColorsLoaded = false;
      fetch("/search/suggest.json?q=" + query)
        .then(response => response.json())
        .then(suggestions => {
          products = suggestions.resources.results.products;
          products.forEach(function(productJson, k) {
            var params = {
              type: 'GET',
              url: `/products/${productJson.handle}.js`,
              dataType: 'json',
              success: function(product) {
                if(product.handle == currentHandle) return true;
                let parts = product.images[product.images.length -1].split("/");
                let file = parts[parts.length - 1];
                let image = file.replace(".", "_150x.");
                parts[parts.length - 1] = image;
                image = parts.join("/"); // fix image size
                let color = "";
                product.tags.forEach(function(tag) {
                  if(tag.includes("color:")) {
                    color = tag.split(":")[1];
                  }
                  if(tag.includes("swatch:")) {
                    color = tag.split(":")[1];
                  }
                });
                if(color == "") {
                  color = product.title.split(" / ")[1]; 
                }
                let layout = `
                  <div class="color-swatcher-images__variant">
                    <a href="/products/${product.handle}"
                      class="image"
                      title="${product.title}"
                      style="background-image: url('${image}')"
                    >
                    </a>
                    <span class="color">
                      ${color}
                    </span>
                  </div>
                `;
                $swatcherContainer.append(layout);
                
                colorsLoaded++;
                if(colorsLoaded == (products.length - 1)) {
                  allColorsLoaded = true;
                }
              },
              error: function(XMLHttpRequest, textStatus) {}
            };
        
            $.ajax(params);
          });
          
          if($swatcherContainer.height() > 150) {
            //$swatcherContainer.parent().addClass("multiline"); // need for show/hide "Show more" button
            //disabled for now
            $(".color-swatcher-images__show-more").bind("click", function() {
              $swatcherContainer.parent().toggleClass("expanded");
            });
          }
  
          // wait for all colors will be loaded
          let wait = 0;
          var waitForLoad = setInterval(function() {
            if(allColorsLoaded || wait > 15000) {
              clearInterval(waitForLoad);
              $swatcherContainer.parent().addClass("loaded");
              let colors = $swatcherContainer.find("> div:not(:first-child)");

              // sort colors
              let sorted = colors.sort(sorter);
              function sorter(a, b) {
                let color1 = a.querySelector(".color").innerText.trim();
                let color2 = b.querySelector(".color").innerText.trim();
                if(color1 < color2) return -1;
                if(color1 > color2) return 1;
                return 0;
              }
              $swatcherContainer.find("> div:not(:first-child)").remove();
              $swatcherContainer.append(sorted);

              // bind color click
              $swatcherContainer[0].querySelectorAll(".color-swatcher-images__variant").forEach(function(el) {
                el.addEventListener("click", function(e) {
                  $swatcherContainer[0].querySelectorAll(".color-swatcher-images__variant").forEach(function(color) {
                    color.classList.remove("active");
                  });
                  el.classList.add("active");
                });
              });
            }
            wait += 100;
          }, 50);
        });
    }

    // Init
    SingleProductImageSwatcher(currentClusterTag, currentHandle); // parameters are defined in the liquid template file
  });
});