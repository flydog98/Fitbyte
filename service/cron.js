const cron = require("node-cron");
const TimePromise = require("../models/userTimePromise");
const moment = require("moment");

const exerciseCheckCron = () => {
  cron.schedule("0-59 * * * * *", async () => {
    const yesterday = moment().startOf("day").subtract(1, 'd');
    var exerciseTime = 100;
    await TimePromise.updateOne(
      {
        date: {"$gte" : yesterday},
        amount: {"$lte" : exerciseTime}
      },
      {
        achieved: true,
      }
    )
      .clone()
      .catch(function(err) {
        console.log(err);
      });
  });
};

module.exports = exerciseCheckCron;
