// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Barter is ReentrancyGuard{

    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice=0.001 ether;
    constructor() {
        owner=payable(msg.sender);
    }

    struct BarterItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;

        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    
    mapping(uint256 => BarterItem) private idToMarketItem;
    
    event BarterItemCreated(

        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );
    event MessageSender(
        address indexed s
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;

    }

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    )
    
    public payable nonReentrant{
       require(price > 0, "Price should at least be 1 wei");
       require(msg.value == listingPrice,"Price must be equal to listing price");

       _itemIds.increment();
       uint256 itemId= _itemIds.current();

  

       idToMarketItem[itemId] =BarterItem(    
           itemId,
           nftContract,
           tokenId,
           payable(msg.sender),

           payable(address(0)),

           price,
           false
       ); 

        IERC721(nftContract).approve(address(this),tokenId);  

        emit BarterItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
        
        }
    
    function createMarketSale(
        address nftContract,
        uint256 itemId
    )   public payable nonReentrant {
        uint price = idToMarketItem[itemId].price;
        uint tokenId=idToMarketItem[itemId].tokenId;
        require(msg.value==price, "Please submit the asking price in order to complete the purchase");


        idToMarketItem[itemId].seller.transfer(msg.value);

        IERC721(nftContract).transferFrom(idToMarketItem[itemId].seller,msg.sender,tokenId);

        idToMarketItem[itemId].seller=payable(msg.sender);

        idToMarketItem[itemId].sold=true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);

    }

    function fetchMarketItems() public view returns (BarterItem[] memory){
        uint itemCount = _itemIds.current();
        // uint unsoldItemCount= _itemIds.current() - _itemsSold.current();

        uint currentIndex=0;

        // BarterItem[] memory items = new BarterItem[](unsoldItemCount);
        BarterItem[] memory items = new BarterItem[](itemCount);
        for(uint i=0; i< itemCount;i++){
            if(idToMarketItem[i+1].owner==address(0)){   // if(idToMarketItem[i+1].owner==address(0)){
                uint currentId=idToMarketItem[i+1].itemId;
                BarterItem storage currentItem=idToMarketItem[currentId];
                items[currentIndex]=currentItem;
                currentIndex+=1;
            }

        }
            return items;
    }

 
    function fetchMyNFTs() public view returns (BarterItem[] memory){
        uint totalItemCount=_itemIds.current();
        uint itemCount=0;
        uint currentIndex=0;

        for (uint i=0;i<totalItemCount;i++)
        {
            if(idToMarketItem[i+1].seller==msg.sender){
                itemCount+=1;
                
                }
        }
            BarterItem[] memory items=new BarterItem[](itemCount);
            for(uint i=0;i<totalItemCount;i++)
            {
                if(idToMarketItem[i+1].seller==msg.sender){
                    uint currentId=i+1;
                    BarterItem storage currentItem = idToMarketItem[currentId];
                    items[currentIndex]=currentItem;
                    currentIndex+=1;


                }
            }
            // emit MessageSender(
            //     msg.sender
            // );
            return items;
    }
    function fetchItemsCreated() public view returns (BarterItem[] memory){

        uint totalItemCount = _itemIds.current();
        uint itemCount=0;
        uint currentIndex=0;

        for (uint i=0 ; i<totalItemCount ; i++){
            if(idToMarketItem[i+1].seller==msg.sender){
                itemCount+=1;

            }
        }
        BarterItem[] memory items = new BarterItem[](itemCount);
        for(uint i=0;i< totalItemCount; i++){
            if(idToMarketItem[i+1].seller==msg.sender){
                uint currentId=i+1;
                BarterItem storage currentItem= idToMarketItem[currentId];
                items[currentIndex]=currentItem;
                currentIndex+=1;


            }
        }
        return items;
    }

  function exchangeNFT(address nftContract,
        uint256 itemId) public payable nonReentrant {
        
        uint tokenIdWhoWantsToSell=idToMarketItem[itemId].tokenId;

        uint totalItemCount=_itemIds.current();
        address whoWantsToSell=idToMarketItem[itemId].seller;

       // uint itemCount=0;
       // uint currentIndex=0;

        for (uint i=1;i<=totalItemCount;i++)
        {
            if(idToMarketItem[i].seller==msg.sender){
                 uint tokenIdWhoWantsToExchange=idToMarketItem[i].tokenId;
                 address whoWantsToExchange=idToMarketItem[i].seller;

                IERC721(nftContract).transferFrom(whoWantsToSell,whoWantsToExchange,tokenIdWhoWantsToSell);



                IERC721(nftContract).transferFrom(whoWantsToExchange,whoWantsToSell,tokenIdWhoWantsToExchange);



                idToMarketItem[itemId].seller=payable(whoWantsToExchange);

                idToMarketItem[i].seller=payable(whoWantsToSell);
                

                 break;
                }
        }
        //  BarterItem[] memory items=new BarterItem[](itemCount);

        //   for(uint i=1;i<=totalItemCount;i++)
        //     {
        //         if(idToMarketItem[i].owner==msg.sender){
        //             uint currentId=i;
        //             BarterItem storage currentItem = BarterItem[currentId];
        //             items[currentIndex]=currentItem;
        //             currentIndex+=1;


        //         }
        //     }
   
   }

     function acceptNFT(address nftContract,
        uint256 itemId1,uint256 itemId2) public payable nonReentrant {
        
        uint tokenIdWhoWantsToSell=idToMarketItem[itemId1].tokenId;

        address whoWantsToSell=idToMarketItem[itemId1].seller;

                uint tokenIdWhoWantsToExchange=itemId2;
                address whoWantsToExchange=idToMarketItem[itemId2].seller;


                IERC721(nftContract).transferFrom(whoWantsToSell,whoWantsToExchange,tokenIdWhoWantsToSell);



                IERC721(nftContract).transferFrom(whoWantsToExchange,whoWantsToSell,tokenIdWhoWantsToExchange);



                idToMarketItem[itemId1].seller=payable(whoWantsToExchange);

                idToMarketItem[itemId2].seller=payable(whoWantsToSell);
                

                 
                
        }
  
   
   


}

