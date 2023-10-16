import {ethers } from 'ethers'
import {useEffect,useState} from 'react'
import axios, { HttpStatusCode } from 'axios'
import Web3Modal from 'web3modal'
import { nftaddress,barteraddress } from '../config'

//const ipfsClient = require('ipfs-http-client');

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import Barter from "../artifacts/contracts/Barter.sol/Barter.json"

export default function Home(){
    const [nfts,setNFts]=useState([])
    const [loadingState,setLoadingState]=useState('not-loaded')

    useEffect(()=>{
        loadNFTs()
    },[])

    async function loadNFTs(){
        const provider= new ethers.providers.JsonRpcProvider()
        const nftContract=new ethers.Contract(nftaddress,NFT.abi,provider)
        const barterContract=new ethers.Contract(barteraddress,Barter.abi,provider)
        const data =await barterContract.fetchMarketItems()

        const items=await Promise.all(data.map(async i=>{
            const tokenUri=await nftContract.tokenURI(i.tokenId) 
            console.log("hii");
            console.log(tokenUri);
            console.log("hii");
            const meta=await axios.get(tokenUri)
            let price=ethers.utils.formatUnits(i.price.toString(),'ether')
            let item={
                price,
                tokenId:i.tokenId.toNumber(),
                seller:i.seller,
                owner:i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description
            }
            console.log(meta)
            return item

        }))
        setNFts(items)
        setLoadingState('loaded')
    }

    async function buyNFT(nft){
        const web3Modal=new Web3Modal()
        const connection =await web3Modal.connect()
        const provider=new ethers.providers.Web3Provider(connection)

        const signer=provider.getSigner()
        const bContract=new ethers.Contract(barteraddress,Barter.abi,signer)
        
        const price=ethers.utils.parseUnits(nft.price.toString(),'ether')

        // const transaction=await bContract.createMarketSale(nftaddress,nft.tokenId,{
        //     value:price
        // })
         const transaction=await bContract.exchangeNFT(nftaddress,nft.tokenId,{
            gasLimit:2800000
        })
        await transaction.wait()
        loadNFTs()  
    }

    if(loadingState==="loaded" && !nfts.length)
    return(
        <div>
            <p className="px-10 py-10 text-2xl font-bold flex justify-center text-cyan-200">
                There are currently no items in the Barter System.<br/> Please come back later
            </p>
        </div>
    )

    return(
        <div className="flex justify-center h-screen">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-5">
                  {
                    nfts.map((nft,i)=>(
                        <div key={i} className="border shadow rounded-3xl overflow-hidden">
                            <img src={nft.image}/>
                            <div className="p-4">
                                <p style={{height:'64px'}} className="text-2xl font-semibold">{nft.name}</p>
                                <div style={{height:'70px', overflow:"hidden"}}>
                                    <p className="text-gray-400">{nft.description}</p>
                                </div>
                            </div>

                            <div className='p-4 bg-blue'>
                                <p className='text-2xl mb-4 font-bold text-white'>{nft.price} ETH</p>
                                <button className="w-full bg-purple-600 text-white font-bold py-2 px-12 rounded" 
                                onClick={()=>buyNFT(nft)}>Buy</button>
                            </div>
                        </div>
                    ))
                  }
                </div>
            </div>
        </div>
    )
                };