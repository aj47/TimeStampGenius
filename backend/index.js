const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({});

module.exports.handler = async (event) => {
  try {
    console.log(event, "event");
    const clientIP = event.requestContext.identity.sourceIp;
    console.log(clientIP, "clientIP");
    // what happens when we try add the same PK twice?
    const command = new PutItemCommand({
      TableName: process.env.DB,
      // For more information about data types,
      // see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html#HowItWorks.DataTypes and
      // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html#Programming.LowLevelAPI.DataTypeDescriptors
      Item: {
        PK: { S: clientIP },
        SK: { S: (Math.floor(new Date().getTime() / 1000) + 360).toString() },
        ttl: { N: (Math.floor(new Date().getTime() / 1000) + 360).toString() },
      },
    });
    const response = await client.send(command);
    console.log(response, "response");
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Go Serverless v3.0! Your function executed successfully!",
          input: event,
        },
        null,
        2
      ),
    };
  } catch (e) {
    console.error(e);
  }
};
