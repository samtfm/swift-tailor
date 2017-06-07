import jsfeat from 'jsfeat';
import profiler from './profiler';

export const applyCanny = (ctx, options, stat) => {
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;
  let imgU8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);

  stat.new_frame();
  // ctx.drawImage(video, 0, 0, canvasW, canvasH);
  var imageData = ctx.getImageData(0, 0, w, h);

  stat.start("grayscale");
  jsfeat.imgproc.grayscale(imageData.data, w, h, imgU8);
  stat.stop("grayscale");

  var r = options.blur_radius|0;
  var kernel_size = (r+1) << 1;

  stat.start("gauss blur");
  jsfeat.imgproc.gaussian_blur(imgU8, imgU8, kernel_size, 0);
  stat.stop("gauss blur");

  stat.start("canny edge");
  jsfeat.imgproc.canny(
    imgU8,
    imgU8,
    options.low_threshold|0,
    options.high_threshold|0
  );
  stat.stop("canny edge");

  // render result back to canvas
  var data_u32 = new Uint32Array(imageData.data.buffer);
  var alpha = (0xff << 24);
  var i = imgU8.cols*imgU8.rows, pix = 0;
  while(--i >= 0) {
      pix = imgU8.data[i];
      data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }

  ctx.putImageData(imageData, 0, 0);
  console.log(imgU8);
};
