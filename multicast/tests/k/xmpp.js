var xmpp = function() {

  return {
    _connection: null,
    _jid: null,
    _pass: null,
    _presence: null,
    _fallback: false,

    init: function(options) {
      this._jid = options.jid;
      this._pass = options.pass;
      this._presence = options.presence;
      this._connection = new Strophe.Connection(options.server);
      
      this._debug = true;

      this.connect();
    },

    log: function(message) {
      if (xmpp._debug) {
        console.log(message);
      }
    },

    sendPresence: function(presence) {
      xmpp._connection.send($pres().c('show', {}, presence).tree());
    },

    connect: function() {
      this._connection.connect(
        xmpp._jid,
        xmpp._pass,
        xmpp._onConnect
      );
    },

    disconnect: function() {
      xmpp._connection.flush();
      xmpp._connection.disconnect();
    },

    _onMessage: function(msg) {
      console.log(msg);
      var elements = msg.getElementsByTagName('body');
      if (0 < elements.length) {
        var data = elements[0].text || elements[0].textContent;
        ary = data.split('#');
        if('available' == ary[1]){
          $(ary[0]).removeClassName('inactive').addClassName('active');
        }else{
          $(ary[0]).removeClassName('active').addClassName('inactive');
        }
        /*var jsonData = data.evalJSON();*/
        /*rtns[jsonData.body.event_name](jsonData.body.event_body);*/
      }
      // We must return true to keep the handler alive.
      // Returning false would remove it after it finishes.
      return true;
    },

    _onConnect: function(status, err) {
      if (status == Strophe.Status.CONNECTING) {
        if (false === xmpp._fallback) {
          xmpp._fallback = true;
          xmpp._prepareFallback();
        }
      } else if (status == Strophe.Status.CONNECTED) {
        xmpp._connection.addHandler(xmpp._onMessage, null, 'message', null, null,  null);
        xmpp.sendPresence(xmpp._presence);
        window.setTimeout(xmpp.disconnect, 2700000); // 45 min
      }
    },

    _prepareFallback: function() {
      setTimeout(function() {
        if (false === xmpp._connection.connected && 0 < xmpp._connection.errors) {
          // If CORS fails, try connecting via Nginx
          xmpp._connection._onDisconnectTimeout();
          xmpp._connection.reset();
          xmpp._connection = new Strophe.Connection('/xmpp');
          xmpp.connect();
        }
      }, 5000);
    }
  };
}();


// attempt to send "unavailable" to xmpp when logging out
// this won't happen on all the clicks, but it's ok
document.observe('dom:loaded', function() {
  if ($('xmppDisconnect')) {
    Event.observe('xmppDisconnect', 'click', function(ev) {
      var loc = Event.element(ev).readAttribute('href');
      ev.stop();
      xmpp.disconnect();
      setTimeout(function() {
        window.location = loc;
      }, 400);
    });
  }
});
