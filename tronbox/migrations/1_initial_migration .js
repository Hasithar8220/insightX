var Insights = artifacts.require("../build/contracts/InsightMarketplace.json");

module.exports = function(deployer) {
  deployer.deploy(Insights);
};
