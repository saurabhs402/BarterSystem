const hre=require("hardhat");

async function main(){
  const _nftBarterContract=await ethers.getContractFactory("Barter");
  const Barter=await _nftBarterContract.deploy();
  // No such need of this await NFTMarket.deployed();


  console.log("nft barter deployed to:",Barter.address);

  const _nftContract=await ethers.getContractFactory("NFT");
  const NFT=await _nftContract.deploy(Barter.address);

  console.log("nft deployed to:",NFT.address);


}
main().catch((error)=>{
  console.error(error);
  process.exitcode=1;
}

)