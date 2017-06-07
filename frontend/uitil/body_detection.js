export const detectOutlinePoints = imageData => {
  const rows = imageData.rows;
  const cols = imageData.cols;

  const points = [];
  for (let y = 0; y < rows; y++) {
    //slice from start of collumn to end of row
    const column = imageData.data.slice(rows*cols, rows*cols+rows);
    const mid = Math.floor(column.length/2);

    let leftEdge = 0;
    let rightEdge = 0;
    //check right edge
    for(let x = mid; x < cols; x++) {
      const value = imageData.data[x];
      if (value > 0) {
        rightEdge = x;
      }
    }
    //check for left edge
    for(let x = mid; x > 0; x--) {
      const value = imageData.data[x];
      if (value > 0) {
        leftEdge = x; // reasign until edge of frame
      }
    }
    points.push([leftEdge, y]);
    points.push([rightEdge, y]);
  }
  return points;
};
