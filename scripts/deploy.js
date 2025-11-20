const hre = require('hardhat');

async function main() {
  const crimeTrace = await hre.ethers.deployContract('CrimeTrace');
  await crimeTrace.waitForDeployment();
  const address = await crimeTrace.getAddress();
  console.log('CrimeTrace deployed to:', address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
