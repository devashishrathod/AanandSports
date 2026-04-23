const { throwError } = require("../../utils");

exports.splitAmount = (amount) => {
  const a = Number(amount || 0);
  if (!a || a <= 0) throwError(422, "Invalid payable amount");

  const totalPaise = Math.round(a * 100);
  const academyPaise = Math.floor((totalPaise * 70) / 100);
  const platformPaise = totalPaise - academyPaise;

  return {
    academyAmount: academyPaise / 100,
    platformAmount: platformPaise / 100,
  };
};
