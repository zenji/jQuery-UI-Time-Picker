/*
 * jQuery UI TimePicker 0.1.1
 *
 * Copyright (c) 2009 Jason Dyke (www.zenjiwebworks.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Depends:
 *	ui.core.js
 */
$.widget("ui.timepicker", {

	_init: function() {
		var self = this;
		this._mainDivId = "ui-timepicker-div"; // The ID of the main timepicker division
		this._animDivId = "ui-timepicker-anim-div";
		this._timePickerShowing = false;

		this.element.bind('focus.timepicker', function(event){self._showTimePicker(event)});
		this.element.bind('keydown.timepicker', function(event){self._onKeyDown(event)});
		
		// Add the div which will be used to display the times
		if ($("body").find("#" + this._mainDivId).size() == 0)
		{
			var mainDiv = $("<div id='" + this._mainDivId + "' class='ui-timepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>");
			mainDiv.css("position", "absolute");
			mainDiv.css("left", "-99999px");
			
			var animDiv = $("<div id='" + this._animDivId + "'></div>");
			animDiv.css("position", "absolute");
			animDiv.css("left", "-99999px");
			animDiv.append(mainDiv);
			$("body").append(animDiv);
		}
	},
	_addTimeToList: function(ul, timeValue, timeDisplay) {
		var self = this;
		var listEntry = $("<li class='ui-state-default'>" + timeDisplay + "</li>")
			.mouseover(function(){$(this).addClass("ui-state-hover")})
			.mouseout(function(){$(this).removeClass("ui-state-hover")})
			.click(function(event){self._selectTime(event, timeValue)});
		
		ul.append(listEntry);
	},
	_showTimePicker: function(event) {
		var animDiv = $("#" + this._animDivId);
		var mainDiv = $("#" + this._mainDivId);
		
		var self = this;

		// Populate the div
		var elementId = this.element.attr("id");
		var currentEntry = this._getTime(this.element.val());
		if (!this.element.val())
		{
			// Add a default selection which is close to the time now
			var now = new Date();
			currentEntry.hour = now.getHours();
			currentEntry.minute = now.getMinutes();
		}
		
		mainDiv.empty();
		var scrollToEntry = 0;
		var foundEntry = false;
		
		var startHour = this._getData("startHour");
		var numberHours = this._getData("numberHours");
		var intervalMinutes = this._getData("intervalMinutes");
		
		var currentHour = startHour;
		var currentlyRenderedHours = 0;
		var currentMinute = 0;

		// Value in feeder
		var feedTime = this._getData("feedTime");
		var feederSelectedTime = null;
		if (feedTime)
		{
			// The curent feeder value overrides and set start time
			feederSelectedTime = this._getTime(feedTime.val());
			if(!isNaN(feederSelectedTime.hour) && !isNaN(feederSelectedTime.minute))
			{
				startHour = feederSelectedTime.hour;
				currentHour = feederSelectedTime.hour;
				currentMinute = feederSelectedTime.minute;
			}
			else
			{
				feederSelectedTime = null;
			}
		}
		
		var list = $("<ul></ul>");
		while (currentlyRenderedHours < numberHours)
		{
			var hourDisplay = "";
			var minuteDisplay = "";
			("" + currentHour).length < 2 ? hourDisplay = "0" + currentHour : hourDisplay = currentHour;
			("" + currentMinute).length < 2 ? minuteDisplay = "0" + currentMinute : minuteDisplay = currentMinute;
			
			var time = hourDisplay + ":" + minuteDisplay;
			var display = time;
			if (feederSelectedTime)
			{
				var hoursDifference = currentlyRenderedHours;
				var minutesDifference = currentMinute - feederSelectedTime.minute;
				
				if (currentMinute < feederSelectedTime.minute)
				{
					hoursDifference = hoursDifference - 1;
					minutesDifference = minutesDifference + 60;
				}
				
				display = display + " (" + hoursDifference + "h " + minutesDifference + "m)";
			}
		
			this._addTimeToList(list, time, display);
			
			// Determine if this entry is to be highlighted
			if (!foundEntry)
			{
				var minutesIn = (currentHour * 60) + currentMinute;
				var selectedMinutesIn = (currentEntry.hour * 60) + currentEntry.minute;
				if (selectedMinutesIn >= minutesIn && selectedMinutesIn < minutesIn + intervalMinutes)
				{
					foundEntry = true;
				}
				else
				{
					scrollToEntry++;
				}
			}
			
			// Get the next time in the list
			currentMinute += intervalMinutes;
			while (currentMinute > 59)
			{
				currentHour++;
				currentlyRenderedHours++;
				
				if (currentHour > 23)
				{
					currentHour -= 24;
				}
				currentMinute -= 60;
			}
		}
		mainDiv.append(list);
		
		// Set the widgets size
		animDiv.css("min-width", this.element.outerWidth() + 2);
		mainDiv.css("min-width", this.element.outerWidth());

		// Select any current selection in the input field
		var li = mainDiv.find("li:eq(" + scrollToEntry + ")");
		if(li)
		{
			li.addClass("ui-state-hover");
			li.unbind('mouseover').unbind('mouseout');
			mainDiv.scrollTop(li.outerHeight() * scrollToEntry);
		}

		// Show the div
		var showAnim = this._getData("showAnim");
		if (showAnim == "slide")
		{
			animDiv.css("left", this.element.position().left);
			animDiv.css("top", this.element.position().top + this.element.outerHeight());
			animDiv.css("height", "152px");
			animDiv.css("overflow", "hidden");
			mainDiv.css("left", "0");
			mainDiv.css("top", "-150px");
			
			mainDiv.animate({
				top: "0px"
			}, 300);
		}
		else if (showAnim == "fade")
		{
			animDiv.css("left", this.element.position().left);
			animDiv.css("top", this.element.position().top + this.element.outerHeight());
			animDiv.css("height", "152px");
			animDiv.css("overflow", "hidden");
			mainDiv.css("opacity", "0.0");
			mainDiv.css("left", "0");
			mainDiv.css("top", "0");

			mainDiv.animate({
				opacity: 1.0
			}, 300);
		}
		else
		{
			animDiv.css("left", this.element.position().left);
			animDiv.css("top", this.element.position().top + this.element.outerHeight());
			animDiv.css("height", "152px");
			animDiv.css("overflow", "hidden");
			mainDiv.css("left", "0");
			mainDiv.css("top", "0");
		}
		
				
		// Set up the binding to detect clicks outside of the picker
		$(document).bind('mousedown.timepicker', function(event){self._checkExternalClick(event)});
		//this.element.bind('blur.timepicker', function(){self._hideTimePicker()});
		
		this._timePickerShowing = true; 
	},
	_getTime: function(timeString) {
		var parts = timeString.split(":", 2);
		return {hour: +parts[0], minute: +parts[1]};
	},
	_hideTimePicker: function() {
		var mainDiv = $("#" + this._mainDivId);
		mainDiv.addClass("ui-helper-hidden-accessible");

		// Unbind the mousedown event on the document
		$(document).unbind('mousedown.timepicker');
		this.element.unbind();
		this.element.find("li").unbind();
		//this.element.unbind('blur.timepicker');

		// Hide the div
		mainDiv.css("left", "-99999px");
		
		this._timePickerShowing = false;
	},
	_onKeyDown: function(event) {
		var mainDiv = $("#" + this._mainDivId);
		var handled = true;
		if (this._timePickerShowing)
			switch (event.keyCode) {
				case 9:
					this._hideTimePicker();
					break; // hide on tab out
				case 13: 
					// don't submit the form
					break; // select the value on enter
				case 27:
					this._hideTimePicker();
					break; // hide on escape
				default:
					handled = false;
			}
		else if (event.keyCode == 36 && event.ctrlKey) // display the time picker on ctrl+home
			this._showDatepicker(this);
		else {
			handled = false;
		}
		if (handled) {
			event.preventDefault();
			event.stopPropagation();
		}
	},
	/* Close time picker if clicked elsewhere. */
	_checkExternalClick: function(event) {
		var target = $(event.target);
		var elementId = event.target.id;
		
		if ((elementId != this._mainDivId) &&
			(target.parents('#' + this._mainDivId).length == 0) &&
			this._timePickerShowing)
		{
			this._hideTimePicker(event);
		}
	},
	_selectTime: function(event, timeValue) {
		this.element.val(timeValue);
		this._hideTimePicker();
		
		// Add a day to the date?
		var feedTime = this._getData("feedTime");
		var feedDate = this._getData("feedDate");
		var date = this._getData("date");
		if (feedTime)
		{
			var feedTimeValue = this._getTime(feedTime.val());
			var selectedTimeValue = this._getTime(timeValue);
			
			if (feedDate && date)
			{
				var feedDateValue = feedDate.datepicker('getDate');
				date.datepicker('setDate', feedDateValue);
				
				if (selectedTimeValue.hour < feedTimeValue.hour ||
					(selectedTimeValue.hour == feedTimeValue.hour && selectedTimeValue.minute < feedTimeValue.minute))
				{
					var currentDate = new Date(feedDateValue);
					var tomorrowsDate = new Date(
						currentDate.getFullYear(),
						currentDate.getMonth(),
						currentDate.getDate() + 1,
						currentDate.getHours(),
						currentDate.getMinutes(),
						currentDate.getSeconds());
					
					date.datepicker("setDate", tomorrowsDate);
				}
			}
		}
	},
	destroy: function() {
		$.widget.prototype.apply(this, arguments); // default destroy
		// now do other stuff particular to this widget
	}
});
 
$.extend($.ui.timepicker, {
	getter: "showAnim feedTime feedDate date startHour numberHours intervalMinutes",
	defaults: {
		showAnim: "show",
		feedTime: null,
		feedDate: null,
		date: null,
		startHour: 0,
		numberHours: 24,
		intervalMinutes: 30
	}
});