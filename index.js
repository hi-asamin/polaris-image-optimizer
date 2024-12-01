const AWS = require("aws-sdk");
const sharp = require("sharp");

// S3クライアント
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const { Records } = event;
  const bucket = Records[0].s3.bucket.name;
  const key = decodeURIComponent(Records[0].s3.object.key);

  if (!key.match(/\.(jpg|jpeg|png)$/i)) {
    console.log(`Skipping non-image file: ${key}`);
    return;
  }

  try {
    // S3から元画像を取得
    const originalImage = await s3
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();

    // SharpでWebP変換と圧縮
    const optimizedImage = await sharp(originalImage.Body)
      .webp({ quality: 80 }) // WebP形式で品質80
      .toBuffer();

    // WebP画像をアップロード
    const newKey = key.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    await s3
      .putObject({
        Bucket: bucket,
        Key: newKey,
        Body: optimizedImage,
        ContentType: "image/webp",
      })
      .promise();

    console.log(`Optimized image uploaded: ${newKey}`);
  } catch (error) {
    console.error(`Error optimizing image: ${key}`, error);
    throw error;
  }
};
