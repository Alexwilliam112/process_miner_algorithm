const events = require('./data.json')

const groupEvents = (events) => {
  const groupedEvents = {};

  events.forEach(event => {
    const [name] = event.eventName.split(' ');
    if (!groupedEvents[name]) {
      groupedEvents[name] = [];
    }
    groupedEvents[name].push(event);
  });

  return groupedEvents;
};

const groupedEvents = groupEvents(events);
console.log(JSON.stringify(groupedEvents, null, 2));