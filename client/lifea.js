// Define Minimongo collections to match server/publish.js.
Areas   = new Meteor.Collection("areas");
Focuses = new Meteor.Collection("focuses");
Todos   = new Meteor.Collection("todos");

// Subscribe to collection on startup.
var areasHandle   = Meteor.subscribe('areas');
var focusesHandle = Meteor.subscribe('focuses');
var todosHandle   = Meteor.subscribe('todos');


// ID of currently selected area
Session.setDefault('area_id', null);

// When editing a area name, ID of the area
Session.setDefault('editing_areaname', null);

// State of archive filtering
Session.setDefault('archive_filter', false);

// When editing a focus name, ID of the focus
Session.setDefault('editing_focusname', null);


////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
};

var activateInput = function (input) {
  input.focus();
  input.select();
};


////////// Areas //////////

Template.areas.areas = function () {
  var sel = {};
  sel.archived = Session.get('archive_filter');

  return Areas.find(sel, {sort: {timestamp: 1}});
};

Template.areas.events({
  'mousedown .area': function (evt) { // select area
    Router.setArea(this._id);
  },

  'click .area': function (evt) {
    // prevent clicks on <a> from refreshing the page.
    evt.preventDefault();
  },

  'dblclick .area-name': function (evt, tmpl) { // start editing area name
    Session.set('editing_areaname', this._id);
    Deps.flush(); // force DOM redraw, so we can focus the edit field
    activateInput(tmpl.find("#area-name-input"));
  },

  'click .archive': function () {
    if (confirm("Are you sure you want to archive this area?")) {
      Areas.update(this._id, {$set: {archived: true}});
    }
  },

  'click .unarchive': function () {
    Areas.update(this._id, {$set: {archived: false}});
  },

  'click .destroy': function () {
    if (confirm("Are you sure you want to DESTROY this area?")) {
      Areas.remove(this._id);
    }
  }
});

// Attach events to keydown, keyup, and blur on "New list" input box.
Template.areas.events(okCancelEvents(
  '#new-area',
  {
    ok: function (text, evt) {
      var id = Areas.insert({
        name: text,
        archived: false,
        timestamp: (new Date()).getTime()
      });
      Router.setArea(id);
      evt.target.value = "";
    }
  }));

Template.areas.events(okCancelEvents(
  '#area-name-input',
  {
    ok: function (value) {
      Areas.update(this._id, {$set: {name: value}});
      Session.set('editing_areaname', null);
    },
    cancel: function () {
      Session.set('editing_areaname', null);
    }
  }));

// Attach events to keydown, keyup, and blur on "New focus" input box.
Template.areas.events(okCancelEvents(
  '#new-focus',
  {
    ok: function (text, evt) {
      var id = Focuses.insert({
        name: text,
        area_id: this._id,
        archived: false,
        timestamp: (new Date()).getTime()
      });
      // Router.setFocus(id);
      evt.target.value = "";
    }
  }));

Template.areas.selected = function () {
  return Session.equals('area_id', this._id) ? 'selected' : '';
};

Template.areas.editing = function () {
  return Session.equals('editing_areaname', this._id);
};

Template.areas.archives = function () {
  return Session.equals('archive_filter', true);
};

Template.areas.focuses = function () {
  var sel = {};
  sel.area_id = this._id;

  return Focuses.find(sel, {sort: {timestamp: 1}});
};


////////// Focuses //////////

Template.focus_item.events({
  // 'mousedown .focus': function (evt) { // select focus
  //   Router.setFocus(this._id);
  // },

  'click .focus': function (evt) {
    // prevent clicks on <a> from refreshing the page.
    evt.preventDefault();
  },

  'dblclick .focus-name': function (evt, tmpl) { // start editing focus name
    Session.set('editing_focusname', this._id);
    Deps.flush(); // force DOM redraw, so we can focus the edit field
    activateInput(tmpl.find("#focus-name-input"));
  },

  // 'click .archive': function () {
  //   if (confirm("Are you sure you want to archive this focus?")) {
  //     Focuses.update(this._id, {$set: {archived: true}});
  //   }
  // },

  'click .destroy': function () {
    if (confirm("Are you sure you want to DESTROY this focus?")) {
      Focuses.remove(this._id);
    }
  }
});

Template.focus_item.events(okCancelEvents(
  '#focus-name-input',
  {
    ok: function (value) {
      Focuses.update(this._id, {$set: {name: value}});
      Session.set('editing_focusname', null);
    },
    cancel: function () {
      Session.set('editing_focusname', null);
    }
  }));

Template.focus_item.editing = function () {
  return Session.equals('editing_focusname', this._id);
};


////////// Tag Controls //////////

Template.controls.events({
  'click .control': function (evt) {
    // prevent clicks on <a> from refreshing the page.
    evt.preventDefault();
  },
  'mousedown .archives': function () {
    Session.set('archive_filter', !Session.get('archive_filter'));
  }
});

Template.controls.archives = function () {
  return Session.equals('archive_filter', true);
};


////////// Tracking selected area in URL //////////

var AreasRouter = Backbone.Router.extend({
  routes: {
    ":area_id": "main"
  },
  main: function (area_id) {
    var oldList = Session.get("area_id");
    if (oldList !== area_id) {
      Session.set("area_id", area_id);
    }
  },
  setArea: function (area_id) {
    this.navigate(area_id, true);
  },
  setFocus: function (focus_id) {
    this.navigate(focus_id, true);
  }
});

Router = new AreasRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
