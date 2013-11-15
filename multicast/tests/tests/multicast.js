MultiCast = {
  connection: null,
  plugin: null,
  _onMessage: function(msg) {
              console.log(msg);
              var elements = msg.getElementsByTagName('body');
              if (0 < elements.length) {
                var data = elements[0].text || elements[0].textContent;
                ary = data.split('#');
                if('available' == ary[1]){
                  $('#'+ary[0]).removeClass('inactive').addClass('active');
                }else{
                  $('#'+ary[0]).removeClass('active').addClass('inactive');
                }
                /*var jsonData = data.evalJSON();*/
                /*rtns[jsonData.body.event_name](jsonData.body.event_body);*/
              }
              // We must return true to keep the handler alive.
              // Returning false would remove it after it finishes.
              return true;
            },
  _onPresence: function(pres) {
               console.log(pres);
               var elements = pres.getElementsByTagName('show');
               if (0 < elements.length) {
                 var data = elements[0].text || elements[0].textContent;
                 var to = pres.getAttribute("to");
                 ary = to.split('@');
                 if('available' == data){
                    $('#'+ary[0]).removeClass('inactive').addClass('active');
                 }else{
                    $('#'+ary[0]).removeClass('active').addClass('inactive');
                 }
               }
             },
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
    MultiCast.connection.send($pres());
    MultiCast.plugin.check_support(function(data, options){
      console.log(data);
      console.log(options);
      console.log("support multicast!");
      console.log("now send messages to following addresses: b,c,d,e,f,g");
      MultiCast.plugin.message(["b@multicast.localhost", "c@multicast.localhost", "d@multicast.localhost"], "admin is login now.");
      }, function(){console.log("doesn't support multicast!");});
    MultiCast.connection.addHandler(MultiCast._onMessage, null, 'message', null, null,  null);
    MultiCast.connection.addHandler(MultiCast._onPresence, null, 'presence', null, null,  null);
});
$(document).bind('disconnected', function () {
    MultiCast.connection = null;
    $('#roster').empty();
    $('#login_dialog').dialog('open');
});
