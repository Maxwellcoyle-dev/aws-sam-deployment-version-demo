import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const AWS_REGION = process.env.AWS_REGION;
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
const S3_BUCKET = process.env.S3_BUCKET;

const sqsClient = new SQSClient({ region: AWS_REGION });
const s3Client = new S3Client({ region: AWS_REGION });

export const handler = async (event) => {
  console.log("Received event:", event);

  // Extract versionId from the event.Records[0].body
  const versionId = JSON.parse(event.Records[0].body).versionId;
  console.log("versionId:", versionId);

  // add a new text file to the S3 bucket with the versionId as the key
  console.log("Adding a new text file to the S3 bucket");
  const putObjectCommand = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: `${versionId}.txt`,
    Body: "Hello, World! Version -- " + versionId,
  });
  console.log("putObjectCommand:", putObjectCommand);

  const putObjectResponse = await s3Client.send(putObjectCommand);
  console.log("putObjectResponse:", putObjectResponse);

  // Delete the message from the SQS queue
  console.log("Deleting the message from the SQS queue");
  const deleteMessageCommand = new DeleteMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    ReceiptHandle: event.Records[0].receiptHandle,
  });
  console.log("deleteMessageCommand:", deleteMessageCommand);

  const deleteMessageResponse = await sqsClient.send(deleteMessageCommand);
  console.log("deleteMessageResponse:", deleteMessageResponse);

  // return 200 status code with the s3 key
  return {
    statusCode: 200,
    body: JSON.stringify({ key: `${versionId}.txt` }),
    message: "New text file added to S3 bucket and message deleted from SQS",
  };
};
