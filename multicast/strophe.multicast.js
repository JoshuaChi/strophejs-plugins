/* Extend Strophe.Connection to have member 'multicast'.
 */
Strophe.addConnectionPlugin('multicast', {
/*
Extend connection object to have plugin name 'multicast'.
*/
    _connection: null,
    _autoService: true,
    service: null,
    jid: null,

    //The plugin must have the init function.
    init: function(conn) {
      this._connection = conn;
      Strophe.addNamespace('MULTICAST',"http://jabber.org/protocol/multicast");
      Strophe.addNamespace('MULTICAST_ADDRESSES', "http://jabber.org/protocol/address");
    },

    // Called by Strophe on connection event
    statusChanged: function (status, condition) {
      var that = this._connection;
      if (this._autoService && status === Strophe.Status.CONNECTED) {
        this.service =  'multicast.'+Strophe.getDomainFromJid(that.jid);
        this.jid = that.jid;
      }
    },

    check_support: function(node, options, event_cb, success, error, barejid){
       var that = this._connection;
       var iqid = that.getUniqueId("iqchecksupport");

       var jid = this.jid;
       if(barejid){
         jid = Strophe.getBareJidFromJid(jid);
       }
       var iq = $iq({from:this.jid, to:this.service, type:'get', id:iqid})
           .c('query', { xmlns:Strophe.NS.DISCO_INFO });

       that.sendIQ(iq.tree(), success, error);
       return iqid;
    },

    /**
    Function
    Parameters:
    (String) room - The multi-user chat room name.
    (String) nick - The nick name used in the chat room.
    (String) message - The plaintext message to send to the room.
    (String) html_message - The message to send to the room with html markup.
    (String) type - "groupchat" for group chat messages o
                    "chat" for private chat messages
    Returns:
    msgiq - the unique id used to send the message
    */
    message: function(receivers, message) {
      var msg, msgid, parent, room_nick;
      msg = $msg({
        to: this.service,
        from: this.jid
      }).c("addresses", {
        xmlns: Strophe.NS.MULTICAST_ADDRESSES
      });
      for(var r in receivers){
        msg = msg.c("address", {
          type: "to",
          jid:
        });
      }
      .c("address", {
        type: "to",
        jid: 
      }).c("body", {})t(message);
      msg.up();
      if (html_message != null) {
        msg.c("html", {
          xmlns: Strophe.NS.XHTML_IM
        }).c("body", {
          xmlns: Strophe.NS.XHTML
        }).t(html_message);
        if (msg.node.childNodes.length === 0) {
          parent = msg.node.parentNode;
          msg.up().up();
          msg.node.removeChild(parent);
        } else {
          msg.up().up();
        }
      }
      msg.c("x", {
        xmlns: "jabber:x:event"
      }).c("composing");
      this._connection.send(msg);
      return msgid;
    },
});
