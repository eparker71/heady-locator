console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context) {
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));
    var tableName = "Locations";


    getItems = function () {
        var params = {
            TableName: tableName
        };
        dynamodb.scan(params, function (err, data) {
            if (err) {
                console.log("Scan error: " + err);
                context.fail("Scan error: " + err);
            } else {
                console.log("Scan success ");
                console.log(data);
                context.succeed(data);
            }
        });
    };

    var member = event;
    switch (member.Method) {
        case "DELETE":   // Delete
            console.log("Deleting item: " + member.EmailAddress);
            //deleteItem(member);
            break;
        case "PUT":      // Add
            console.log("Adding item: " + member.EmailAddress);
            //addItem(member);
            break;
        case "GET":      // View Single
            console.log("Get item");
            //getItem(member.EmailAddress);
            //getItems();
            break;
        case "SCAN":      // View All
            console.log("Get items");
            getItems();
            break;
        case "POST":     // Edit
            console.log("Editing item: " + member.EmailAddress);
            //editItem(member);
            break;
        default:
            getItems();
            console.log("No method specified");
            break;
    }
    console.log("Done");
}
