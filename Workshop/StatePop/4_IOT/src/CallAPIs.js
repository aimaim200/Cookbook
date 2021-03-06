var https = require('https');
var aws = require('aws-sdk');

module.exports = {

    getPopMock: function(myState, callback) {
        var population = 5000;
        callback(population);
    },
    getPopFromAPI_POST: function(myState, callback) {

        var population = 0;
        var rank = 0;

        var post_data = {"usstate": myState};

        var post_options = {
            host:  'rmwum5l4zc.execute-api.us-east-1.amazonaws.com',
            port: '443',
            path: '/prod/stateresource',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(post_data))
            }
        };
        var post_req = https.request(post_options, res => {
            res.setEncoding('utf8');
            var returnData = "";
            res.on('data', chunk =>  {
                returnData += chunk;
            });
            res.on('end', () => {
                // this particular API returns a JSON structure:
                // returnData: {"usstate":"Delaware","attributes":[{"population":900000},{"rank":45}]}

                population = JSON.parse(returnData).attributes[0].population;

                callback(population);

            });
        });
        post_req.write(JSON.stringify(post_data));
        post_req.end();


    },

    getPopFromAPI_GET: (myState, callback) => {


        // try GET in your browser:
        // https://rmwum5l4zc.execute-api.us-east-1.amazonaws.com/prod/stateresource?usstate=Virginia

        var population = 0;
        var rank = 0;

        var options = {
            host: 'rmwum5l4zc.execute-api.us-east-1.amazonaws.com',
            port: 443,
            path: '/prod/stateresource?usstate=' + encodeURIComponent(myState),
            method: 'GET'
        };

        var req = https.request(options, res => {
            res.setEncoding('utf8');
            var returnData = "";

            res.on('data', chunk => {
                returnData += chunk;
            });

            res.on('end',  () => {
                // this particular API returns a JSON structure:
                // returnData: {"usstate":"Delaware","attributes":[{"population":900000},{"rank":45}]}

                population = JSON.parse(returnData).attributes[0].population;

                callback(population);

            });


        });
        req.end();


    },

    getPopFromArray:   (myState, callback) => {
        var population = 0;
        var rank = 0;

        var dataset = require('./datafiles/dataset.js');  // separate file also deployed to Lambda in ZIP archive

        for (var i = 0; i < dataset.length; i++) {
            if (dataset[i].Name.toLowerCase() === myState.toLowerCase() ) {
                population = dataset[i].population;
                rank = dataset[i].rank;

            }
        }
        callback(population);
    },

     setShadow: (pload, config, callback) => {
        var payloadObj={ "state":
            {
                "desired":
                    pload
                    // {"ms" : pload}
                    // {"pump":1}
            }
        };

        //Prepare the parameters of the update call

        var paramsUpdate = {

            "thingName" : config.IOT_THING_NAME,

            "payload" : JSON.stringify(payloadObj)

        };

        aws.config.region = config.IOT_BROKER_REGION;

    //Initializing client for IoT

        var iotData = new aws.IotData({endpoint: config.IOT_BROKER_ENDPOINT});

        console.log("new aws.IotData made");
        console.log("config = " + JSON.stringify(config));

        //Update Device Shadow

        iotData.updateThingShadow(paramsUpdate, function(err, data)  {
            if (err){
                console.log("error calling updateThingShadow ", err);
                callback("not ok");

            }
            else {
                console.log("updated your shadow");
                console.log(data);

                callback("ok");

            }

        });

    },

    RandomPhrase: function (listOfPhrases, callback) {

        var i = 0;
        i = Math.floor(Math.random() * listOfPhrases.length);
        callback(listOfPhrases [i]);

    }
};

