(function($, w) {
  var methods, _ONE_DAY, _addCssToRow, _baseDate, _defaults, _findRow, _int2duration, _int2time, _isPm, _keyhandler, _render, _selectValue, _setSelected, _time2int;
  _render = function(self) {
    var am, durStart, duration, ele, end, i, list, pm, row, settings, start, timeInt, timeText, zIndex, _i, _j, _len, _len2, _ref, _ref2;
    settings = self.data("settings");
    list = self.siblings(".ui-timepicker-list");
    if (list && list.length) {
      list.remove();
    }
    list = $("<ul />");
    list.attr("tabindex", -1);
    list.addClass("ui-timepicker-list");
    if (settings.className) {
      list.addClass(settings.className);
    }
    zIndex = self.css("zIndex");
    zIndex = (zIndex + 0 === zIndex ? zIndex + 2 : 2);
    list.css({
      display: "none",
      position: "absolute",
      left: (self.position().left),
      zIndex: zIndex
    });
    if (settings.minTime !== null && settings.showDuration) {
      list.addClass("ui-timepicker-with-duration");
    }
    durStart = (settings.durationTime !== null ? settings.durationTime : settings.minTime);
    start = (settings.minTime !== null ? settings.minTime : 0);
    end = (settings.maxTime !== null ? settings.maxTime : start + _ONE_DAY - 1);
    if (end <= start) {
      end += _ONE_DAY;
    }
    i = start;
    am = [];
    pm = [];
    if (settings.addMarkers) {
      pm.push($("<div class='ui-timepicker-marker'>PM</div>"));
      am.push($("<div class='ui-timepicker-marker'>AM</div>"));
    }
    while (i <= end) {
      timeInt = i % _ONE_DAY;
      row = $("<li />");
      row.data("time", timeInt);
      timeText = _int2time(timeInt, settings.timeFormat);
      row.text(timeText);
      if (settings.minTime !== null && settings.showDuration) {
        duration = $("<span />");
        duration.addClass("ui-timepicker-duration");
        duration.text(" (" + _int2duration(i - durStart) + ")");
        row.append(duration);
      }
      if (_isPm(timeText.toLowerCase())) {
        row.addClass("ui-timepicker-pm");
        _addCssToRow(row, timeText, settings.step, true);
        pm.push(row);
      } else {
        row.addClass("ui-timepicker-am");
        _addCssToRow(row, timeText, settings.step, false);
        am.push(row);
      }
      i += settings.step * 60;
    }
    if (settings.pmBeforeAm) {
      _ref = pm.concat(am);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ele = _ref[_i];
        list.append(ele);
      }
    } else {
      _ref2 = am.concat(pm);
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        ele = _ref2[_j];
        list.append(ele);
      }
    }
    self.after(list);
    _setSelected(self, list);
    return list.delegate("li", "click", {
      timepicker: self
    }, function(e) {
      self.addClass("ui-timepicker-hideme");
      self[0].focus();
      list.find("li").removeClass("ui-timepicker-selected");
      $(this).addClass("ui-timepicker-selected");
      _selectValue(self);
      return list.hide();
    });
  };
  _addCssToRow = function(row, value, step) {
    if (!value.match(/00/)) {
      if (step === 15) {
        row.addClass("ui-timepicker-qtr");
      }
      if (step === 30) {
        return row.addClass("ui-timepicker-half");
      }
    } else {
      return row.addClass("ui-timepicker-full");
    }
  };
  _isPm = function(value) {
    return value.match(/pm/);
  };
  _findRow = function(self, list, value) {
    var out, settings;
    if (!value && value !== 0) {
      return false;
    }
    settings = self.data("settings");
    out = false;
    list.find("li").each(function(i, obj) {
      var jObj;
      jObj = $(obj);
      if (Math.abs(jObj.data("time") - value) <= settings.step * 30) {
        out = jObj;
        return false;
      }
    });
    return out;
  };
  _setSelected = function(self, list) {
    var selected, timeValue;
    timeValue = _time2int(self.val());
    selected = _findRow(self, list, timeValue);
    if (selected) {
      return selected.addClass("ui-timepicker-selected");
    }
  };
  _keyhandler = function(e) {
    var list, selected, self;
    self = $(this);
    list = self.siblings(".ui-timepicker-list");
    if (!list.is(":visible")) {
      if (e.keyCode === 40) {
        self.focus();
      } else {
        return true;
      }
    }
    switch (e.keyCode) {
      case 13:
        _selectValue(self);
        methods.hide.apply(this);
        e.preventDefault();
        return false;
      case 38:
        selected = list.find(".ui-timepicker-selected");
        if (!selected.length) {
          selected = void 0;
          list.children().each(function(i, obj) {
            if ($(obj).position().top > 0) {
              selected = $(obj);
              return false;
            }
          });
          return selected.addClass("ui-timepicker-selected");
        } else if (!selected.is(":first-child")) {
          selected.removeClass("ui-timepicker-selected");
          selected.prev().addClass("ui-timepicker-selected");
          if (selected.prev().position().top < selected.outerHeight()) {
            return list.scrollTop(list.scrollTop() - selected.outerHeight());
          }
        }
        break;
      case 40:
        selected = list.find(".ui-timepicker-selected");
        if (selected.length === 0) {
          selected = void 0;
          list.children().each(function(i, obj) {
            if ($(obj).position().top > 0) {
              selected = $(obj);
              return false;
            }
          });
          return selected.addClass("ui-timepicker-selected");
        } else if (!selected.is(":last-child")) {
          selected.removeClass("ui-timepicker-selected");
          selected.next().addClass("ui-timepicker-selected");
          if (selected.next().position().top + 2 * selected.outerHeight() > list.outerHeight()) {
            return list.scrollTop(list.scrollTop() + selected.outerHeight());
          }
        }
        break;
      case 27:
        list.find("li").removeClass("ui-timepicker-selected");
        return list.hide();
      case 9:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 39:
      case 45:
        break;
      default:
        list.find("li").removeClass("ui-timepicker-selected");
    }
  };
  _selectValue = function(self) {
    var altTimeString, cursor, list, settings, timeString, timeValue;
    settings = self.data("settings");
    list = self.siblings(".ui-timepicker-list");
    timeValue = null;
    cursor = list.find(".ui-timepicker-selected");
    if (cursor.length) {
      timeValue = cursor.data("time");
    } else if (self.val()) {
      timeValue = _time2int(self.val());
      _setSelected(self, list);
    }
    if (timeValue !== null) {
      timeString = _int2time(timeValue, settings.timeFormat);
      if (settings.altField) {
        altTimeString = (settings.altFormat ? _int2time(timeValue, settings.altFormat) : timeString);
        $(settings.altField).each(function() {
          return $(this).val(altTimeString);
        });
      }
      self.attr("value", timeString);
    }
    settings.onSelect.call(self);
    return self.trigger("change");
  };
  _int2duration = function(seconds) {
    var hours, minutes;
    minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return minutes + " mins";
    } else if (minutes === 60) {
      return "1 hr";
    } else {
      hours = minutes / 60;
      return hours.toFixed(1) + " hrs";
    }
  };
  _int2time = function(seconds, format) {
    var code, hour, i, minutes, output, time;
    time = new Date(_baseDate.valueOf() + (seconds * 1000));
    output = "";
    i = 0;
    while (i < format.length) {
      code = format.charAt(i);
      switch (code) {
        case "a":
          output += (time.getHours() > 11 ? "pm" : "am");
          break;
        case "A":
          output += (time.getHours() > 11 ? "PM" : "AM");
          break;
        case "g":
          hour = time.getHours() % 12;
          output += (hour === 0 ? "12" : hour);
          break;
        case "G":
          output += time.getHours();
          break;
        case "h":
          hour = time.getHours() % 12;
          if (hour !== 0 && hour < 10) {
            hour = "0" + hour;
          }
          output += (hour === 0 ? "12" : hour);
          break;
        case "H":
          hour = time.getHours();
          output += (hour > 9 ? hour : "0" + hour);
          break;
        case "i":
          minutes = time.getMinutes();
          output += (minutes > 9 ? minutes : "0" + minutes);
          break;
        case "s":
          seconds = time.getSeconds();
          output += (seconds > 9 ? seconds : "0" + seconds);
          break;
        default:
          output += code;
      }
      i++;
    }
    return output;
  };
  _time2int = function(timeString) {
    var d, hour, hours, minutes, time;
    if (timeString === "") {
      return null;
    }
    if (timeString + 0 === timeString) {
      return timeString;
    }
    if (typeof timeString === "object") {
      timeString = timeString.getHours() + ":" + timeString.getMinutes();
    }
    d = new Date(0);
    time = timeString.toLowerCase().match(/(\d+)(?::(\d\d))?\s*([pa]?)/);
    if (!time) {
      return null;
    }
    hour = parseInt(time[1] * 1);
    if (time[3]) {
      if (hour === 12) {
        hours = (time[3] === "p" ? 12 : 0);
      } else {
        hours = hour + (time[3] === "p" ? 12 : 0);
      }
    } else {
      hours = hour;
    }
    minutes = time[2] * 1 || 0;
    return hours * 3600 + minutes * 60;
  };
  _baseDate = new Date();
  _baseDate.setHours(0);
  _baseDate.setMinutes(0);
  _ONE_DAY = 86400;
  _defaults = {
    className: null,
    minTime: null,
    maxTime: null,
    durationTime: null,
    step: 30,
    showDuration: false,
    pmBeforeAm: false,
    timeFormat: "g:ia",
    scrollDefaultNow: false,
    altField: '',
    altFormat: null,
    addMarkers: false,
    onSelect: function() {}
  };
  methods = {
    init: function(options) {
      return this.each(function() {
        var attrs, container, i, input, prettyTime, raw_attrs, self, settings;
        self = $(this);
        if (self[0].tagName === "SELECT") {
          input = $("<input />");
          attrs = {
            type: "text",
            value: self.val()
          };
          raw_attrs = self[0].attributes;
          i = 0;
          while (i < raw_attrs.length) {
            attrs[raw_attrs[i].nodeName] = raw_attrs[i].nodeValue;
            i++;
          }
          input.attr(attrs);
          self.replaceWith(input);
          self = input;
        }
        settings = $.extend({}, _defaults);
        if (options) {
          settings = $.extend(settings, options);
        }
        if (settings.minTime) {
          settings.minTime = _time2int(settings.minTime);
        }
        if (settings.maxTime) {
          settings.maxTime = _time2int(settings.maxTime);
        }
        if (settings.durationTime) {
          settings.durationTime = _time2int(settings.durationTime);
        }
        self.data("settings", settings);
        self.attr("autocomplete", "off");
        self.click(methods.show).focus(methods.show).keydown(_keyhandler);
        self.addClass("ui-timepicker-input");
        if (self.val()) {
          prettyTime = _int2time(_time2int(self.val()), settings.timeFormat);
          self.val(prettyTime);
        }
        container = $("<span class=\"ui-timepicker-container\" />");
        self.wrap(container);
        return $("body").attr("tabindex", -1).focusin(function(e) {
          if ($(e.target).closest(".ui-timepicker-container").length === 0) {
            return methods.hide();
          }
        });
      });
    },
    show: function(e) {
      var list, nowTime, selected, self, settings, topOffset;
      self = $(this);
      list = self.siblings(".ui-timepicker-list");
      if (self.hasClass("ui-timepicker-hideme")) {
        self.removeClass("ui-timepicker-hideme");
        list.hide();
        return;
      }
      if (list.is(":visible")) {
        return;
      }
      methods.hide();
      if (list.length === 0) {
        _render(self);
        list = self.siblings(".ui-timepicker-list");
      }
      if ((self.offset().top + self.outerHeight(true) + list.outerHeight()) > $(w).height() + $(w).scrollTop()) {
        list.css({
          top: self.position().top - list.outerHeight()
        });
      } else {
        list.css({
          top: self.position().top + self.outerHeight(true)
        });
      }
      list.show();
      settings = self.data("settings");
      selected = list.find(".ui-timepicker-selected");
      if (!selected.length && settings.minTime === null && settings.scrollDefaultNow) {
        nowTime = _time2int(new Date());
        selected = _findRow(self, list, nowTime);
      }
      if (selected && selected.length) {
        topOffset = list.scrollTop() + selected.position().top - selected.outerHeight();
        return list.scrollTop(topOffset);
      } else {
        return list.scrollTop(0);
      }
    },
    hide: function(e) {
      return $(".ui-timepicker-list:visible").each(function() {
        var list, self;
        list = $(this);
        self = list.siblings(".ui-timepicker-input");
        _selectValue(self);
        return list.hide();
      });
    },
    option: function(key, value) {
      var list, self, settings;
      self = $(this);
      settings = self.data("settings");
      list = self.siblings(".ui-timepicker-list");
      if (typeof key === "object") {
        settings = $.extend(settings, key);
      } else if (typeof key === "string" && typeof value !== "undefined") {
        settings[key] = value;
      } else {
        if (typeof key === "string") {
          return settings[key];
        }
      }
      if (settings.minTime) {
        settings.minTime = _time2int(settings.minTime);
      }
      if (settings.maxTime) {
        settings.maxTime = _time2int(settings.maxTime);
      }
      if (settings.durationTime) {
        settings.durationTime = _time2int(settings.durationTime);
      }
      self.data("settings", settings);
      return list.remove();
    },
    getSecondsFromMidnight: function() {
      return _time2int($(this).val());
    },
    setTime: function(value) {
      var prettyTime, self;
      self = $(this);
      prettyTime = _int2time(_time2int(value), self.data("settings").timeFormat);
      return self.val(prettyTime);
    }
  };
  return $.fn.timepicker = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === "object" || !method) {
      return methods.init.apply(this, arguments);
    } else {
      return $.error("Method " + method + " does not exist on jQuery.timepicker");
    }
  };
})(jQuery, window);
