

var app = require('../app'),
    config = require('../config');


app.set('port', config.port);


app.listen(app.get('port'),function(){
    console.log("Server running on port\t===============>\t",app.get('port'));
});




