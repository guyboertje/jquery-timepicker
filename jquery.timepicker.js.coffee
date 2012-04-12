(($, w) ->
  _render = (self) ->
    settings = self.data("settings")
    list = self.siblings(".ui-timepicker-list")
    list.remove()  if list and list.length
    list = $("<div />")
    list.attr "tabindex", -1
    list.addClass "ui-timepicker-list"
    list.addClass settings.className  if settings.className
    zIndex = self.css("zIndex")
    zIndex = (if (zIndex + 0 is zIndex) then zIndex + 2 else 2)
    list.css
      display: "none"
      position: "absolute"
      zIndex: zIndex

    list.addClass "ui-timepicker-with-duration"  if settings.minTime isnt null and settings.showDuration
    durStart = (if (settings.durationTime isnt null) then settings.durationTime else settings.minTime)
    start = (if (settings.minTime isnt null) then settings.minTime else 0)
    end = (if (settings.maxTime isnt null) then settings.maxTime else (start + _ONE_DAY - 1))
    end += _ONE_DAY  if end <= start
    i = start
    pm = $("<ul></ul>")
    pm.addClass "ui-timepicker-sublist"
    pm.append $("<div class='ui-timepicker-marker'>PM</div>") if settings.addMarkers
    am = $("<ul></ul>")
    am.addClass "ui-timepicker-sublist"
    am.append $("<div class='ui-timepicker-marker'>AM</div>") if settings.addMarkers
    while i <= end
      timeInt = i % _ONE_DAY
      row = $("<li />")
      row.data "time", timeInt
      timeText = _int2time(timeInt, settings.timeFormat)
      row.text timeText
      if settings.minTime isnt null and settings.showDuration
        duration = $("<span />")
        duration.addClass "ui-timepicker-duration"
        duration.text " (" + _int2duration(i - durStart) + ")"
        row.append duration
      if _isPm(timeText.toLowerCase())
        row.addClass "ui-timepicker-pm"
        _addCssToRow row, timeText, settings.step, true
        pm.append row
      else
        row.addClass "ui-timepicker-am"
        _addCssToRow row, timeText, settings.step, false
        am.append row
      i += settings.step * 60
    if settings.pmBeforeAm
      list.append ele for ele in [pm, am]
    else
      list.append ele for ele in [am, pm]
    self.after list
    _setSelected self, list
    $(w).resize {self: self, list: list}, _reposition
    list.delegate "li", "click",
      timepicker: self
    , (e) ->
      self.addClass "ui-timepicker-hideme"
      self[0].focus()
      list.find("li").removeClass "ui-timepicker-selected"
      $(this).addClass "ui-timepicker-selected"
      _selectValue self
      list.hide()
  _reposition = (event) ->
    self = event.data.self
    list = event.data.list
    top = if (self.offset().top + self.outerHeight(true) + list.outerHeight()) > $(w).height() + $(w).scrollTop()
            self.position().top - list.outerHeight()
          else
            self.position().top + self.outerHeight(true)
    list.css
      left: (self.position().left)
      top: top
  _addCssToRow = (row, value, step) ->
    if not value.match(/00/)
      row.addClass "ui-timepicker-qtr" if step is 15
      row.addClass "ui-timepicker-half" if step is 30
    else
      row.addClass "ui-timepicker-full"
  _isPm = (value) ->
    value.match(/pm/)
  _findRow = (self, list, value) ->
    return false  if not value and value isnt 0
    settings = self.data("settings")
    out = false
    list.find("li").each (i, obj) ->
      jObj = $(obj)
      if Math.abs(jObj.data("time") - value) <= settings.step * 30
        out = jObj
        false

    out
  _setSelected = (self, list) ->
    timeValue = _time2int(self.val())
    selected = _findRow(self, list, timeValue)
    selected.addClass "ui-timepicker-selected"  if selected
  _keyhandler = (e) ->
    self = $(this)
    list = self.siblings(".ui-timepicker-list")
    unless list.is(":visible")
      if e.keyCode is 40
        self.focus()
      else
        return true
    switch e.keyCode
      when 13
        _selectValue self
        methods.hide.apply this
        e.preventDefault()
        return false
      when 38
        selected = list.find(".ui-timepicker-selected")
        unless selected.length
          selected = undefined
          list.children().each (i, obj) ->
            if $(obj).position().top > 0
              selected = $(obj)
              false

          selected.addClass "ui-timepicker-selected"
        else unless selected.is(":first-child")
          selected.removeClass "ui-timepicker-selected"
          selected.prev().addClass "ui-timepicker-selected"
          list.scrollTop list.scrollTop() - selected.outerHeight()  if selected.prev().position().top < selected.outerHeight()
      when 40
        selected = list.find(".ui-timepicker-selected")
        if selected.length is 0
          selected = undefined
          list.children().each (i, obj) ->
            if $(obj).position().top > 0
              selected = $(obj)
              false

          selected.addClass "ui-timepicker-selected"
        else unless selected.is(":last-child")
          selected.removeClass "ui-timepicker-selected"
          selected.next().addClass "ui-timepicker-selected"
          list.scrollTop list.scrollTop() + selected.outerHeight()  if selected.next().position().top + 2 * selected.outerHeight() > list.outerHeight()
      when 27
        list.find("li").removeClass "ui-timepicker-selected"
        list.hide()
      when 9, 16, 17, 18, 19, 20, 33, 34, 35, 36, 37, 39, 45
        return
      else
        list.find("li").removeClass "ui-timepicker-selected"
        return
  _selectValue = (self) ->
    settings = self.data("settings")
    list = self.siblings(".ui-timepicker-list")
    timeValue = null
    cursor = list.find(".ui-timepicker-selected")
    if cursor.length
      timeValue = cursor.data("time")
    else if self.val()
      timeValue = _time2int(self.val())
      _setSelected self, list
    if timeValue isnt null
      timeString = _int2time(timeValue, settings.timeFormat)
      if settings.altField
        altTimeString = (if settings.altFormat then _int2time(timeValue, settings.altFormat) else timeString)
        $(settings.altField).each () ->
          $(this).val(altTimeString)
      self.attr "value", timeString
    settings.onSelect.call self
    self.trigger "change"
  _int2duration = (seconds) ->
    minutes = Math.round(seconds / 60)
    if minutes < 60
      minutes + " mins"
    else if minutes is 60
      "1 hr"
    else
      hours = minutes / 60
      hours.toFixed(1) + " hrs"
  _int2time = (seconds, format) ->
    time = new Date(_baseDate.valueOf() + (seconds * 1000))
    output = ""
    i = 0

    while i < format.length
      code = format.charAt(i)
      switch code
        when "a"
          output += (if (time.getHours() > 11) then "pm" else "am")
        when "A"
          output += (if (time.getHours() > 11) then "PM" else "AM")
        when "g"
          hour = time.getHours() % 12
          output += (if (hour is 0) then "12" else hour)
        when "G"
          output += time.getHours()
        when "h"
          hour = time.getHours() % 12
          hour = "0" + hour  if hour isnt 0 and hour < 10
          output += (if (hour is 0) then "12" else hour)
        when "H"
          hour = time.getHours()
          output += (if (hour > 9) then hour else "0" + hour)
        when "i"
          minutes = time.getMinutes()
          output += (if (minutes > 9) then minutes else "0" + minutes)
        when "s"
          seconds = time.getSeconds()
          output += (if (seconds > 9) then seconds else "0" + seconds)
        else
          output += code
      i++
    output
  _time2int = (timeString) ->
    return null  if timeString is ""
    return timeString  if timeString + 0 is timeString
    timeString = timeString.getHours() + ":" + timeString.getMinutes()  if typeof (timeString) is "object"
    d = new Date(0)
    time = timeString.toLowerCase().match(/(\d+)(?::(\d\d))?\s*([pa]?)/)
    return null  unless time
    hour = parseInt(time[1] * 1)
    if time[3]
      if hour is 12
        hours = (if (time[3] is "p") then 12 else 0)
      else
        hours = (hour + (if time[3] is "p" then 12 else 0))
    else
      hours = hour
    minutes = (time[2] * 1 or 0)
    hours * 3600 + minutes * 60
  _baseDate = new Date()
  _baseDate.setHours 0
  _baseDate.setMinutes 0
  _ONE_DAY = 86400
  _defaults =
    className: null
    minTime: null
    maxTime: null
    durationTime: null
    step: 30
    showDuration: false
    pmBeforeAm: false
    timeFormat: "g:ia"
    scrollDefaultNow: false
    altField: ''
    altFormat: null
    addMarkers: false
    onSelect: ->

  methods =
    init: (options) ->
      @each ->
        self = $(this)
        if self[0].tagName is "SELECT"
          input = $("<input />")
          attrs =
            type: "text"
            value: self.val()

          raw_attrs = self[0].attributes
          i = 0

          while i < raw_attrs.length
            attrs[raw_attrs[i].nodeName] = raw_attrs[i].nodeValue
            i++
          input.attr attrs
          self.replaceWith input
          self = input
        settings = $.extend({}, _defaults)
        settings = $.extend(settings, options)  if options
        settings.minTime = _time2int(settings.minTime)  if settings.minTime
        settings.maxTime = _time2int(settings.maxTime)  if settings.maxTime
        settings.durationTime = _time2int(settings.durationTime)  if settings.durationTime
        self.data "settings", settings
        self.attr "autocomplete", "off"
        self.click(methods.show).focus(methods.show).keydown _keyhandler
        self.addClass "ui-timepicker-input"
        if self.val()
          prettyTime = _int2time(_time2int(self.val()), settings.timeFormat)
          self.val prettyTime
        container = $("<span class=\"ui-timepicker-container\" />")
        self.wrap container
        $("body").attr("tabindex", -1).focusin (e) ->
          methods.hide()  if $(e.target).closest(".ui-timepicker-container").length is 0

    show: (e) ->
      self = $(this)
      list = self.siblings(".ui-timepicker-list")
      if self.hasClass("ui-timepicker-hideme")
        self.removeClass "ui-timepicker-hideme"
        list.hide()
        return
      return  if list.is(":visible")
      methods.hide()
      if list.length is 0
        _render self
        list = self.siblings(".ui-timepicker-list")
      _reposition(data: {self: self, list: list})
      list.show()
      settings = self.data("settings")
      selected = list.find(".ui-timepicker-selected")
      if not selected.length and settings.minTime is null and settings.scrollDefaultNow
        nowTime = _time2int(new Date())
        selected = _findRow(self, list, nowTime)
      if selected and selected.length
        topOffset = list.scrollTop() + selected.position().top - selected.outerHeight()
        list.scrollTop topOffset
      else
        list.scrollTop 0

    hide: (e) ->
      $(".ui-timepicker-list:visible").each ->
        list = $(this)
        self = list.siblings(".ui-timepicker-input")
        _selectValue self
        list.hide()

    option: (key, value) ->
      self = $(this)
      settings = self.data("settings")
      list = self.siblings(".ui-timepicker-list")
      if typeof key is "object"
        settings = $.extend(settings, key)
      else if typeof key is "string" and typeof value isnt "undefined"
        settings[key] = value
      else return settings[key]  if typeof key is "string"
      settings.minTime = _time2int(settings.minTime)  if settings.minTime
      settings.maxTime = _time2int(settings.maxTime)  if settings.maxTime
      settings.durationTime = _time2int(settings.durationTime)  if settings.durationTime
      self.data "settings", settings
      list.remove()

    getSecondsFromMidnight: ->
      _time2int $(this).val()

    setTime: (value) ->
      self = $(this)
      prettyTime = _int2time(_time2int(value), self.data("settings").timeFormat)
      self.val prettyTime

  $.fn.timepicker = (method) ->
    if methods[method]
      methods[method].apply this, Array::slice.call(arguments, 1)
    else if typeof method is "object" or not method
      methods.init.apply this, arguments
    else
      $.error "Method " + method + " does not exist on jQuery.timepicker"
)(jQuery, window)
