export const DrawOutline = imageData => {
  const rows = imageData.rows;
  const cols= imageData.cols;


  for (let y = 0; y < imageData.cols; y++) {
    //slice from start of collumn to end of row
    const column = imageData.data.slice(rows*cols, rows*cols+rows);


    let leftEdge, rightEdge;
    //check right edge
    for(let x = column.length/2; x < column.length; x++) {
      const value = imageData.data[x];
      if (value > 0) {
        rightEdge = x;
      }
    }
    //check for left edge
    for(let x = column.length/2; x > 0; x--) {
      const value = imageData.data[x];
      if (value > 0) {
        leftEdge = x; // reasign until edge of frame
      }
    }
  }

  //TODO: THIS FUNCTION SHOULD RETURN SOMETHING
};
