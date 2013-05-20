###!
heroCarousel v1.0.1 (http://okize.github.com/)
Copyright (c) 2013 | Licensed under the MIT license
http://www.opensource.org/licenses/mit-license.php
###

((factory) ->

  # use AMD or browser globals to create a jQuery plugin.
  if typeof define is 'function' and define.amd
    define [ 'jquery' ], factory
  else
    factory jQuery

) ($) ->

  'use strict'

  pluginName = 'heroCarousel'

  # default plugin options
  defaults =
    autoplayPauseOnHover: true
    autoplay: false
    autoplaySpeed: 5000
    itemsToShow: 3
    heroImageLink: true
    navigation: true
    navigationPosition: 'Outside' # Inline or Outside
    counter: false
    pagination: true

  # plugin constructor
  class Plugin

    constructor: (@element, options) ->
      @options = $.extend({}, defaults, options)
      @_defaults = defaults
      @_name = pluginName
      @el = $(@element)
      @container = @el.children('.heroCarouselWindow').children('ul')
      @heroImage = @container.find('.heroCarouselImage')
      @items = @container.find('> li')
      @itemCount = @items.size()
      @itemWidth = @items.outerWidth()
      @itemsToShow = @options.itemsToShow
      @containerWidth = (@itemWidth * @itemCount)
      @windowWidth = @itemWidth * @itemsToShow
      @itemGroupTotal = Math.ceil(@itemCount / @itemsToShow)
      @itemGroupShowing = 0
      @showControls = @options.navigation or @options.pagination
      @init()

    # initialize plugin
    init: ->

      # nothing to do if pagination & navigation are disabled
      return if not @showControls

      # nothing to do if number of items is equal or less than amount to show
      return if @itemCount <= @itemsToShow

      # adjust width of list container to contain all the items
      @container.width @containerWidth

      # if navigation or pagination is enabled
      if @showControls
        @navigationInit() if @options.navigation
        @paginationInit() if @options.navigation
        @renderControls()
        @bindEvents()

      # heroImageLink enabled
      @removeLink() if !@options.heroImageLink

    # play: ->

    # pause: ->

    # event hooks for the controls
    bindEvents: ->

      @el.on 'click', 'a', (e) =>

        e.preventDefault()

        control = $(e.target)
        currentGroup = @itemGroupShowing

        # advance strip
        if not control.hasClass('disabled')
          if control.hasClass('heroCarouselNext')
            if @itemGroupShowing < (@itemGroupTotal - 1)
              @itemGroupShowing++

        # recede strip
        if not control.hasClass('disabled')
          if control.hasClass('heroCarouselPrevious')
            if @itemGroupShowing > 0
              @itemGroupShowing--

        # jump to group
        if control.hasClass('heroCarouselPaginationButton')
          @itemGroupShowing = control.data('heroCarouselGroup')

        # if there's a change in item group then
        # update controls state and move items
        if @itemGroupShowing != currentGroup
          @updateControlsState()
          @moveItems()


    # move the "heroCarousel"
    moveItems: ->

      @container.css 'left', -(@windowWidth * @itemGroupShowing)

    # add some class names to heroCarousel
    navigationInit: ->

      @el
        .addClass('heroCarouselNavigationShow')
        .addClass('heroCarouselNavigation' + @options.navigationPosition)

    # add some class names to heroCarousel
    paginationInit: ->

      @el
        .addClass('heroCarouselPaginationShow')

    # creates the navigation html
    buildNavigationHtml: ->

      return '' if !@options.navigation

      # previous button
      this.btnPrev = $('<a>', {
        class: 'heroCarouselPrevious disabled'
        href: '#'
        title: 'Previous'
        text: 'Previous'
      })

      # next button
      this.btnNext = $('<a>', {
        class: 'heroCarouselNext'
        href: '#'
        title: 'Next'
        text: 'Next'
      })

      return this

    # creates the counter html
    buildCounterHtml: ->

      return '' if !@options.counter

      counter = $('<div>', {
        class: 'heroCarouselNavigationCounter',
        html: '<span class="heroCarouselNavigationCounterCurrent">' +
              (@itemGroupShowing + 1) +
              '</span> - <span class="heroCarouselNavigationCounterTotal">' +
              @itemGroupTotal + '</span>'
      })

      return counter

    # creates the pagination html
    buildPaginationHtml: ->

      return '' if !@options.pagination

      paginationItems = []
      className = ['active']
      i = 0

      while i < @itemGroupTotal
        paginationItems.push '<a href="#" class="heroCarouselPaginationButton ' +
          (className[i] or '') + '" data-hero-carousel-group="' + i + '">' +
          (i + 1) + '</a>'
        i++

      pagination = $('<span/>',
        class: 'heroCarouselPagination'
        html: paginationItems
      )

      return pagination

    # appends controls to dom
    renderControls: ->

      controls = {
        outer: $('<div/>', { class: 'heroCarouselControls' })
        counter: @buildCounterHtml()
        navigation: @buildNavigationHtml()
        pagination: @buildPaginationHtml()
      }

      html = controls.outer
        .append(controls.navigation.btnPrev)
        .append(controls.counter)
        .append(controls.pagination)
        .append(controls.navigation.btnNext)

      @el.append(html)

    # updates the ui state of the controls
    updateControlsState: ->

      # updates the navigation buttons
      if @options.navigation

        nav =
          @el.find('.heroCarouselPrevious, .heroCarouselNext').removeClass('disabled')

        # disable previous button
        if @itemGroupShowing is 0
          nav.eq(0).addClass('disabled')

        # disable next button
        else if @itemGroupShowing is (@itemGroupTotal - 1)
          nav.eq(1).addClass('disabled')

      # updates the pagination dots
      if @options.pagination
        @el
          .find('.heroCarouselPaginationButton')
          .removeClass('active')
          .eq(@itemGroupShowing)
          .addClass('active')

      # updates the counter
      if @options.counter
        @el
          .find('.heroCarouselNavigationCounterCurrent')
          .text(@itemGroupShowing + 1)

    # removes the link that wraps the hero image
    removeLink: ->

      @heroImage.find('img').unwrap('a');


  # wrapper around the constructor that prevents multiple instantiations
  $.fn[pluginName] = (options) ->
    @each ->
      if !$.data(@, 'plugin_#{pluginName}')
        $.data(@, 'plugin_#{pluginName}', new Plugin(@, options))
      return
  return