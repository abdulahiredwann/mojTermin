require("dotenv").config();
const { PrismaClient } = require("../generated/prisma");
const p = new PrismaClient();
(async () => {
  const checks = [
    ["ultrazvok Maribor", { serviceName: { contains: "ultrazvok", mode: "insensitive" }, city: { contains: "Maribor", mode: "insensitive" }, serviceUnavailable: false }],
    ["ginekol Murska", { serviceName: { contains: "ginekol", mode: "insensitive" }, city: { contains: "Murska", mode: "insensitive" }, serviceUnavailable: false }],
    ["fizioter Celje", { serviceName: { contains: "fizioter", mode: "insensitive" }, city: { equals: "Celje", mode: "insensitive" }, serviceUnavailable: false }],
    ["nevrol Ljubljana", { serviceName: { contains: "nevrol", mode: "insensitive" }, city: { equals: "Ljubljana", mode: "insensitive" }, serviceUnavailable: false }],
    ["psihiatr Maribor", { serviceName: { contains: "psihiatr", mode: "insensitive" }, city: { contains: "Maribor", mode: "insensitive" }, serviceUnavailable: false }],
  ];
  for (const [label, where] of checks) {
    console.log(label + ":", await p.ezdravListing.count({ where }));
  }
  await p.$disconnect();
})();
