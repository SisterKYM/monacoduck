/*
Impulse by Archetype Themes (https://archetypethemes.co)
  Access unminified JS in assets/theme.js

  Use this event listener to run your own JS outside of this file.
  Documentation - https://archetypethemes.co/blogs/impulse/javascript-events-for-developers

  document.addEventListener('page:loaded', function() {
    // Page has loaded and theme assets are ready
  });
*/

/* 

  Removed with Optimization

  theme.Variants, theme.Modals, cart, QtySelector, CartDrawer, 
  AjaxProduct, predictiveSearch, initQuickShop, preloadProductModal, 
  videoModal, RecentlyViewed, ProductMedia, collectionTemplate, 
  customerTemplates, Products, Recommendations, StoreAvailability, 
  CollectionHeader, CollectionSidebar, Collection, Maps, Blogs, Photoswipe
*/

window.theme = window.theme || {};

// Medium breakpoint is also set in theme.css.liquid and inline throughout some templates. Do not change values unless you know what you're doing.
theme.bp = {};
theme.bp.smallUp = 769;
theme.bp.small = theme.bp.smallUp - 1;

theme.config = {
  bpSmall: false,
  hasSessionStorage: true,
  hasLocalStorage: true,
  mediaQuerySmall: 'screen and (max-width: '+ theme.bp.small +'px)',
  mediaQuerySmallUp: 'screen and (min-width: '+ theme.bp.smallUp +'px)',
  youTubeReady: false,
  vimeoReady: false,
  vimeoLoading: false,
  isTouch: ('ontouchstart' in window) || window.DocumentTouch && window.document instanceof DocumentTouch || window.navigator.maxTouchPoints || window.navigator.msMaxTouchPoints ? true : false,
  isIpad: /ipad/.test(window.navigator.userAgent.toLowerCase()) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1),
  stickyHeader: false,
  recentlyViewed: [],
  rtl: document.documentElement.getAttribute('dir') == 'rtl' ? true : false
};

theme.recentlyViewed = {
  recent: {}, // will store handle+url of recent products
  productInfo: {} // will store product data to reduce API calls
};

if (theme.config.isIpad) {
  document.documentElement.className += ' js-ipad';
}

window.lazySizesConfig = window.lazySizesConfig || {};
lazySizesConfig.expFactor = 4;

