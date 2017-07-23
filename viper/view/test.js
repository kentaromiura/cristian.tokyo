const hyperHTML = require('hyperHTML');
require('./hyperHTML.Component');

class Test extends hyperHTML.Component {
  render = <fragment>Hello <strong> ${this.state.name} </strong>!</fragment>
  state = { name: '> Click me <' }
}
