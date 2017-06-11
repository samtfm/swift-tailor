export let stdDev = (part) => {
  let total = 0,
    mean = 0,
    diffSqredArr = [];

  for(let i = 0; i < part.length ; i += 1){
    total+=part[i];
  }

  mean = total/part.length;
  for(let j=0 ; j < part.length ; j += 1){
    diffSqredArr.push(Math.pow((part[j]-mean),2));
  }
  return (Math.sqrt(diffSqredArr.reduce(function(firstEl, nextEl){
    return firstEl + nextEl;
  })/part.length));
};

export let average = (arr) => {
  return arr.reduce((a,b) => a + b) / arr.length;
};

export let inStdDev = (arr) => {
  let avg = average(arr);
  let std = stdDev(arr);
  return arr.filter((el) => {
    return Math.abs(avg - el) < std;
  });
};
