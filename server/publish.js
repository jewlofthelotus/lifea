// Areas -- {name: String,
//           archived: Boolean,
//           timestamp: Number}
Areas = new Meteor.Collection("areas");

// Publish complete set of areas to all clients.
Meteor.publish('areas', function () {
  return Areas.find();
});


// Focuses -- {name: String,
//             archived: Boolean,
//             area_id: String,
//             timestamp: Number}
Focuses = new Meteor.Collection("focuses");

// Publish complete set of focuses to all clients.
Meteor.publish('focuses', function () {
  return Focuses.find();
});


// Todos -- {text: String,
//           done: Boolean,
//           tags: [String, ...],
//           area_id: String,
//           focus_id: String,
//           timestamp: Number}
Todos = new Meteor.Collection("todos");

// Publish complete set of todos to all clients.
Meteor.publish('todos', function () {
  return Todos.find();
});
