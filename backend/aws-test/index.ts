const {
  S3Client,
  AbortMultipartUploadCommand,
  AbortMultipartUploadCommandInput,
} = require("@aws-sdk/client-s3");

const client = new S3Client({ region: "us-west-1" });
const params = {
  Bucket: "fencing-ai-ref",
  Key: "demo-video",
  UploadId: "12345",
};

const command = new AbortMultipartUploadCommand(params);
console.log("deez");
console.log(command);

client.send(command)