(function($){
  var $ = jQuery = $;

  theme.utils = {
    /**
     * _.defaultTo from lodash
     * Checks `value` to determine whether a default value should be returned in
     * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
     * or `undefined`.
     * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
     *
     * @param {*} value - Value to check
     * @param {*} defaultValue - Default value
     * @returns {*} - Returns the resolved value
     */
    defaultTo: function(value, defaultValue) {
      return (value == null || value !== value) ? defaultValue : value
    }
  };
  
  theme.a11y = {
  
    /**
     * Traps the focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    trapFocus: function(options) {
      var eventsName = {
        focusin: options.namespace ? 'focusin.' + options.namespace : 'focusin',
        focusout: options.namespace
          ? 'focusout.' + options.namespace
          : 'focusout',
        keydown: options.namespace
          ? 'keydown.' + options.namespace
          : 'keydown.handleFocus'
      };
  
      /**
       * Get every possible visible focusable element
       */
      var $focusableElements = options.$container.find(
        $(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex^="-"])'
        ).filter(':visible')
      );
      var firstFocusable = $focusableElements[0];
      var lastFocusable = $focusableElements[$focusableElements.length - 1];
  
      if (!options.$elementToFocus) {
        options.$elementToFocus = options.$container;
      }
  
      function _manageFocus(evt) {
        // Tab key
        if (evt.keyCode !== 9) return;
  
        /**
         * On the last focusable element and tab forward,
         * focus the first element.
         */
        if (evt.target === lastFocusable && !evt.shiftKey) {
          evt.preventDefault();
          firstFocusable.focus();
        }
        /**
         * On the first focusable element and tab backward,
         * focus the last element.
         */
        if (evt.target === firstFocusable && evt.shiftKey) {
          evt.preventDefault();
          lastFocusable.focus();
        }
      }
  
      options.$container.attr('tabindex', '-1');
      options.$elementToFocus.focus();
  
      $(document).off('focusin');
  
      $(document).on(eventsName.focusout, function() {
        $(document).off(eventsName.keydown);
      });
  
      $(document).on(eventsName.focusin, function(evt) {
        if (evt.target !== lastFocusable && evt.target !== firstFocusable) return;
  
        $(document).on(eventsName.keydown, function(evt) {
          _manageFocus(evt);
        });
      });
    },
  
    /**
     * Removes the trap of focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    removeTrapFocus: function(options) {
      var eventName = options.namespace
        ? 'focusin.' + options.namespace
        : 'focusin';
  
      if (options.$container && options.$container.length) {
        options.$container.removeAttr('tabindex');
      }
  
      $(document).off(eventName);
    },
  
    lockMobileScrolling: function(namespace, $element) {
      if ($element) {
        var $el = $element;
      } else {
        var $el = $(document.documentElement).add('body');
      }
      $el.on('touchmove' + namespace, function () {
        return false;
      });
    },
  
    unlockMobileScrolling: function(namespace, $element) {
      if ($element) {
        var $el = $element;
      } else {
        var $el = $(document.documentElement).add('body');
      }
      $el.off(namespace);
    }
  };
  
  theme.Sections = function Sections() {
    this.constructors = {};
    this.instances = [];
  
    $(document)
      .on('shopify:section:load', this._onSectionLoad.bind(this))
      .on('shopify:section:unload', this._onSectionUnload.bind(this))
      .on('shopify:section:select', this._onSelect.bind(this))
      .on('shopify:section:deselect', this._onDeselect.bind(this))
      .on('shopify:block:select', this._onBlockSelect.bind(this))
      .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
  };
  
  theme.Sections.prototype = $.extend({}, theme.Sections.prototype, {
    createInstance: function(container, constructor, customScope) {
      var $container = $(container);
      var id = $container.attr('data-section-id');
      var type = $container.attr('data-section-type');
  
      constructor = constructor || this.constructors[type];
  
      if (typeof constructor === 'undefined') {
        return;
      }
  
      // If custom scope passed, check to see if instance
      // is already initialized so we don't double up
      if (customScope) {
        var instanceExists = this._findInstance(id);
        if (instanceExists) {
          return;
        }
      }
  
      var instance = $.extend(new constructor(container), {
        id: id,
        type: type,
        container: container
      });
  
      this.instances.push(instance);
    },
  
    _onSectionLoad: function(evt, subSection, subSectionId) {
      if (AOS) {
        AOS.refreshHard();
      }
      var container = subSection ? subSection : $('[data-section-id]', evt.target)[0];
  
      if (!container) {
        return;
      }
  
      this.createInstance(container);
  
      var instance = subSection ? subSectionId : this._findInstance(evt.detail.sectionId);
  
      if (!subSection) {
        this._loadSubSections();
      }
  
      // Run JS only in case of the section being selected in the editor
      // before merchant clicks "Add"
      if (instance && typeof instance.onLoad === 'function') {
        instance.onLoad(evt);
      }
    },
  
    _loadSubSections: function() {
      if (AOS) {
        AOS.refreshHard();
      }
      $('[data-subsection]').each(function(evt, el) {
        this._onSectionLoad(null, el, $(el).data('section-id'));
      }.bind(this));
    },
  
    _onSectionUnload: function(evt) {
      var instance = this._removeInstance(evt.detail.sectionId);
      if (instance && typeof instance.onUnload === 'function') {
        instance.onUnload(evt);
      }
    },
  
    _onSelect: function(evt) {
      var instance = this._findInstance(evt.detail.sectionId);
  
      if (instance && typeof instance.onSelect === 'function') {
        instance.onSelect(evt);
      }
    },
  
    _onDeselect: function(evt) {
      var instance = this._findInstance(evt.detail.sectionId);
  
      if (instance && typeof instance.onDeselect === 'function') {
        instance.onDeselect(evt);
      }
    },
  
    _onBlockSelect: function(evt) {
      var instance = this._findInstance(evt.detail.sectionId);
  
      if (instance && typeof instance.onBlockSelect === 'function') {
        instance.onBlockSelect(evt);
      }
    },
  
    _onBlockDeselect: function(evt) {
      var instance = this._findInstance(evt.detail.sectionId);
  
      if (instance && typeof instance.onBlockDeselect === 'function') {
        instance.onBlockDeselect(evt);
      }
    },
  
    _findInstance: function(id) {
      for (var i = 0; i < this.instances.length; i++) {
        if (this.instances[i].id === id) {
          return this.instances[i];
        }
      }
    },
  
    _removeInstance: function(id) {
      var i = this.instances.length;
      var instance;
  
      while(i--) {
        if (this.instances[i].id === id) {
          instance = this.instances[i];
          this.instances.splice(i, 1);
          break;
        }
      }
  
      return instance;
    },
  
    register: function(type, constructor, $scope) {
      var afterLoad = false;
      this.constructors[type] = constructor;
      var $sections = $('[data-section-type=' + type + ']');
  
      if ($scope) {
        $sections = $('[data-section-type=' + type + ']', $scope);
      }
  
      $sections.each(function(index, container) {
        this.createInstance(container, constructor, $scope);
      }.bind(this));
    }
  });
  
  
  /**
   * Currency Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help with currency formatting
   *
   * Current contents
   * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
   *
   * Alternatives
   * - Accounting.js - http://openexchangerates.github.io/accounting.js/
   *
   */
  
  theme.Currency = (function() {
    var moneyFormat = '${{amount}}';
  
    function formatMoney(cents, format) {
      if (!format) {
        format = theme.settings.moneyFormat;
      }
      if (typeof cents === 'string') {
        cents = cents.replace('.', '');
      }
      var value = '';
      var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      var formatString = (format || moneyFormat);
  
      function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = theme.utils.defaultTo(precision, 2);
        thousands = theme.utils.defaultTo(thousands, ',');
        decimal = theme.utils.defaultTo(decimal, '.');
  
        if (isNaN(number) || number == null) {
          return 0;
        }
  
        number = (number / 100.0).toFixed(precision);
  
        var parts = number.split('.');
        var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
        var centsAmount = parts[1] ? (decimal + parts[1]) : '';
  
        return dollarsAmount + centsAmount;
      }
  
      switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
          value = formatWithDelimiters(cents, 2);
          break;
        case 'amount_no_decimals':
          value = formatWithDelimiters(cents, 0);
          break;
        case 'amount_with_comma_separator':
          value = formatWithDelimiters(cents, 2, '.', ',');
          break;
        case 'amount_no_decimals_with_comma_separator':
          value = formatWithDelimiters(cents, 0, '.', ',');
          break;
        case 'amount_no_decimals_with_space_separator':
          value = formatWithDelimiters(cents, 0, ' ');
          break;
      }
  
      return formatString.replace(placeholderRegex, value);
    }
  
    function getBaseUnit(variant) {
      if (!variant) {
        return;
      }
  
      if (!variant.unit_price_measurement || !variant.unit_price_measurement.reference_value) {
        return;
      }
  
      return variant.unit_price_measurement.reference_value === 1
        ? variant.unit_price_measurement.reference_unit
        : variant.unit_price_measurement.reference_value +
            variant.unit_price_measurement.reference_unit;
    }
  
    return {
      formatMoney: formatMoney,
      getBaseUnit: getBaseUnit
    }
  })();
  
  
  /**
   * Image Helper Functions
   * -----------------------------------------------------------------------------
   * A collection of functions that help with basic image operations.
   *
   */
  
  theme.Images = (function() {
  
    /**
     * Find the Shopify image attribute size
     *
     * @param {string} src
     * @returns {null}
     */
    function imageSize(src) {
      if (!src) {
        return '620x'; // default based on theme
      }
  
      var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);
  
      if (match !== null) {
        return match[1];
      } else {
        return null;
      }
    }
  
    /**
     * Adds a Shopify size attribute to a URL
     *
     * @param src
     * @param size
     * @returns {*}
     */
    function getSizedImageUrl(src, size) {
      if (!src) {
        return src;
      }
  
      if (size == null) {
        return src;
      }
  
      if (size === 'master') {
        return this.removeProtocol(src);
      }
  
      var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);
  
      if (match != null) {
        var prefix = src.split(match[0]);
        var suffix = match[0];
  
        return this.removeProtocol(prefix[0] + '_' + size + suffix);
      }
  
      return null;
    }
  
    function removeProtocol(path) {
      return path.replace(/http(s)?:/, '');
    }
  
    /**
     * Create lazyloading-friendly image string
     *
     * @param string
     * @returns string with _{width}x as size param
     */
    function lazyloadImagePath(string) {
      var image;
  
      if (string !== null) {
        image = string.replace(/(\.[^.]*)$/, "_{width}x$1");
      }
  
      return image;
    }
  
    return {
      imageSize: imageSize,
      getSizedImageUrl: getSizedImageUrl,
      removeProtocol: removeProtocol,
      lazyloadImagePath: lazyloadImagePath
    };
  })();
  
  theme.rte = {
    init: function() {
      theme.rte.wrapTable();
      theme.rte.wrapVideo();
      theme.rte.imageLinks();
    },
  
    wrapTable: function() {
      $('.rte table').wrap('<div class="table-wrapper"></div>');
    },
  
    wrapVideo: function() {
      var $iframeVideo = $('.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]');
      var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');
  
      $iframeVideo.each(function () {
        // Add wrapper to make video responsive
        if (!$(this).parents('.video-wrapper').length) {
          $(this).wrap('<div class="video-wrapper"></div>');
        }
      });
  
      $iframeReset.each(function () {
        // Re-set the src attribute on each iframe after page load
        // for Chrome's "incorrect iFrame content on 'back'" bug.
        // https://code.google.com/p/chromium/issues/detail?id=395791
        // Need to specifically target video and admin bar
        this.src = this.src;
      });
    },
  
    // Remove CSS that adds animated underline under image links
    imageLinks: function() {
      $('.rte a img').parent().addClass('rte__image');
    }
  };
  

  theme.LibraryLoader = (function() {
    var types = {
      link: 'link',
      script: 'script'
    };
  
    var status = {
      requested: 'requested',
      loaded: 'loaded'
    };
  
    var cloudCdn = 'https://cdn.shopify.com/shopifycloud/';
  
    var libraries = {
      youtubeSdk: {
        tagId: 'youtube-sdk',
        src: 'https://www.youtube.com/iframe_api',
        type: types.script
      },
      shopifyXr: {
        tagId: 'shopify-model-viewer-xr',
        src: cloudCdn + 'shopify-xr-js/assets/v1.0/shopify-xr.en.js',
        type: types.script
      },
      modelViewerUi: {
        tagId: 'shopify-model-viewer-ui',
        src: cloudCdn + 'model-viewer-ui/assets/v1.0/model-viewer-ui.en.js',
        type: types.script
      },
      modelViewerUiStyles: {
        tagId: 'shopify-model-viewer-ui-styles',
        src: cloudCdn + 'model-viewer-ui/assets/v1.0/model-viewer-ui.css',
        type: types.link
      }
    };
  
    function load(libraryName, callback) {
      var library = libraries[libraryName];
  
      if (!library) return;
      if (library.status === status.requested) return;
  
      callback = callback || function() {};
      if (library.status === status.loaded) {
        callback();
        return;
      }
  
      library.status = status.requested;
  
      var tag;
  
      switch (library.type) {
        case types.script:
          tag = createScriptTag(library, callback);
          break;
        case types.link:
          tag = createLinkTag(library, callback);
          break;
      }
  
      tag.id = library.tagId;
      library.element = tag;
  
      var firstScriptTag = document.getElementsByTagName(library.type)[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  
    function createScriptTag(library, callback) {
      var tag = document.createElement('script');
      tag.src = library.src;
      tag.addEventListener('load', function() {
        library.status = status.loaded;
        callback();
      });
      return tag;
    }
  
    function createLinkTag(library, callback) {
      var tag = document.createElement('link');
      tag.href = library.src;
      tag.rel = 'stylesheet';
      tag.type = 'text/css';
      tag.addEventListener('load', function() {
        library.status = status.loaded;
        callback();
      });
      return tag;
    }
  
    return {
      load: load
    };
  })();
  
  theme.Drawers = (function() {
    function Drawer(id, name, ignoreScrollLock) {
      this.config = {
        id: id,
        close: '.js-drawer-close',
        open: '.js-drawer-open-' + name,
        openClass: 'js-drawer-open',
        closingClass: 'js-drawer-closing',
        activeDrawer: 'drawer--is-open',
        namespace: '.drawer-' + name
      };
  
      this.$nodes = {
        parent: $(document.documentElement).add('body'),
        page: $('#MainContent')
      };
  
      this.$drawer = $('#' + id);
  
      if (!this.$drawer.length) {
        return false;
      }
  
      this.isOpen = false;
      this.ignoreScrollLock = ignoreScrollLock;
      this.init();
    };
  
    Drawer.prototype = $.extend({}, Drawer.prototype, {
      init: function() {
        var $openBtn = $(this.config.open);
  
        // Add aria controls
        $openBtn.attr('aria-expanded', 'false');
  
        $openBtn.on('click', this.open.bind(this));
        this.$drawer.find(this.config.close).on('click', this.close.bind(this));
  
        // Close modal if a drawer is opened
        $('body').on('productModalOpen', function() {
          this.close();
        }.bind(this));
      },
  
      open: function(evt, returnFocusEl) {
        if (evt) {
          evt.preventDefault();
        }
  
        if (this.isOpen) {
          return;
        }
  
        // Without this the drawer opens, the click event bubbles up to $nodes.page which closes the drawer.
        if (evt && evt.stopPropagation) {
          evt.stopPropagation();
          // save the source of the click, we'll focus to this on close
          this.$activeSource = $(evt.currentTarget).attr('aria-expanded', 'true');
        } else if (returnFocusEl) {
          var $el = $(returnFocusEl);
          this.$activeSource = $el.attr('aria-expanded', 'true');
        }
  
        this.$drawer.prepareTransition().addClass(this.config.activeDrawer);
  
        this.$nodes.parent.addClass(this.config.openClass);
        this.isOpen = true;
  
        theme.a11y.trapFocus({
          $container: this.$drawer,
          namespace: 'drawer_focus'
        });
  
        $('body')
          .trigger('drawerOpen')
          .trigger('drawerOpen.' + this.config.id);
  
        this.bindEvents();
      },
  
      close: function() {
        if (!this.isOpen) {
          return;
        }
  
        // deselect any focused form elements
        $(document.activeElement).trigger('blur');
  
        this.$drawer.prepareTransition().removeClass(this.config.activeDrawer);
  
        this.$nodes.parent.removeClass(this.config.openClass);
        this.$nodes.parent.addClass(this.config.closingClass);
        window.setTimeout(function() {
          this.$nodes.parent.removeClass(this.config.closingClass);
          if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
            this.$activeSource.attr('aria-expanded', 'false').focus();
          }
        }.bind(this), 500);
  
        this.isOpen = false;
  
        theme.a11y.removeTrapFocus({
          $container: this.$drawer,
          namespace: 'drawer_focus'
        });
  
        this.unbindEvents();
      },
  
      bindEvents: function() {
        if (!this.ignoreScrollLock) {
          theme.a11y.lockMobileScrolling(this.config.namespace, this.$nodes.page);
        }
  
        // Clicking out of drawer closes it.
        // Check to see if clicked on element in drawer
        // because of any drawer built witin #MainContent
        this.$nodes.page.on('click' + this.config.namespace, function (evt) {
          var $target = $(evt.target);
          var doNotClose = this.elementInsideDrawer($target);
          if (!doNotClose) {
            this.close();
            return false;
          }
  
        }.bind(this));
  
        // Pressing escape closes drawer
        this.$nodes.parent.on('keyup' + this.config.namespace, function(evt) {
          if (evt.keyCode === 27) {
            this.close();
          }
        }.bind(this));
      },
  
      unbindEvents: function() {
        if (!this.ignoreScrollLock) {
          theme.a11y.unlockMobileScrolling(this.config.namespace, this.$nodes.page);
        }
        this.$nodes.parent.off(this.config.namespace);
        this.$nodes.page.off(this.config.namespace);
      },
  
      // Check if clicked element is inside the drawer
      elementInsideDrawer: function($el) {
        return this.$drawer.find($el).length;
      }
    });
  
    return Drawer;
  })(); 
  
  theme.collapsibles = (function() {
  
    var selectors = {
      trigger: '.collapsible-trigger',
      module: '.collapsible-content',
      moduleInner: '.collapsible-content__inner'
    };
  
    var classes = {
      hide: 'hide',
      open: 'is-open',
      autoHeight: 'collapsible--auto-height'
    };
  
    var namespace = '.collapsible';
  
    var isTransitioning = false;
  
    function init() {
      $(selectors.trigger).each(function() {
        var $el = $(this);
        var state = $el.hasClass(classes.open);
        $el.attr('aria-expanded', state);
      });
  
      // Event listeners (hack for modals)
      $('body, .modal__inner')
        .off(namespace)
        .on('click' + namespace, selectors.trigger, function() {
  
        if (isTransitioning) {
          return;
        }
  
        isTransitioning = true;
  
        var $el = $(this);
        var isOpen = $el.hasClass(classes.open);
        var moduleId = $el.attr('aria-controls');
        var $module = $('#' + moduleId);
        var height = $module.find(selectors.moduleInner).outerHeight();
        var isAutoHeight = $el.hasClass(classes.autoHeight);
  
        // If isAutoHeight, set the height to 0 just after setting the actual height
        // so the closing animation works nicely
        if (isOpen && isAutoHeight) {
          setTimeout(function() {
            height = 0;
            setTransitionHeight($module, height, isOpen, isAutoHeight);
          }, 0);
        }
  
        if (isOpen && !isAutoHeight) {
          height = 0;
        }
  
        $el
          .attr('aria-expanded', !isOpen)
          .toggleClass(classes.open, !isOpen);
  
        setTransitionHeight($module, height, isOpen, isAutoHeight);
      });
    }
  
    function setTransitionHeight($module, height, isOpen, isAutoHeight) {
      $module
        .removeClass(classes.hide)
        .prepareTransition()
        .css('height', height)
        .toggleClass(classes.open, !isOpen);
  
      if (!isOpen && isAutoHeight) {
        var o = $module;
        window.setTimeout(function() {
          o.css('height','auto');
          isTransitioning = false;
        }, 350);
      } else {
        isTransitioning = false;
      }
    }
  
    return {
      init: init
    };
  })();
  
  theme.headerNav = (function() {
  
    var $parent = $(document.documentElement).add('body');
    var $page = $('#MainContent');
    var selectors = {
      wrapper: '.header-wrapper',
      siteHeader: '.site-header',
      searchBtn: '.js-search-header',
      closeSearch: '.js-search-header-close',
      searchContainer: '.site-header__search-container',
      logoContainer: '.site-header__logo',
      logo: '.site-header__logo img',
      navigation: '.site-navigation',
      megamenu: '.megamenu',
      navContainerWithLogo: '.header-item--logo',
      navItems: '.site-nav__item',
      navLinks: '.site-nav__link',
      navLinksWithDropdown: '.site-nav__link--has-dropdown',
      navDropdownLinks: '.site-nav__dropdown-link--second-level'
    };
  
    var classes = {
      hasDropdownClass: 'site-nav--has-dropdown',
      hasSubDropdownClass: 'site-nav__deep-dropdown-trigger',
      dropdownActive: 'is-focused',
      overlaidBodyClass: 'overlaid-header',
      stickyBodyClass: 'sticky-header'
    };
  
    var config = {
      namespace: '.siteNav',
      wrapperOverlayed: false,
      overlayedClass: 'is-light',
      stickyEnabledClass: 'header-wrapper--sticky',
      stickyEnabled: false,
      stickyActive: false,
      stickyInitialized: false,
      forceStopSticky: false,
      stickyClass: 'site-header--stuck',
      openTransitionClass: 'site-header--opening',
      lastScroll: 0
    };
  
    // Elements used in resize functions, defined in init
    var $window;
    var $navContainerWithLogo;
    var $logoContainer;
    var $nav;
    var $wrapper;
    var $siteHeader;
  
    function init() {
      $window = $(window);
      $navContainerWithLogo = $(selectors.navContainerWithLogo);
      $logoContainer = $(selectors.logoContainer);
      $nav = $(selectors.navigation);
      $wrapper = $(selectors.wrapper);
      $siteHeader = $(selectors.siteHeader);
  
      config.wrapperOverlayed = theme.settings.overlayHeader = $wrapper.hasClass(config.overlayedClass);
      config.stickyEnabled = $siteHeader.data('sticky');
  
      if (config.stickyEnabled) {
        stickyHeaderCheck();
        $window.on('resize' + config.namespace, $.debounce(150, stickyHeaderCheck));
      }
  
      if (config.wrapperOverlayed) {
        $('body').addClass(classes.overlaidBodyClass);
      }
  
      accessibleDropdowns();
      searchDrawer();
    }
  
    function unload() {
      $(window).off(config.namespace);
      $(selectors.searchBtn).off(config.namespace);
      $(selectors.closeSearch).off(config.namespace);
      $parent.off(config.namespace);
      $(selectors.navLinks).off(config.namespace);
      $(selectors.navDropdownLinks).off(config.namespace);
    }
  
    function searchDrawer() {
      $(selectors.searchBtn).on('click' + config.namespace, function(evt) {
        evt.preventDefault();
        openSearchDrawer();
      });
  
      $(selectors.closeSearch).on('click' + config.namespace, function() {
        closeSearchDrawer();
      });
    }
  
    function openSearchDrawer() {
      $(selectors.searchContainer).addClass('is-active');
      $parent.addClass('js-drawer-open--search');
  
      theme.a11y.trapFocus({
        $container: $(selectors.searchContainer),
        namespace: 'header_search',
        $elementToFocus: $(selectors.searchContainer).find('input')
      });
  
      // If sticky is enabled, scroll to top on mobile when close to it
      // so you don't get an invisible search box
      if (theme.config.bpSmall && config.stickyEnabled && config.lastScroll < 300) {
        window.scrollTo(0,0);
      }
  
      // Bind events
      theme.a11y.lockMobileScrolling(config.namespace);
  
      // Clicking out of container closes it
      $page.on('click' + config.namespace, function () {
        closeSearchDrawer();
        return false;
      });
  
      $parent.on('keyup' + config.namespace, function(evt) {
        if (evt.keyCode === 27) {
          closeSearchDrawer();
        }
      });
    }
  
    function closeSearchDrawer() {
      // deselect any focused form elements
      $(document.activeElement).trigger('blur');
  
      $parent.removeClass('js-drawer-open--search').off(config.namespace);
      $(selectors.searchContainer).removeClass('is-active');
  
      theme.a11y.removeTrapFocus({
        $container: $(selectors.searchContainer),
        namespace: 'header_search'
      });
  
      theme.a11y.unlockMobileScrolling(config.namespace);
      $page.off('click' + config.namespace);
      $parent.off('keyup' + config.namespace);
    }
  
    function accessibleDropdowns() {
      var hasActiveDropdown = false;
      var hasActiveSubDropdown = false;
      var closeOnClickActive = false;
  
      // Touch devices open dropdown on first click, navigate to link on second
      if (theme.config.isTouch) {
        $(selectors.navLinksWithDropdown).on('touchend' + config.namespace, function(evt) {
          var $el = $(this);
          var $parentItem = $el.parent();
          if (!$parentItem.hasClass(classes.dropdownActive)) {
            evt.preventDefault();
            closeDropdowns();
            openFirstLevelDropdown($el);
          } else {
            window.location.replace($el.attr('href'));
          }
        });
  
        $(selectors.navDropdownLinks).on('touchend' + config.namespace, function(evt) {
          var $el = $(this);
          var $parentItem = $el.parent();
  
          // Open third level menu or go to link based on active state
          if ($parentItem.hasClass(classes.hasSubDropdownClass)) {
            if (!$parentItem.hasClass(classes.dropdownActive)) {
              evt.preventDefault();
              closeThirdLevelDropdown();
              openSecondLevelDropdown($el);
            } else {
              window.location.replace($el.attr('href'));
            }
          } else {
            // No third level nav, go to link
            window.location.replace($el.attr('href'));
          }
        });
  
        // tapping outside of the dropdown closes it
        $('body').on('touchend' + config.namespace, function() {
          closeSecondLevelDropdown();
          closeThirdLevelDropdown();
        });
  
        // Exception to above: clicking anywhere on the megamenu content will NOT close it
        $(selectors.megamenu).on('touchend' + config.namespace, function(evt) {
          evt.stopImmediatePropagation();
        });
      }
  
      $(selectors.navLinks).on('focusin mouseover' + config.namespace, function() {
        if (hasActiveDropdown) {
          closeSecondLevelDropdown();
        }
  
        if (hasActiveSubDropdown) {
          closeThirdLevelDropdown();
        }
  
        openFirstLevelDropdown($(this));
      });
  
      // Force remove focus on sitenav links because focus sometimes gets stuck
      $(selectors.navLinks).on('mouseleave' + config.namespace, function() {
        closeSecondLevelDropdown();
        closeThirdLevelDropdown();
      });
  
      // Open/hide sub level dropdowns
      $(selectors.navDropdownLinks).on('focusin' + config.namespace, function() {
        if (hasActiveSubDropdown) {
          closeThirdLevelDropdown();
        }
  
        openSecondLevelDropdown($(this), true);
      });
  
      // Private dropdown methods
      function openFirstLevelDropdown($el) {
        var $parentItem = $el.parent();
        if ($parentItem.hasClass(classes.hasDropdownClass)) {
          $parentItem.addClass(classes.dropdownActive);
          hasActiveDropdown = true;
        }
  
        if (!theme.config.isTouch) {
          if (!closeOnClickActive) {
            var eventType = theme.config.isTouch ? 'touchend' : 'click';
            closeOnClickActive = true;
            $('body').on(eventType + config.namespace, function() {
              closeDropdowns();
              $('body').off(config.namespace);
              closeOnClickActive = false;
            });
          }
        }
      }
  
      function openSecondLevelDropdown($el, skipCheck) {
        var $parentItem = $el.parent();
        if ($parentItem.hasClass(classes.hasSubDropdownClass) || skipCheck) {
          $parentItem.addClass(classes.dropdownActive);
          hasActiveSubDropdown = true;
        }
      }
  
      function closeDropdowns() {
        closeSecondLevelDropdown();
        closeThirdLevelDropdown();
      }
  
      function closeSecondLevelDropdown() {
        $(selectors.navItems).removeClass(classes.dropdownActive);
      }
  
      function closeThirdLevelDropdown() {
        $(selectors.navDropdownLinks).parent().removeClass(classes.dropdownActive);
      }
    }
  
    function stickyHeaderCheck() {
      // Disable sticky header if any mega menu is taller than window
      theme.config.stickyHeader = doesMegaMenuFit();
  
      if (theme.config.stickyHeader) {
        config.forceStopSticky = false;
        stickyHeaderSetup();
      } else {
        config.forceStopSticky = true;
      }
    }
  
    function stickyHeaderSetup() {
      if (!config.stickyInitialized) {
        $parent.addClass(classes.stickyBodyClass);
        $siteHeader.wrap('<div class="site-header-sticky"></div>');
  
        stickyHeaderHeight();
        setTimeout(function() {
          stickyHeaderHeight();
        }, 200);
  
        $window.on('resize' + config.namespace, $.debounce(50, stickyHeaderHeight));
        $window.on('scroll' + config.namespace, $.throttle(15, stickyHeaderScroll));
      }
  
      config.stickyInitialized = true;
    }
  
    function doesMegaMenuFit() {
      var largestMegaNav = 0;
      $(selectors.megamenu).each(function() {
        var h = $(this).outerHeight();
        if (h > largestMegaNav) {
          largestMegaNav = h;
        }
      });
  
      // 120 ~ space of visible header when megamenu open
      if (window.innerHeight < (largestMegaNav + 120)) {
        return false;
      }
  
      return true;
    }
  
    function stickyHeaderHeight() {
      var height = $siteHeader.outerHeight(true);
      var $stickyHeader = $('.site-header-sticky').css('height', height);
  
      // Also update top position of sticky sidebar
      if ($('.grid__item--sidebar').length) {
        $('.grid__item--sidebar').css('top', height + 10);
      }
    }
  
    function stickyHeaderScroll() {
      if (config.forceStopSticky) {
        return;
      }
  
      var scroll = $window.scrollTop();
      var threshold = 55; //first scroll
      var threshold_fully_scrolled = 480; //fully scrolled header 
  
      //added
      // reset classes for mobile header behavior
      if($(window).width() < 768
        && $("body").hasClass("template-index")
      ) {
        config.stickyClass = '';
        config.overlayedClass = '';
        if(scroll > threshold) {
          $("body").addClass("first-scroll");
        }
        else {
          $("body").removeClass("first-scroll");
        }
        if(scroll > threshold_fully_scrolled) {
          $("body").addClass("full-scroll");
          $siteHeader.addClass("site-header--stuck");
          //$wrapper.removeClass("is-light");
        }
        else {
          $("body").removeClass("full-scroll");
          $siteHeader.removeClass("site-header--stuck"); 
          //$wrapper.addClass("is-light");
        }
      }
      //////////////////////////////////////////////////

      if (scroll > threshold) {
        if (config.stickyActive) {
          return;
        }
  
        config.stickyActive = true;

        $siteHeader.addClass(config.stickyClass);
        $('#modal__add-to-cart').addClass('has-sticky');
        if (config.wrapperOverlayed) {
          $wrapper.removeClass(config.overlayedClass);
        }
  
        // Add open transition class after element is set to fixed
        // so CSS animation is applied correctly
        setTimeout(function() {
          $siteHeader.addClass(config.openTransitionClass);
        }, 100);
      } else {
        if (!config.stickyActive) {
          return;
        }
  
        config.stickyActive = false;
        $('#modal__add-to-cart').removeClass('has-sticky');
        $siteHeader.removeClass(config.openTransitionClass).removeClass(config.stickyClass);
        if (config.wrapperOverlayed) {
          $wrapper.addClass(config.overlayedClass);
        }
      }
  
      config.lastScroll = scroll;
    }
  
    // If the header setting to overlay the menu on the collection image
    // is enabled but the collection setting is disabled, we need to undo
    // the init of the sticky nav
    function disableOverlayHeader() {
      $(selectors.wrapper)
        .removeClass(config.stickyEnabledClass)
        .removeClass(config.overlayedClass);
  
      $('body').removeClass(classes.overlaidBodyClass);
      config.wrapperOverlayed = false;
    }
  
    return {
      init: init,
      disableOverlayHeader: disableOverlayHeader,
      unload: unload
    };
  })();
  
  theme.Slideshow = (function() {
    this.$slideshow = null;
  
    var classes = {
      next: 'is-next',
      init: 'is-init',
      animateOut: 'animate-out',
      wrapper: 'slideshow-wrapper',
      slideshow: 'slideshow',
      allSlides: 'slick-slide',
      currentSlide: 'slick-current',
      pauseButton: 'slideshow__pause',
      isPaused: 'is-paused'
    };
  
    function slideshow(el, args) {
      this.$slideshow = $(el);
      this.$wrapper = this.$slideshow.closest('.' + classes.wrapper);
      this.$pause = this.$wrapper.find('.' + classes.pauseButton);
  
      this.settings = {
        accessibility: true,
        arrows: args.arrows ? true : false,
        dots: args.dots ? true : false,
        fade: args.fade ? true : false,
        speed: args.speed ? args.speed : 500,
        draggable: true,
        touchThreshold: 5,
        pauseOnHover: false,
        rtl: theme.config.rtl,
        autoplay: args.autoplay ? true : false,
        autoplaySpeed: this.$slideshow.data('speed')
      };
  
      this.$slideshow.off('beforeChange');
      this.$slideshow.off('afterSlideChange');
      this.$slideshow.on('init', this.init.bind(this));
      this.$slideshow.on('beforeChange', this.beforeSlideChange.bind(this));
      this.$slideshow.on('afterChange', this.afterSlideChange.bind(this));
  
      this.$slideshow.slick(this.settings);
  
      this.$pause.on('click', this._togglePause.bind(this));
    }
  
    slideshow.prototype = $.extend({}, slideshow.prototype, {
      init: function(event, obj) {
        this.$slideshowList = obj.$list;
        this.$slickDots = obj.$dots;
        this.$allSlides = obj.$slides;
        this.slideCount = obj.slideCount;
  
        this.$slideshow.addClass(classes.init);
        this._a11y();
        this._clonedLazyloading();
      },
      beforeSlideChange: function(event, slick, currentSlide, nextSlide) {
        var $slider = slick.$slider;
        var $currentSlide = $slider.find('.' + classes.currentSlide).addClass(classes.animateOut);
      },
      afterSlideChange: function(event, slick, currentSlide) {
        var $slider = slick.$slider;
        var $allSlides = $slider.find('.' + classes.allSlides).removeClass(classes.animateOut);
      },
      destroy: function() {
        this.$slideshow.slick('unslick');
      },
  
      // Playback
      _play: function() {
        this.$slideshow.slick('slickPause');
        $(classes.pauseButton).addClass('is-paused');
      },
      _pause: function() {
        this.$slideshow.slick('slickPlay');
        $(classes.pauseButton).removeClass('is-paused');
      },
      _togglePause: function() {
        var slideshowSelector = this._getSlideshowId(this.$pause);
        if (this.$pause.hasClass(classes.isPaused)) {
          this.$pause.removeClass(classes.isPaused);
          $(slideshowSelector).slick('slickPlay');
        } else {
          this.$pause.addClass(classes.isPaused);
          $(slideshowSelector).slick('slickPause');
        }
      },
  
      // Helpers
      _getSlideshowId: function($el) {
        return '#Slideshow-' + $el.data('id');
      },
      _activeSlide: function() {
        return this.$slideshow.find('.slick-active');
      },
      _currentSlide: function() {
        return this.$slideshow.find('.slick-current');
      },
      _nextSlide: function(index) {
        return this.$slideshow.find('.slideshow__slide[data-slick-index="' + index + '"]');
      },
  
      // a11y fixes
      _a11y: function() {
        var $list = this.$slideshowList;
        var autoplay = this.settings.autoplay;
  
        if (!$list) {
          return;
        }
  
        // Remove default Slick aria-live attr until slider is focused
        $list.removeAttr('aria-live');
  
        // When an element in the slider is focused
        // pause slideshow and set aria-live
        $(classes.wrapper).on('focusin', function(evt) {
          if (!$(classes.wrapper).has(evt.target).length) {
            return;
          }
  
          $list.attr('aria-live', 'polite');
          if (autoplay) {
            this._pause();
          }
        }.bind(this));
  
        // Resume autoplay
        $(classes.wrapper).on('focusout', function(evt) {
          if (!$(classes.wrapper).has(evt.target).length) {
            return;
          }
  
          $list.removeAttr('aria-live');
          if (autoplay) {
            this._play();
          }
        }.bind(this));
      },
  
      // Make sure lazyloading works on cloned slides
      _clonedLazyloading: function() {
        var $slideshow = this.$slideshow;
  
        $slideshow.find('.slick-slide').each(function(index, el) {
          var $slide = $(el);
          if ($slide.hasClass('slick-cloned')) {
            var slideId = $slide.data('id');
            var $slideImg = $slide.find('.hero__image').removeClass('lazyloading').addClass('lazyloaded');
  
            // Get inline style attribute from non-cloned slide with arbitrary timeout
            // so the image is loaded
            setTimeout(function() {
              var loadedImageStyle = $slideshow.find('.slideshow__slide--' + slideId + ':not(.slick-cloned) .hero__image').attr('style');
  
              if (loadedImageStyle) {
                $slideImg.attr('style', loadedImageStyle);
              }
  
            }, this.settings.autoplaySpeed / 1.5);
  
          }
        }.bind(this));
      }
    });
  
    return slideshow;
  })();
  
  theme.announcementBar = (function() {
    var slideCount = 0;
    var compact = false;
    var defaults = {
      accessibility: true,
      arrows: false,
      dots: false,
      autoplay: true,
      autoplaySpeed: 5000,
      touchThreshold: 20,
      rtl: theme.config.rtl,
      slidesToShow: 1
    };
    var $slider;
  
    function init() {
      $slider = $('#AnnouncementSlider');
      if (!$slider.length) {
        return;
      }
  
      slideCount = $slider.data('block-count');
      compact = $slider.data('compact-style');
  
      var desktopOptions = $.extend({}, defaults, {
        slidesToShow: compact ? 1 : slideCount,
        slidesToScroll: 1
      });
  
      var mobileOptions = $.extend({}, defaults, {
        slidesToShow: 1
      });
  
      if (theme.config.bpSmall) {
        initSlider($slider, mobileOptions);
      } else {
        initSlider($slider, desktopOptions);
      }
  
      $('body').on('matchSmall', function() {
        initSlider($slider, mobileOptions);
      }.bind(this));
  
      $('body').on('matchLarge', function() {
        initSlider($slider, desktopOptions);
      }.bind(this));
    }
  
    function initSlider($slider, args) {
      if (isInitialized($slider)) {
        $slider.slick('unslick');
      }
      $slider.slick(args);
    }
  
    function isInitialized($slider) {
      return $slider.length && $slider.hasClass('slick-initialized');
    }
  
    // Go to slide if selected in the editor
    function onBlockSelect(id) {
      var $slide = $('#AnnouncementSlide-' + id);
      if ($slider.length) {
        $slider.slick('slickPause');
      }
      if ($slide.length) {
        $slider.slick('slickGoTo', $slide.data('index'));
      }
    }
  
    function onBlockDeselect(id) {
      if ($slider.length && isInitialized($slider)) {
        $slider.slick('slickPlay');
      }
    }
  
    function unload() {
      if (isInitialized($slider)) {
        $slider.slick('unslick');
      }
    }
  
    return {
      init: init,
      onBlockSelect: onBlockSelect,
      onBlockDeselect: onBlockDeselect,
      unload: unload
    };
  })();
  
  // Select-like popovers for currency and language selection
  theme.Disclosure = (function() {
    var selectors = {
      disclosureList: '[data-disclosure-list]',
      disclosureToggle: '[data-disclosure-toggle]',
      disclosureInput: '[data-disclosure-input]',
      disclosureOptions: '[data-disclosure-option]'
    };
  
    var classes = {
      listVisible: 'disclosure-list--visible'
    };
  
    function Disclosure($disclosure) {
      this.$container = $disclosure;
      this.cache = {};
      this._cacheSelectors();
      this._connectOptions();
      this._connectToggle();
      this._onFocusOut();
    }
  
    Disclosure.prototype = $.extend({}, Disclosure.prototype, {
      _cacheSelectors: function() {
        this.cache = {
          $disclosureList: this.$container.find(selectors.disclosureList),
          $disclosureToggle: this.$container.find(selectors.disclosureToggle),
          $disclosureInput: this.$container.find(selectors.disclosureInput),
          $disclosureOptions: this.$container.find(selectors.disclosureOptions)
        };
      },
  
      _connectToggle: function() {
        this.cache.$disclosureToggle.on(
          'click',
          function(evt) {
            var ariaExpanded =
              $(evt.currentTarget).attr('aria-expanded') === 'true';
            $(evt.currentTarget).attr('aria-expanded', !ariaExpanded);
  
            this.cache.$disclosureList.toggleClass(classes.listVisible);
          }.bind(this)
        );
      },
  
      _connectOptions: function() {
        this.cache.$disclosureOptions.on(
          'click',
          function(evt) {
            evt.preventDefault();
            this._submitForm($(evt.currentTarget).data('value'));
          }.bind(this)
        );
      },
  
      _onFocusOut: function() {
        this.cache.$disclosureToggle.on(
          'focusout',
          function(evt) {
            var disclosureLostFocus =
              this.$container.has(evt.relatedTarget).length === 0;
  
            if (disclosureLostFocus) {
              this._hideList();
            }
          }.bind(this)
        );
  
        this.cache.$disclosureList.on(
          'focusout',
          function(evt) {
            var childInFocus =
              $(evt.currentTarget).has(evt.relatedTarget).length > 0;
            var isVisible = this.cache.$disclosureList.hasClass(
              classes.listVisible
            );
  
            if (isVisible && !childInFocus) {
              this._hideList();
            }
          }.bind(this)
        );
  
        this.$container.on(
          'keyup',
          function(evt) {
            if (evt.which !== 27) return;
            this._hideList();
            this.cache.$disclosureToggle.focus();
          }.bind(this)
        );
  
        $('body').on(
          'click',
          function(evt) {
            var isOption = this.$container.has(evt.target).length > 0;
            var isVisible = this.cache.$disclosureList.hasClass(
              classes.listVisible
            );
  
            if (isVisible && !isOption) {
              this._hideList();
            }
          }.bind(this)
        );
      },
  
      _submitForm: function(value) {
        $('body').addClass('unloading');
        this.cache.$disclosureInput.val(value);
        this.$container.parents('form').submit();
      },
  
      _hideList: function() {
        this.cache.$disclosureList.removeClass(classes.listVisible);
        this.cache.$disclosureToggle.attr('aria-expanded', false);
      },
  
      unload: function() {
        this.cache.$disclosureOptions.off();
        this.cache.$disclosureToggle.off();
        this.cache.$disclosureList.off();
        this.$container.off();
      }
    });
  
    return Disclosure;
  })();
   
  theme.HeaderSection = (function() {
  
    var selectors = {
      drawer: '#NavDrawer',
      mobileSubNavToggle: '.mobile-nav__toggle-btn',
      hasSublist: '.mobile-nav__has-sublist',
      disclosureLocale: '[data-disclosure-locale]',
      disclosureCurrency: '[data-disclosure-currency]'
    };
  
    var classes = {
      navExpanded: 'mobile-nav--expanded'
    };
  
    function Header(container) {
      var $container = this.$container = $(container);
      var sectionId = this.sectionId = $container.attr('data-section-id');
  
      // Reload any slideshow if when the header is reloaded to make sure the
      // sticky header works as expected
      theme.reinitSection('slideshow-section');
  
      this.initDrawers();
      theme.headerNav.init();
      theme.announcementBar.init();
  
      this.cache = {};
      this.cacheSelectors();
  
      if (this.cache.$localeDisclosure.length) {
        this.localeDisclosure = new theme.Disclosure(
          this.cache.$localeDisclosure
        );
      }
  
      if (this.cache.$currencyDisclosure.length) {
        this.currencyDisclosure = new theme.Disclosure(
          this.cache.$currencyDisclosure
        );
      }
  
      // Set a timer to resize the header in case the logo changes size
      if (Shopify.designMode) {
        setTimeout(function() {
          $('body').trigger('resize');
        }, 500);
      }
    }
  
    Header.prototype = $.extend({}, Header.prototype, {
      cacheSelectors: function() {
        this.cache = {
          $localeDisclosure: this.$container.find(selectors.disclosureLocale),
          $currencyDisclosure: this.$container.find(selectors.disclosureCurrency)
        };
      },
  
      initDrawers: function() {
        theme.NavDrawer = new theme.Drawers('NavDrawer', 'nav');
        if (theme.settings.cartType === 'drawer') {
          new theme.CartDrawer();
        }
  
        this.drawerMenuButtons();
      },
  
      drawerMenuButtons: function() {
        $(selectors.drawer).find('.js-drawer-close').on('click', function(evt){
          evt.preventDefault();
          theme.NavDrawer.close();
        });
  
        var $mobileSubNavToggle = $(selectors.mobileSubNavToggle);
  
        $mobileSubNavToggle.attr('aria-expanded', 'false');
        $mobileSubNavToggle.each(function (i, el) {
          var $el = $(el);
          $el.attr('aria-controls', $el.attr('data-aria-controls'));
        });
  
        $mobileSubNavToggle.on('click', function() {
          var $el = $(this);
          var currentlyExpanded = $el.attr('aria-expanded');
          var toggleState = false;
  
          // Updated aria-expanded value based on state pre-click
          if (currentlyExpanded === 'true') {
            $el.attr('aria-expanded', 'false');
          } else {
            $el.attr('aria-expanded', 'true');
            toggleState = true;
          }
  
          // Toggle class that expands/collapses sublist
          $el.closest(selectors.hasSublist).toggleClass(classes.navExpanded, toggleState);
        });
      },
  
      onBlockSelect: function(evt) {
        theme.announcementBar.onBlockSelect(evt.detail.blockId);
      },
  
      onDeselect: function() {
        theme.announcementBar.onBlockDeselect();
      },
  
      onUnload: function() {
        theme.NavDrawer.close();
        theme.headerNav.unload();
        theme.announcementBar.unload();
  
        if (this.cache.$localeDisclosure.length) {
          this.localeDisclosure.unload();
        }
  
        if (this.cache.$currencyDisclosure.length) {
          this.currencyDisclosure.unload();
        }
      }
    });
  
    return Header;
  
  })();
  
  theme.FooterSection = (function() {
  
    var selectors = {
      disclosureLocale: '[data-disclosure-locale]',
      disclosureCurrency: '[data-disclosure-currency]'
    };
  
    function Footer(container) {
      var $container = this.$container = $(container);
  
      this.cache = {};
      this.cacheSelectors();
  
      if (this.cache.$localeDisclosure.length) {
        this.localeDisclosure = new theme.Disclosure(
          this.cache.$localeDisclosure
        );
      }
  
      if (this.cache.$currencyDisclosure.length) {
        this.currencyDisclosure = new theme.Disclosure(
          this.cache.$currencyDisclosure
        );
      }
    }
  
    Footer.prototype = $.extend({}, Footer.prototype, {
      cacheSelectors: function() {
        this.cache = {
          $localeDisclosure: this.$container.find(selectors.disclosureLocale),
          $currencyDisclosure: this.$container.find(selectors.disclosureCurrency)
        };
      },
  
      onUnload: function() {
        if (this.cache.$localeDisclosure.length) {
          this.localeDisclosure.unload();
        }
  
        if (this.cache.$currencyDisclosure.length) {
          this.currencyDisclosure.unload();
        }
      }
    });
  
    return Footer;
  })();
  
  theme.FeaturedContentSection = (function() {
  
    function FeaturedContent() {
      $('.rte').find('a:not(:has(img))').addClass('text-link');
    }
  
    return FeaturedContent;
  })();
  
  theme.slideshows = {};
  
  theme.SlideshowSection = (function() {
  
    var selectors = {
      parallaxContainer: '.parallax-container'
    };
  
    function SlideshowSection(container) {
      var $container = this.$container = $(container);
      var $section = $container.parent();
      var sectionId = $container.attr('data-section-id');
      var slideshow = this.slideshow = '#Slideshow-' + sectionId;
      this.namespace = '.' + sectionId;
  
      var $imageContainer = $(container).find('.hero');
      if ($imageContainer.length) {
        theme.loadImageSection($imageContainer);
      }
  
      this.init();
  
      if ($container.data('parallax')) {
        var args = {
          namespace: this.namespace
        };
        theme.parallaxSections[this.namespace] = new theme.Parallax($container.find(selectors.parallaxContainer), args);
      }
    }
  
    SlideshowSection.prototype = $.extend({}, SlideshowSection.prototype, {
      init: function() {
        // Prevent slideshows from initializing on top of themselves
        this.onUnload();
  
        var $slideshow = $(this.slideshow);
        var args = {
          autoplay: $slideshow.data('autoplay'),
          arrows: $slideshow.data('arrows'),
          dots: $slideshow.data('dots'),
          fade: true,
          speed: 500 // same as $slideshowImageAnimationSpeed in CSS
        };
  
        theme.slideshows[this.slideshow] = new theme.Slideshow(this.slideshow, args);
      },
  
      forceReload: function() {
        this.init();
      },
  
      onUnload: function() {
        if (theme.parallaxSections[this.namespace]) {
          theme.parallaxSections[this.namespace].destroy();
          delete theme.parallaxSections[this.namespace];
        }
        if (theme.slideshows[this.slideshow]) {
          theme.slideshows[this.slideshow].destroy();
          delete theme.slideshows[this.slideshow];
        }
      },
  
      onSelect: function() {
        $(this.slideshow).slick('slickPause');
      },
  
      onDeselect: function() {
        $(this.slideshow).slick('slickPlay');
      },
  
      onBlockSelect: function(evt) {
        var $slideshow = $(this.slideshow);
  
        // Ignore the cloned version
        var $slide = $('.slideshow__slide--' + evt.detail.blockId + ':not(.slick-cloned)');
        var slideIndex = $slide.data('slick-index');
  
        // Go to selected slide, pause autoplay
        $slideshow.slick('slickGoTo', slideIndex).slick('slickPause');
      },
  
      onBlockDeselect: function() {
        $(this.slideshow).slick('slickPlay');
      }
    });
  
    return SlideshowSection;
  })();
   
  theme.BackgroundImage = (function() {
  
    var selectors = {
      parallaxContainer: '.parallax-container'
    };
  
    function backgroundImage(container) {
      var $container = $(container);
      var sectionId = $container.attr('data-section-id');
      this.namespace = '.' + sectionId;
  
      if (!$container.length) {
        return;
      }
  
      if ($container.data('parallax')) {
        var $parallaxContainer = $container.find(selectors.parallaxContainer);
        var args = {
          namespace: this.namespace,
          desktopOnly: true
        };
  
        theme.parallaxSections[this.namespace] = new theme.Parallax($parallaxContainer, args);
      }
    }
  
    backgroundImage.prototype = $.extend({}, backgroundImage.prototype, {
      onUnload: function(evt) {
        theme.parallaxSections[this.namespace].destroy();
        delete theme.parallaxSections[this.namespace];
      }
    });
  
    return backgroundImage;
  })();

  theme.parallaxSections = {};
  
  theme.Parallax = (function() {
    var speed = 7; // higher is slower
  
    function parallax(el, args) {
      this.$container = $(el);
      this.namespace = args.namespace;
  
      if (!this.$container.length) {
        return;
      }
  
      if (args.desktopOnly) {
        this.desktopInit();
      } else {
        this.init(this.$container, args)
      }
    }
  
    parallax.prototype = $.extend({}, parallax.prototype, {
      init: function(desktopOnly) {
        var $window = this.$window = $(window);
        var elTop = this.$container.offset().top;
  
        $window.on('scroll' + this.namespace, function(evt) {
          var scrolled = $window.scrollTop();
          var shiftDistance = (elTop - scrolled) / speed;
          this.$container.css({
            'transform': 'translate3d(0, ' + shiftDistance + 'px, 0)'
          });
        }.bind(this));
  
        // Reinit on resize
        $window.on('resize' + this.namespace, $.debounce(350, function() {
          $window.off(this.namespace);
  
          if (desktopOnly) {
            if (!theme.config.bpSmall) {
              this.init(true);
              return;
            }
          }
  
          this.init();
        }.bind(this)));
      },
  
      desktopInit: function() {
        if (!theme.config.bpSmall) {
          this.init(true);
        }
  
        $('body').on('matchSmall', function() {
          this.destroy();
        }.bind(this));
  
        $('body').on('matchLarge', function() {
          this.init(true);
        }.bind(this));
      },
  
      destroy: function() {
        this.$container.removeAttr('style');
        this.$window.off(this.namespace);
      }
    });
  
    return parallax;
  })();
  
  theme.Testimonials = (function() {
    var slideCount = 0;
    var defaults = {
      accessibility: true,
      arrows: false,
      dots: true,
      autoplay: false,
      touchThreshold: 20,
      rtl: theme.config.rtl,
      slidesToShow: 3,
      slidesToScroll: 3
    };
  
    function Testimonials(container) {
      var $container = this.$container = $(container);
      var sectionId = $container.attr('data-section-id');
      var wrapper = this.wrapper = '.testimonials-wrapper';
      var slider = this.slider = '#Testimonials-' + sectionId;
      var $slider = $(slider);
  
      this.sliderActive = false;
      var mobileOptions = $.extend({}, defaults, {
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true
      });
  
      slideCount = $slider.data('count');
  
      // Override slidesToShow/Scroll if there are not enough blocks
      if (slideCount < defaults.slidesToShow) {
        defaults.slidesToShow = slideCount;
        defaults.slidesToScroll = slideCount;
      }
  
      $slider.on('init', this.a11y.bind(this));
  
      if (theme.config.bpSmall) {
        this.init($slider, mobileOptions);
      } else {
        this.init($slider, defaults);
      }
  
      $('body').on('matchSmall', function() {
        this.init($slider, mobileOptions);
      }.bind(this));
  
      $('body').on('matchLarge', function() {
        this.init($slider, defaults);
      }.bind(this));
    }
  
    Testimonials.prototype = $.extend({}, Testimonials.prototype, {
      onUnload: function() {
        $(this.slider, this.wrapper).slick('unslick');
      },
  
      onBlockSelect: function(evt) {
        // Ignore the cloned version
        var $slide = $('.testimonials-slide--' + evt.detail.blockId + ':not(.slick-cloned)');
        var slideIndex = $slide.data('slick-index');
  
        // Go to selected slide, pause autoplay
        $(this.slider, this.wrapper).slick('slickGoTo', slideIndex);
      },
  
      init: function(obj, args) {
        if (this.sliderActive) {
          obj.slick('unslick');
          this.sliderActive = false;
        }
  
        obj.slick(args);
        this.sliderActive = true;
  
        if (AOS) {
          AOS.refresh();
        }
      },
  
      a11y: function(event, obj) {
        var $list = obj.$list;
        var $wrapper = $(this.wrapper, this.$container);
  
        // Remove default Slick aria-live attr until slider is focused
        $list.removeAttr('aria-live');
  
        // When an element in the slider is focused set aria-live
        $wrapper.on('focusin', function(evt) {
          if ($wrapper.has(evt.target).length) {
            $list.attr('aria-live', 'polite');
          }
        });
  
        // Remove aria-live
        $wrapper.on('focusout', function(evt) {
          if ($wrapper.has(evt.target).length) {
            $list.removeAttr('aria-live');
          }
        });
      }
    });
  
    return Testimonials;
  })();
  
  theme.NewsletterPopup = (function() {
    function NewsletterPopup(container) {
      var $container = this.$container = $(container);
      var sectionId = $container.attr('data-section-id');
      this.cookieName = 'newsletter-' + sectionId;
  
      if (!$container.length) {
        return;
      }
  
      // Prevent popup on Shopify robot challenge page
      if (window.location.pathname === '/challenge') {
        return;
      }
  
      this.data = {
        secondsBeforeShow: $container.data('delay-seconds'),
        daysBeforeReappear: $container.data('delay-days'),
        cookie: Cookies.get(this.cookieName),
        testMode: $container.data('test-mode')
      };
  
      this.modal = new theme.Modals('NewsletterPopup-' + sectionId, 'newsletter-popup-modal');
  
      // Open modal if errors or success message exist
      if ($container.find('.errors').length || $container.find('.note--success').length) {
        this.modal.open();
      }
  
      // Set cookie as opened if success message
      if ($container.find('.note--success').length) {
        this.closePopup(true);
        return;
      }
  
      $('body').on('modalClose.' + $container.attr('id'), this.closePopup.bind(this));
  
      if (!this.data.cookie || this.data.testMode) {
        this.initPopupDelay();
      }
    }
  
    NewsletterPopup.prototype = $.extend({}, NewsletterPopup.prototype, {
      initPopupDelay: function() {
        setTimeout(function() {
          this.modal.open();
        }.bind(this), this.data.secondsBeforeShow * 1000);
      },
  
      closePopup: function(success) {
        // Remove a cookie in case it was set in test mode
        if (this.data.testMode) {
          Cookies.remove(this.cookieName, { path: '/' });
          return;
        }
  
        var expiry = success ? 200 : this.data.daysBeforeReappear;
  
        Cookies.set(this.cookieName, 'opened', { path: '/', expires: expiry });
      },
  
      onLoad: function() {
        this.modal.open();
      },
  
      onSelect: function() {
        this.modal.open();
      },
  
      onDeselect: function() {
        this.modal.close();
      },
  
      onUnload: function() {}
    });
  
    return NewsletterPopup;
  })();
  
  window.onYouTubeIframeAPIReady = function() {
    theme.config.youTubeReady = true;
    $('body').trigger('youTubeReady');
  }

  window.loadVimeo = function() {
    if (theme.config.vimeoLoading) {
      return;
    }

    if (!theme.config.vimeoReady) {
      theme.config.vimeoLoading = true;
      var tag = document.createElement('script');
      tag.src = "https://player.vimeo.com/api/player.js";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Because there's no way to check for the Vimeo API being loaded
      // asynchronously, we use this terrible timeout to wait for it being ready
      checkIfVimeoIsReady()
        .then(function() {
          theme.config.vimeoReady = true;
          theme.config.vimeoLoading = false;
          $('body').trigger('vimeoReady');
        })
        .fail(function() {
          // No vimeo API to talk to
        });
    }
  }

  function checkIfVimeoIsReady() {
    var deferred = $.Deferred();
    var wait;
    var timeout;

    wait = setInterval(function() {
      if (!Vimeo) {
        return;
      }

      clearInterval(wait);
      clearTimeout(timeout);
      deferred.resolve();
    }, 500);

    timeout = setTimeout(function() {
      clearInterval(wait);
      deferred.reject();
    }, 4000); // subjective. test up to 8 times over 4 seconds

    return deferred;
  }

  theme.init = function() {
    theme.setGlobals();
    theme.collapsibles.init();
    theme.rte.init();

    AOS.init({
      easing: 'ease-out-quad',
      once: true,
      offset: 60,
      disableMutationObserver: true
    });

    $(document.documentElement).on('keyup.tab', function(evt) {
      if (evt.keyCode === 9) {
        $(document.documentElement).addClass('tab-outline');
        $(document.documentElement).off('keyup.tab');
      }
    });

    // Change email icon to submit text
    $('.footer__newsletter-input').on('keyup', function() {
      $(this).addClass('footer__newsletter-input--active');
    });
  };

  theme.initSecondary = function() {
    document.dispatchEvent(new CustomEvent('page:loaded'));
  };

  theme.setGlobals = function() {
    theme.config.hasSessionStorage = theme.isStorageSupported('session');
    theme.config.hasLocalStorage = theme.isStorageSupported('local');

    if (theme.config.hasLocalStorage) {
      theme.recentlyViewed.localStorage = window.localStorage.getItem('theme-recent');

      if (theme.recentlyViewed.localStorage) {
        theme.recentlyViewed.recent = JSON.parse(theme.recentlyViewed.localStorage);
      }
    }

    theme.recentlyViewed.productInfo = theme.config.hasSessionStorage && sessionStorage['recent-products'] ? JSON.parse(sessionStorage['recent-products']) : {};

    if (theme.config.isTouch) {
      $('body').addClass('supports-touch');
    }

    enquire.register(theme.config.mediaQuerySmall, {
      match: function() {
        theme.config.bpSmall = true;
        $('body').trigger('matchSmall');
      },
      unmatch: function() {
        theme.config.bpSmall = false;
        $('body').trigger('unmatchSmall');
      }
    });

    enquire.register(theme.config.mediaQuerySmallUp, {
      match: function() {
        $('body').trigger('matchLarge');
      },
      unmatch: function() {
        $('body').trigger('unmatchLarge');
      }
    });
  };

  theme.loadImageSection = function($container) {
    // Wait until images inside container have lazyloaded class
    function setAsLoaded() {
      $container.removeClass('loading loading--delayed').addClass('loaded');
    }

    function checkForLazyloadedImage() {
      return $container.find('.lazyloaded').length;
    }

    // If it has SVGs it's in the onboarding state so set as loaded
    if ($container.find('svg').length) {
      setAsLoaded();
      return;
    };

    if (checkForLazyloadedImage() > 0) {
      setAsLoaded();
      return;
    }

    var interval = setInterval(function() {
      if (checkForLazyloadedImage() > 0) {
        clearInterval(interval);
        setAsLoaded();
      }
    }, 80);
  };

  theme.isStorageSupported = function(type) {
    // Return false if we are in an iframe without access to sessionStorage
    if (window.self !== window.top) {
      return false;
    }

    var testKey = 'test';
    var storage;
    if (type === 'session') {
      storage = window.sessionStorage;
    }
    if (type === 'local') {
      storage = window.localStorage;
    }

    try {
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  };

  theme.isElementVisible = function($el, threshold) {
    var rect = $el[0].getBoundingClientRect();
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;
    threshold = threshold ? threshold : 0;

    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (windowHeight + threshold) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  theme.reinitSection = function(section) {
    for (var i = 0; i < sections.instances.length; i++) {
      var instance = sections.instances[i];
      if (instance['type'] === section) {
        if (typeof instance.forceReload === 'function') {
          instance.forceReload();
        }
      }
    }
  };

  theme.reinitProductGridItem = function($scope) {
    if (AOS) {
      AOS.refreshHard();
    }

    // Reload quick shop buttons
    theme.initQuickShop();

    // Refresh reviews app
    if (window.SPR) {
      SPR.initDomEls();SPR.loadBadges();
    }

    // Re-register product templates in quick view modals.
    // Will not double-register.
    sections.register('product-template', theme.Product, $scope);

    // Re-hook up collapsible box triggers
    theme.collapsibles.init();
  };

  window.onpageshow = function(evt) {
    // Removes unload class when returning to page via history
    if (evt.persisted) {
      $('body').removeClass('unloading');
    }
  };

  $(document).ready(function() {
    theme.init();

    window.sections = new theme.Sections();
    sections.register('header-section', theme.HeaderSection);
    sections.register('slideshow-section', theme.SlideshowSection);
    sections.register('video-section', theme.VideoSection);
    sections.register('background-image', theme.BackgroundImage);
    sections.register('featured-content-section', theme.FeaturedContentSection);
    sections.register('testimonials', theme.Testimonials);
    sections.register('newsletter-popup', theme.NewsletterPopup);
    sections.register('footer-section', theme.FooterSection);

    theme.initSecondary();
    window.SwymCallbacks = window.SwymCallbacks || [];
    window.SwymCallbacks.push(function (swat) {
    window._swat.fetchWrtEventTypeET(
      function (r) {
          // Get wishlist items
          if (r.length == 0) {
              $('.swym-wishlist.site-nav__link').addClass('ion-ios-heart-empty').removeClass('ion-ios-heart');
              return false;
          }
          $('.swym-wishlist.site-nav__link').removeClass('ion-ios-heart-empty').addClass('ion-ios-heart');
        });
    });
  });
})(theme.jQuery);
