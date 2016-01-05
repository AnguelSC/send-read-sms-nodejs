var modem = require('modem').Modem();
var cola = [];
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'gestorsms'
});
var Session = require('modem').Ussd_Session
var CheckBalance = function(c) {
    var session = new Session;
    session.callback = c;

    session.parseResponse = function(response_code, message) {
        this.close();

        var match = message.match(/([0-9,\,]+)\sRial/);
        if(!match) {
            if(this.callback)
                this.callback(false);
            return ;
        }


        if(this.callback)
            this.callback(match[1]);

        session.modem.credit = match[1];
    }

    session.execute = function() {
        this.query('*141*#', session.parseResponse);
    }

    return session;
}
modem.open("COM13", function() {
	modem.on('sms received', function(sms) {
	    var data = sms.text.split('\u0000');
	    var status = data[0];
	    switch(status){
	    	case 'DNI':
	    	case 'dni':
	    	case 'Dni':
	    		connection.connect();
				connection.query("SELECT * FROM tbdatos_persona WHERE per_Numero = "+ sms.sender, function(err, rows, fields) {
				  if (err) throw err;
				  console.log('The solution is: ', rows[0]);
				  modem.sms({
				    receiver:sms.sender,
				    text:'Tu dni es: '+ rows[0].per_Dni,
				    encoding:'7bit'
				  }, function(err, sent_ids) {
				    if(err)
				      console.log('Error sending sms:', err);
				    else
				      console.log('Message sent successfully, here are reference ids:', sent_ids.join(','));
				  });
				});
				connection.end();
	    		break;
	    }
	  });
});