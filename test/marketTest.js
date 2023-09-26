const{expect}=require("chai");
const{ ethers } =require("hardhat");

describe("NFTMarket",async function(){

   it("Deploy the Smart contracts on blockchain,mint new nfts,sell a NFT and make transactions on blockchain",
   async function(){
      const _nftMarketContract=await ethers.getContractFactory("NFTMarket");
      const NFTMarket=await _nftMarketContract.deploy();
      // No such need of this await NFTMarket.deployed();

      const NFTMarketAddress=  NFTMarket.address;

      const _nftContract=await ethers.getContractFactory("NFT");
      const NFT=await _nftContract.deploy(NFTMarketAddress);

      const NFTAddress=NFT.address;

      let listingPrice=await NFTMarket.getListingPrice();
      listingPrice=listingPrice.toString();

    //   stakeAmount = ethers.utils.parseEther("100000"); //  internal wei conversion facility

      const sellingPrice=ethers.utils.parseUnits("10","ether"); // not known this method yet

      let itemId1= await NFT.createToken("https://www.pwskills1.com");
      let itemId2= await NFT.createToken("https://www.pwskills2.com");


        // now itemId1,itemId2 can't used as type is not defined 
      await NFTMarket.createMarketItem(NFTAddress,1,sellingPrice,{value:listingPrice}); 
      await NFTMarket.createMarketItem(NFTAddress,2,sellingPrice,{value:listingPrice});

      const[_,buyerAddress]=await ethers.getSigners();

      await NFTMarket.connect(buyerAddress).createMarketSale(NFTAddress,1,{value:sellingPrice});

      let items=await NFTMarket.fetchMarketItems();

      // items are the sarray of structure defined in solidity
      // so here wee are converting it to js
      // or we can use then to collect results
      // there is no need of await here

      items= await Promise.all(items.map(async i=>{
        const tokenURI=await NFT.tokenURI(i.tokenId);

        let item={
          price:i.price.toString(),
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