// import multer from 'multer';
// import path from 'path';
// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs';
// import { ICloudinaryResponse, IFile } from '../interface/file';
// // Configuration
// cloudinary.config({
//   cloud_name: 'ddzk2sd7f',
//   api_key: '637516894516234',
//   api_secret: 'bVBUYQdaFa3cPYzBVdY45VJovKo', // Click 'View API Keys' above to copy your API secret
// });

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(process.cwd(), 'uploads'));
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// const uploadToCloudinary = async (
//   file: IFile
// ): Promise<ICloudinaryResponse | undefined> => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(
//       file.path,

//       // {public_id:file.originalname},

//       (error: Error, result: ICloudinaryResponse) => {
//         fs.unlinkSync(file.path);

//         if (error) {
//           reject(error);
//         } else {
//           resolve(result);
//         } 
//       }
//     );
//   });
// };

// // Upload an image
// //  const uploadResult = await cloudinary.uploader
// //    .upload(
// //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
// //            public_id: 'shoes',
// //        }
// //    )
// //    .catch((error) => {
// //        console.log(error);
// //    });

// // console.log(uploadResult);

// // Optimize delivery by resizing and applying auto-format and auto-quality
// // const optimizeUrl = cloudinary.url('shoes', {
// //     fetch_format: 'auto',
// //     quality: 'auto'
// // });

// // console.log(optimizeUrl);

// // // Transform the image: auto-crop to square aspect_ratio
// // const autoCropUrl = cloudinary.url('shoes', {
// //     crop: 'auto',
// //     gravity: 'auto',
// //     width: 500,
// //     height: 500,
// // });

// // console.log(autoCropUrl);

// export const fileUploder = {
//   upload,
//   uploadToCloudinary,
// };
