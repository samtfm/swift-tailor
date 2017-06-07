export const detectOutlinePoints = imageData => {
  const height = imageData.rows;
  const width = imageData.cols;
  const mid = Math.floor(width*.5);
  const points = [];
  for (let y = 0; y < height; y++) {

    //slice from start of collumn to end of row
    const rowStart = y*width; // calculate start of row
    const column = imageData.data.slice(rowStart, rowStart+width);
    let leftEdge = 0;
    let rightEdge = 0;

    //check right edge
    for(let x = mid; x < width; x++) { // iterate from relative mid to edge
      const value = parseInt(imageData.data[rowStart+x]); // add offset from prev rows
      if (value > 0) { 
        rightEdge = x; // reasign until edge of frame
      }
    }
    //check for left edge
    for(let x = mid; x > 0; x--) {
      const value = imageData.data[rowStart+x];
      if (value > 0) {
        leftEdge = x;
      }
    }
    points.push([leftEdge, y]);
    points.push([rightEdge, y]);
  }
  return points;
};
