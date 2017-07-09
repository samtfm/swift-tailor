export const calcShirtLines = (chest, length, armHole, shoulders, neck, waist) => {
  // lines holds all the segments for the shirt
  const lines = [];
  // original neck measurement is only half
  neck = neck * 2;

  const neckline = [
    "M",
    [-neck/2, -5],
    "c",
    [neck*.2, neck*.55],
    [neck*.8, neck*.55],
    [neck, 0],
  ];

  const backNeckline = [
    "L",
    [-neck/2, -5],
    "c",
    [neck*.15, neck*.15],
    [neck*.85, neck*.15],
    [neck, 0],
  ];

  const shoulderLine = [
    "L",
    [neck/2, -5],
    [shoulders/4, 0]
  ];

  const leftShoulderLine = [
    "L",
    [-1 * neck/2, -5],
    [-1 * shoulders/4, 0]
  ];

  const sleeveCurve = [
    "L",
    [shoulders/4, 0],
    "C",
    [shoulders/4-armHole*.02, armHole*.2],
    [shoulders/4-armHole*.05, armHole*.7],
    [chest/4, armHole],
  ];

  const leftSleeveCurve = [
    "L",
    [-1 * chest/4, armHole],
    "C",
    [-1 * (shoulders/4-armHole*.05), armHole*.7],
    [-1 * (shoulders/4-armHole*.02), armHole*.2],
    [-1 * shoulders/4, 0],

  ];
  const sleeve = [
    "L",
    [0, 0],
    [length*.2, armHole * 2 * .12],
    [length*.2, armHole * 2 * .88],
    [0, 2*armHole],
  ];
  const sleeveCurveFull = [
    "L",
    [0, 0],
    "C",
    [-armHole*.11, armHole*.2],
    [-armHole*.25, armHole*.7],
    [-armHole*.25, armHole],
    "C",
    [-armHole*.25, armHole*1.3],
    [-armHole*.11, armHole*1.8],

    [0, 2*armHole]
  ];
  const box = [
    "L",
    [chest/4, armHole],
    [(waist/4), length],
    [-(waist/4), length],
    [-chest/4, armHole]
  ];
  lines.push(
    neckline, shoulderLine, sleeveCurve,
    box, leftSleeveCurve, leftShoulderLine
  );
  // lines.push(neckline);
  // lines.push(backNeckline);
  // lines.push(shoulderLine);
  // lines.push(sleeveCurve);
  // lines.push(box);
  // lines.push(leftSleeveCurve);
  // lines.push(leftShoulderLine);
  // lines.push(this.scaleLine(sleeveCurve));
  // lines.push(this.scaleLine(shoulderLine));
  // lines.push(this.transformLine(sleeve));
  // lines.push(this.transformLine(sleeveCurveFull));
  // lines.push(this.expandOutLine(box, 5,5));
  return lines;
};

export const calcSleeveLines = (armHole, length) => {
  const lines = [];

  const sleeve = [
    "M",
    [0, 0],
    [armHole*2*.12, armHole*.75],
    [armHole*2*.88, armHole*.75],
    [2*armHole, 0]
  ];

  const sleeveCurveFull = [
    "L",
    [2*armHole,0],
    "C",
    [armHole*2*.75, -armHole*.2],
    [armHole*2*.25, -armHole*.2],
    [0, 0]
  ];

  // replaced so sleeves can be cut in the same pattern as the shirt
  // const sleeveCurveFull = [
  //   "L",
  //   [0, 2*armHole],
  //   "C",
  //   [-armHole*.11, armHole*1.8],
  //   [-armHole*.25, armHole*1.3],
  //   [-armHole*.25, armHole],
  //   "C",
  //   [-armHole*.25, armHole*.7],
  //   [-armHole*.11, armHole*.2],
  //   [0, 0]
  // ];
  // const sleeve = [
  //   "M",
  //   [0, 0],
  //   [length*.2, armHole * 2 * .12],
  //   [length*.2, armHole * 2 * .88],
  //   [0, 2*armHole],
  // ];
  //

  lines.push(transformLine(sleeve), transformLine(sleeveCurveFull));
  return lines;
};
// mirrors the points over the y axis
// scaleLine is depreciated now that points are joined together
// some points needed to be reversed to create shape
// scaleLine(line){
//   return line.map(val => {
//     if (typeof val === 'string') return val;
//     return [-1*val[0], val[1]];
//   });
// }

// this just shifts the target right by an offset
function transformLine(line){
  let xOffset = 180;
  let yOffset = 0;
  return line.map(val => {
    if (typeof val === 'string') return val;
    return [val[0] + xOffset, val[1]] + yOffset;
  });
}
// expandOutLine(line, x, y){
//   return line.map(val => {
//     if (typeof val === 'string') return val;
//     return [val[0] + x * Math.sign(val[0]),
//             val[1] + y * Math.sign(val[1])];
//   });
// }

export const parseLines = (lines) =>{
  let wholeShirt = [];
  lines.forEach(line => {
    const pointString = line.map(pair => (
      typeof pair === "string" ? pair :
        `${pair[0].toString()} ${pair[1].toString()}`
      )).join(' ');
      // console.log(pointString);
      wholeShirt.push(pointString);
    // draw line from points
    // if (pointString[0].toLowerCase() === 'm'){
    //   group.add(this.draw.path(pointString).fill('none').stroke({ width: 1 }));
    // } else {
    //   group.add(this.draw.polyline(pointString).fill('none').stroke({ width: 1 }));
    // }
  });
  return wholeShirt;
};
