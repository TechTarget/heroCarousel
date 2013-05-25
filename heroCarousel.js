/*!
heroCarousel v1.0.2 (http://okize.github.com/)
Copyright (c) 2013 | Licensed under the MIT license
http://www.opensource.org/licenses/mit-license.php
*/


(function() {
  (function(factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['jquery'], factory);
    } else {
      return factory(jQuery);
    }
  })(function($) {
    'use strict';
    var Plugin, defaults, pluginName;

    pluginName = 'heroCarousel';
    defaults = {
      autoplay: false,
      autoplaySpeed: 5000,
      autoplayPauseOnHover: true,
      itemsToShow: 3,
      heroImageLink: true,
      showHeroText: true,
      counter: false,
      pagination: true,
      navigation: true,
      navigationPosition: 'Outside'
    };
    Plugin = (function() {
      function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.el = $(this.element);
        this.container = this.el.children('.heroCarouselWindow').children('ul');
        this.heroImage = this.container.find('.heroCarouselImage');
        this.heroText = this.container.find('.heroCarouselContent');
        this.items = this.container.find('> li');
        this.itemCount = this.items.size();
        this.itemWidth = this.items.outerWidth();
        this.itemsToShow = this.options.itemsToShow;
        this.containerWidth = this.itemWidth * this.itemCount;
        this.windowWidth = this.itemWidth * this.itemsToShow;
        this.itemGroupTotal = Math.ceil(this.itemCount / this.itemsToShow);
        this.itemGroupShowing = 0;
        this.showControls = this.options.navigation || this.options.pagination;
        this.timer = null;
        this.init();
      }

      Plugin.prototype.init = function() {
        var _this = this;

        if (!this.showControls) {
          return;
        }
        if (this.itemCount <= this.itemsToShow) {
          return;
        }
        this.container.width(this.containerWidth);
        if (this.showControls) {
          if (this.options.navigation) {
            this.navigationInit();
          }
          if (this.options.navigation) {
            this.paginationInit();
          }
          this.renderControls();
          this.bindEvents();
        }
        if (!this.options.showHeroText) {
          this.heroText.hide();
        }
        if (!this.options.heroImageLink) {
          this.removeLink();
        }
        if (this.options.autoplay) {
          this.autoplayStart();
          if (this.options.autoplayPauseOnHover) {
            return this.el.on({
              mouseenter: function() {
                return _this.autoplayStop();
              },
              mouseleave: function() {
                return _this.autoplayStart();
              }
            });
          }
        }
      };

      Plugin.prototype.autoplayStart = function() {
        this.timer = setInterval($.proxy(this.autoplayMove, this), this.options.autoplaySpeed);
      };

      Plugin.prototype.autoplayMove = function() {
        if (this.itemGroupShowing < (this.itemGroupTotal - 1)) {
          this.itemGroupShowing++;
        } else {
          this.itemGroupShowing = 0;
        }
        this.updateControlsState();
        return this.moveItems();
      };

      Plugin.prototype.autoplayStop = function() {
        return clearTimeout(this.timer);
      };

      Plugin.prototype.bindEvents = function() {
        var _this = this;

        return this.el.on('click', 'a', function(e) {
          var control, currentGroup;

          e.preventDefault();
          control = $(e.target);
          currentGroup = _this.itemGroupShowing;
          if (!control.hasClass('disabled')) {
            if (control.hasClass('heroCarouselNext')) {
              if (_this.itemGroupShowing < (_this.itemGroupTotal - 1)) {
                _this.itemGroupShowing++;
              }
            }
          }
          if (!control.hasClass('disabled')) {
            if (control.hasClass('heroCarouselPrevious')) {
              if (_this.itemGroupShowing > 0) {
                _this.itemGroupShowing--;
              }
            }
          }
          if (control.hasClass('heroCarouselPaginationButton')) {
            _this.itemGroupShowing = control.data('heroCarouselGroup');
          }
          if (_this.itemGroupShowing !== currentGroup) {
            _this.updateControlsState();
            return _this.moveItems();
          }
        });
      };

      Plugin.prototype.moveItems = function() {
        return this.container.css('left', -(this.windowWidth * this.itemGroupShowing));
      };

      Plugin.prototype.navigationInit = function() {
        return this.el.addClass('heroCarouselNavigationShow').addClass('heroCarouselNavigation' + this.options.navigationPosition);
      };

      Plugin.prototype.paginationInit = function() {
        return this.el.addClass('heroCarouselPaginationShow');
      };

      Plugin.prototype.buildNavigationHtml = function() {
        if (!this.options.navigation) {
          return '';
        }
        this.btnPrev = $('<a>', {
          "class": 'heroCarouselPrevious disabled',
          href: '#',
          title: 'Previous',
          text: 'Previous'
        });
        this.btnNext = $('<a>', {
          "class": 'heroCarouselNext',
          href: '#',
          title: 'Next',
          text: 'Next'
        });
        return this;
      };

      Plugin.prototype.buildCounterHtml = function() {
        var counter;

        if (!this.options.counter) {
          return '';
        }
        counter = $('<div>', {
          "class": 'heroCarouselNavigationCounter',
          html: '<span class="heroCarouselNavigationCounterCurrent">' + (this.itemGroupShowing + 1) + '</span> - <span class="heroCarouselNavigationCounterTotal">' + this.itemGroupTotal + '</span>'
        });
        return counter;
      };

      Plugin.prototype.buildPaginationHtml = function() {
        var className, i, pagination, paginationItems;

        if (!this.options.pagination) {
          return '';
        }
        paginationItems = [];
        className = ['active'];
        i = 0;
        while (i < this.itemGroupTotal) {
          paginationItems.push('<a href="#" class="heroCarouselPaginationButton ' + (className[i] || '') + '" data-hero-carousel-group="' + i + '">' + (i + 1) + '</a>');
          i++;
        }
        pagination = $('<span/>', {
          "class": 'heroCarouselPagination',
          html: paginationItems
        });
        return pagination;
      };

      Plugin.prototype.renderControls = function() {
        var controls, html;

        controls = {
          outer: $('<div/>', {
            "class": 'heroCarouselControls'
          }),
          counter: this.buildCounterHtml(),
          navigation: this.buildNavigationHtml(),
          pagination: this.buildPaginationHtml()
        };
        html = controls.outer.append(controls.navigation.btnPrev).append(controls.counter).append(controls.pagination).append(controls.navigation.btnNext);
        return this.el.append(html);
      };

      Plugin.prototype.updateControlsState = function() {
        var nav;

        if (this.options.navigation) {
          nav = this.el.find('.heroCarouselPrevious, .heroCarouselNext').removeClass('disabled');
          if (this.itemGroupShowing === 0) {
            nav.eq(0).addClass('disabled');
          } else if (this.itemGroupShowing === (this.itemGroupTotal - 1)) {
            nav.eq(1).addClass('disabled');
          }
        }
        if (this.options.pagination) {
          this.el.find('.heroCarouselPaginationButton').removeClass('active').eq(this.itemGroupShowing).addClass('active');
        }
        if (this.options.counter) {
          return this.el.find('.heroCarouselNavigationCounterCurrent').text(this.itemGroupShowing + 1);
        }
      };

      Plugin.prototype.removeLink = function() {
        return this.heroImage.find('img').unwrap('a');
      };

      return Plugin;

    })();
    $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, 'plugin_#{pluginName}')) {
          $.data(this, 'plugin_#{pluginName}', new Plugin(this, options));
        }
      });
    };
  });

}).call(this);
