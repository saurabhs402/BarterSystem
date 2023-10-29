import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { useEffect, useState } from 'react'
import axios from 'axios'
import {withRouter} from 'next/router'
import styles from '../styles/Home.module.css';

import { useSearchParams } from 'next/navigation'


const {create} =require('ipfs-http-client')
const projectId=process.env.PROJECT_ID
const projectSecret=process.env.PROJECT_SECRET_KEY



const auth= "Basic " + Buffer.from("2WsskFWapjHPkdHRuUrxWKuKITs" + ":" +"6aa70ca5d74fc2ae48315675656f8ff9").toString("base64");
const client =create({
  host: "ipfs.infura.io",
  port:5001,
  protocol:"https",
  headers:{
  authorization:auth
  },
});



import {
    nftaddress, barteraddress
} from '../config'
  
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Barter from '../artifacts/contracts/Barter.sol/Barter.json'

export default function requestPage(props) {
    const searchParams = useSearchParams()
    console.log(searchParams.get('data'))
    console.log('line break')
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
            }

            return item
            }))

            setNfts(items)
            setLoadingState('loaded')
    }

    // TO BE IMPLEMENTED
    async function sendRequest(nft){


        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()


        const marketContract = new ethers.Contract(barteraddress,Barter.abi,signer)
        const tokenContract = new ethers.Contract(nftaddress,NFT.abi,provider)



      
        const itemSelected= searchParams.get('data');
        console.log(itemSelected)
        const itemS=JSON.parse(itemSelected);

        console.log('terminate')




        const tokenUri = await tokenContract.tokenURI(itemS.tokenId)
        const meta = await axios.get(tokenUri)
        console.log(meta.data)

        console.log("\n\n line break")

        console.log(meta.data.list)
        meta.data.list.push(nft);

        
                try{
                console.log("try")
                const added=await client.add(meta.data)
                console.log("try2")
                const url=`http://saurabhss402.infura-ipfs.io/ipfs/${added.path}`
                console.log("try3")
                
                console.log(url)
                createSale(url)
                }catch(error){
                console.log('error uploading file:',error)
                }

    tokenContract.updateTokenURI(itemS.tokenId,url);


}


    if (loadingState ==='loaded' && !nfts.length) return(
        <h1 className="py-10 px-20 text-3xl">Having no assets</h1>
    )

    return(
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-4 gap-5 pt-6">
                    {
                nfts.map((nft,i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                        <img className={styles['nft-image']} src={nft.image}    />
                        <div className="p-4 bg-black">
                            <p className="text-xl font-bold text-white">
                                Price - {nft.price} Eth
                            </p>
                        </div>
                        <button className="w-full bg-purple-600 text-white font-bold py-2 px-12 rounded" onClick={()=>sendRequest(nft)}>Request Exchange</button>
                    </div>
                ))
                }
                </div>
            </div>
        </div>
    )

}