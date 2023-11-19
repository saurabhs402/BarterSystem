import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { useEffect, useState } from 'react'
import axios from 'axios'
import {withRouter} from 'next/router'
import {useRouter} from 'next/router'
import styles from '../styles/Home.module.css';


// import dotenv from "dotenv";
// dotenv.config({ silent: process.env.NODE_ENV === 'production' });
const {create} =require('ipfs-http-client')
const projectId=process.env.NEXT_PUBLIC_PROJECT_ID
const projectSecret=process.env.NEXT_PUBLIC_PROJECT_SECRET_KEY


const auth= "Basic " + Buffer.from(projectId + ":" +projectSecret).toString("base64");
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

export default function nftRequests() {

    const [nfts,setNfts]=useState([]) 
    const [loadingState,setLoadingState] = useState('not-loaded')
    const router = useRouter();

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

            console.log(meta.data.list)
            console.log("\n")

            let item = {
                name: meta.data.name,
                description: meta.data.description,
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                list: meta.data.list,
                owner: i.owner,
                image: meta.data.image,
            }

            return item
            }))

            setNfts(items)
            setLoadingState('loaded')
    }


    async function acceptRequest(currNft, exNft){
        const nftString = JSON.stringify(currNft)
        // navigate('/requestPage', {state: {item: nftString}})

        const web3Modal=new Web3Modal()
        const connection =await web3Modal.connect()
        const provider=new ethers.providers.Web3Provider(connection)

        const signer1=provider.getSigner(0)
        const signer2=provider.getSigner(1)
        const bContract=new ethers.Contract(barteraddress,Barter.abi,signer1)
        const tokenContract = new ethers.Contract(nftaddress,NFT.abi,signer2)
        
        const price=ethers.utils.parseUnits(currNft.price.toString(),'ether')

        // const transaction=await bContract.createMarketSale(nftaddress,nft.tokenId,{
        //     value:price
        // })

         const currTokenUri=await tokenContract.tokenURI(currNft.tokenId)
         const itemsStokenId=currNft.tokenId;
  
         // first time added gas limit
         const transaction=await bContract.acceptNFT(nftaddress,currNft.tokenId,exNft.tokenId,{
            gasLimit:28000000
        })
        await transaction.wait()
         
       
        console.log(currTokenUri);

        const meta = await axios.get(currTokenUri)

        console.log(meta.data.list);

        const emptyList=[]

        meta.data.list=emptyList;

        console.log(meta.data.list);

           // ******** CHANGED PART ********
        try{
            console.log("uploading data to infura")
            const added = await client.add(JSON.stringify(meta.data))
            console.log("uploaded to infura")

            const url=`http://saurabhss402.infura-ipfs.io/ipfs/${added.path}` 

            console.log(url)

            console.log("\n\n\n\n");
            console.log("updating URI")
           

            console.log("beforeURI "+currTokenUri);
            
           const transaction= await tokenContract.updateTokenURI(itemsStokenId,url);
           await transaction.wait()

            const afterURI=await tokenContract.tokenURI(itemsStokenId);


            console.log("afterURI "+afterURI);

        }
        catch(error){
            console.log('error uploading file:',error)
        }

         console.log("nftrequest terminated");

        router.push('/');


        loadNFTs() 
    }


    if (loadingState ==='loaded' && !nfts.length) return(
        <div className="flex justify-center items-center min-h-screen">
            <h1 className="px-10 py-10 text-2xl font-bold flex justify-center text-cyan-200">No Pending Requests</h1>
        </div>
        
    )

    return(
        <div className="flex justify-center min-h-screen">
            <div className="p-4">
                <div className="flex flex-col gap-5">
                    {
                        nfts.map((nft,i) => (
                            <div key={i}  className="grid grid-cols-4 gap-5 py-3 border">
                                <div className="border shadow rounded-xl overflow-hidden mr-5">
                                    <img className={styles['nft-image']} style={{height:'300px', width: '400px'}} src={nft.image}    />
                                    <div className="p-4 bg-black">
                                        <p className="text-xl font-bold text-white">
                                            Name - {nft.name}
                                        </p>
                                        <p className="text-xl font-bold text-white">
                                            Description - {nft.description}
                                        </p>
                                        <p className="text-xl font-bold text-white">
                                            Price - {nft.price} Eth
                                        </p>
                                    </div>
                                </div>

                                <div className='flex items-center justify-center'>
                                    <img className="h-20 w-20" src="https://www.svgrepo.com/show/520720/exchange.svg" alt="exchange"></img>
                                </div>

                                {
                                    nft.list.map((exNft,ind) => (
                                        <div key={ind} className="border shadow rounded-xl overflow-hidden">
                                            <img className={styles['nft-image']} style={{height:'300px', width: '400px'}} src={exNft.image}    />
                                            <div className="p-4 bg-black">
                                                <p className="text-xl font-bold text-white">
                                                    Name - {exNft.name} Eth
                                                </p>
                                                <p className="text-xl font-bold text-white">
                                                    Description - {exNft.description} Eth
                                                </p>
                                                <p className="text-xl font-bold text-white">
                                                    Price - {exNft.price} Eth
                                                </p>
                                            </div>
                                            <button className="w-full bg-purple-600 text-white font-bold py-2 px-12 rounded" onClick={()=>acceptRequest(nft,exNft)}>Accept Exchange</button>
                                        </div>
                                    ))
                                }

                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )

}