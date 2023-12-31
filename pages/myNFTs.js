import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { useEffect, useState } from 'react'
import axios from 'axios'
import styles from '../styles/Home.module.css';

import {
    nftaddress, barteraddress
  } from '../config'
  
  import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
  import Barter from '../artifacts/contracts/Barter.sol/Barter.json'

  export default function MyAssets() {
     const [nfts,setNfts]=useState([]) 
     const [loadingState,setLoadingState] = useState('not-loaded')
     useEffect(() => {
         loadNFTs()
     }, [])

     async function loadNFTs() {    

        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()


        const marketContract = new ethers.Contract(barteraddress,Barter.abi,signer)
        const tokenContract = new ethers.Contract(nftaddress,NFT.abi,provider)

        const data= await marketContract.fetchMyNFTs()
        // console.log(typeof(data))
        // console.log(data.mSender)

        const items = await Promise.all(data.map(async i => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
        
          }
          return item
        }))
        setNfts(items)
        setLoadingState('loaded') 
      }
     if (loadingState ==='loaded' && !nfts.length) return(
        <div className="flex justify-center items-center min-h-screen">
            <h1 className="px-10 py-10 text-2xl font-bold flex justify-center text-cyan-200">No Assests Available</h1>
        </div>
         

     )
     return(
         <div className="flex justify-center min-h-screen">
             <div className="p-4">
                 <div className="grid grid-cols-4 gap-5 pt-6">
                     {
                    nfts.map((nft,i) => (
                     <div key={i} className="border shadow rounded-xl overflow-hidden">
                         <img className={styles['nft-image']} style={{height:'300px', width: '400px'}} src={nft.image}    />
                         <div className="p-4 bg-gray-900">
                            <p className="text-xl font-bold text-white">
                                Name - {nft.name} 
                            </p>
                            <p className="text-xl font-bold text-white">
                                Price - {nft.price} Eth
                            </p>
                         </div>
                     </div>
                 ))
                    }
                 </div>
             </div>
         </div>

     )

  }