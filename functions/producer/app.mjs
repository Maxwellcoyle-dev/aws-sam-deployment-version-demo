import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const AWS_REGION = process.env.PROJECT_REGION;
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE;
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

const sqsClient = new SQSClient({ region: AWS_REGION });
const dynamodbClient = new DynamoDBClient({ region: AWS_REGION });

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  //   get the versionId from the body
  const versionId = JSON.parse(event.body).versionId;
  console.log("versionId:", versionId);

  // Create a new record in DynamoDB
  console.log("Creating a new record in DynamoDB");
  const putItemCommand = new PutItemCommand({
    TableName: DYNAMODB_TABLE,
    Item: {
      versionId: { S: versionId },
    },
  });
  console.log("putItemCommand:", putItemCommand);

  const putItemResponse = await dynamodbClient.send(putItemCommand);
  console.log("putItemResponse:", putItemResponse);

  // Send a message to the SQS queue
  console.log("Sending a message to the SQS queue");
  const sendMessageCommand = new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify({ versionId }),
  });
  console.log("sendMessageCommand:", sendMessageCommand);
  const sendSQSMessageResponse = await sqsClient.send(sendMessageCommand);
  console.log("sendSQSMessageResponse:", sendSQSMessageResponse);

  // return 200 status code with version id
  return {
    statusCode: 200,
    body: JSON.stringify({ versionId }),
    message: "New record created in DynamoDB and message sent to SQS",
  };
};
