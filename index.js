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
    console.log("Fetching original image from S3");
    const originalImage = await s3
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();

    // （オリジナル画像）SharpでWebP変換と圧縮
    const optimizedImage = await sharp(originalImage.Body)
      .webp({ quality: 80 }) // WebP形式で品質80
      .toBuffer();

    // （オリジナル画像）WebP画像をアップロード
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

    // リサイズした画像を複数生成
    const sizes = [300, 600, 1200]; // 生成する画像の幅（px）
    for (const size of sizes) {
      // SharpでWebP変換と圧縮
      const resizedImage = await sharp(originalImage.Body)
        .resize({ width: size })
        .webp({ quality: 80 })
        .toBuffer();

      // WebP画像をアップロード
      const resizedKey = key.replace(/\.(jpg|jpeg|png)$/i, `_${size}px.webp`);
      await s3
        .putObject({
          Bucket: bucket,
          Key: `resized/${resizedKey}`,
          Body: resizedImage,
          ContentType: "image/webp",
          CacheControl: "max-age=31536000, public", // 1年間キャッシュ
        })
        .promise();
      console.log(`Resized image uploaded: resized/${resizedKey}`);
    }

    return {
      statusCode: 200,
      body: "All resized images uploaded successfully",
    };
  } catch (error) {
    console.error(`Error optimizing image: ${key}`, error);
    throw error;
  }
};
