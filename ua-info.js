const hyperHTML = require('hyperhtml');
require('./hyperHTML.Component');

class UserAgent extends hyperHTML.Component {
  render = (
    <p>
      <small>Your user agent string is:</small>
      <br />
      {this.props.ua}
    </p>
  )
  state = { }
}
// what does the index page represent ?
module.exports = (render, model) => render`
  <hyper-user-agent ua="${model.userAgent}" />
`;
