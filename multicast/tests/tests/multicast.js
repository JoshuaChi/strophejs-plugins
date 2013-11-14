MultiCast = {
  connection: null,
  plugin: null
};

$(document).ready(function () {
  $('#login_dialog').dialog({
    autoOpen: true,
    draggable: false,
    model: true,
    title: 'Connect to XMPP',
    buttons: {
      "Connect": function () {
        $(document).trigger('connect', {
          jid: $('#jid').val(),
        password: $('#password').val()
        });
        $('#password').val('');
        $(this).dialog('close');
      }
    }
  });
  $('#disconnect').click(function () {
    $('#disconnect').attr('disabled', 'disabled');
    MultiCast.connection.disconnect();
  });
});

$(document).bind('connect', function (ev, data) {
    var conn = new Strophe.Connection('http://pubsub.lab:5280/http-bind');
    conn.connect(data.jid, data.password, function (status) {
      if (status == Strophe.Status.CONNECTING) {
        console.log('Connecting...');
      } else if (status == Strophe.Status.CONNFAIL) {
        console.log('Failed to connect!');
      } else if (status == Strophe.Status.DISCONNECTING) {
        console.log('Disconnecting...');
      } else if (status == Strophe.Status.DISCONNECTED) {
        console.log('Disconnected');
        $(document).trigger('disconnected');
      } else if (status == Strophe.Status.CONNECTED) {
        $(document).trigger('connected');
      }
      return true;
    });
    MultiCast.connection = conn;
    MultiCast.plugin = conn.multicast
});
$(document).bind('connected', function () {
    $('#disconnect').removeAttr('disabled');
    /*MultiCast.connection.send($pres());*/
    /*MultiCast.plugin.check_support(function(data, options){*/
    /*console.log(data);*/
    /*console.log(options);*/
    /*console.log("support multicast!");*/
    /*console.log("now send messages to following addresses: b,c,d,e,f,g");*/
    /*MultiCast.plugin.message(["b@multicast.localhost", "c@multicast.localhost", "d@multicast.localhost"], "admin is login now.");*/
    /*}, function(){console.log("doesn't support multicast!");});*/
});
$(document).bind('disconnected', function () {
    MultiCast.connection = null;
    $('#roster').empty();
    $('#login_dialog').dialog('open');
});
