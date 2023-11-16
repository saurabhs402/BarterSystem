const{expect}=require("chai");
const{ ethers } =require("hardhat");

describe("Barter",async function(){

   it("Deploy the Smart contracts on blockchain,mint new nfts,sell a NFT and make transactions on blockchain",
   async function(){
      const _nftBarterContract=await ethers.getContractFactory("Barter");
      const Barter=await _nftBarterContract.deploy();
      // No such need of this await Barter.deployed();

      const BarterAddress=  Barter.address;

      const _nftContract=await ethers.getContractFactory("NFT");
      const NFT=await _nftContract.deploy(BarterAddress);

      const NFTAddress=NFT.address;

      let listingPrice=await Barter.getListingPrice();
      listingPrice=listingPrice.toString();

    //   stakeAmount = ethers.utils.parseEther("100000"); //  internal wei conversion facility

      const sellingPrice=ethers.utils.parseUnits("10","ether"); // not known this method yet

      let tokenId1= await NFT.createToken("https://www.pwskills1.com");
      let tokenId2= await NFT.createToken("https://www.pwskills2.com");


        // now itemId1,itemId2 can't used as type is not defined 
      await Barter.createMarketItem(NFTAddress,tokenId1,sellingPrice,{value:listingPrice,
     gasLimit:2800000 }); 
      await Barter.createMarketItem(NFTAddress,tokenId2,sellingPrice,{value:listingPrice,
      gasLimit:2800000});

      const[_,buyerAddress]=await ethers.getSigners();

      await Barter.connect(buyerAddress).createMarketSale(NFTAddress,tokenId1,{value:sellingPrice});

      let items=await Barter.fetchMarketItems();

      // items are the sarray of structure defined in solidity
      // so here wee are converting it to js
      // or we can use then to collect results
      // there is no need of await here

      items= await Promise.all(items.map(async i=>{
        const tokenURI=await NFT.tokenURI(i.tokenId);
        let price=ethers.utils.formatUnits(i.price.toString(),'ether')


        // price:i.price.toString()
        let item={
          price,
          tokenId:i.tokenId.toString(),
          seller:i.seller,
          owner:i.owner,
          tokenURI

        }
        return item;

      }))
      console.log("Items:",items);












   })



})