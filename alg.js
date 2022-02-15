let Apool = 0,
  Bpool = 0,
  mybetPercent = 0;

const addMyBet = (myBet, pool) => {
  if (pool === "A") {
    Apool += myBet; // This change to be emitted across the app.
    mybetPercent = +((myBet / Apool) * 100);
  } else {
    Bpool += myBet;
    mybetPercent = +((myBet / Bpool) * 100);
  }
  return mybetPercent;
};

const res = addMyBet(100, "A");
console.log(res);

const res2 = addMyBet(50, "A");
console.log(res2);

const resB = addMyBet(50, "B");
console.log(resB);
