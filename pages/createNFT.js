import {useState} from 'react'
import {ethers} from 'ethers'
import {create as ipfsHttpClient} from 'ipfs-http-client'
import {useRouter} from 'next/router'
import Web3Modal from'web3modal'

const {create} =require('ipfs-http-client')
const projectId=process.env.PROJECT_ID
const projectSecret=process.env.PROJECT_SECRET_KEY

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
  nftaddress,barteraddress
} from "../config"

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import Barter from "../artifacts/contracts/Barter.sol/Barter.json"

export default function CreateItem(){
  const [fileUrl,setFileUrl] = useState(null)
  const [formInput,updateFormInput]=useState({price:"",name:"",description:""})

  const router=useRouter()
  
  async function onChange(e){
    const file=e.target.files[0]
    try{
      const added=await client.add(
        file,{
          progress:(prog)=>console.log(`received:${prog}`)
        }
      )
      const url=`http://saurabhs.infura-ipfs.io/ipfs/${added.path}`
      setFileUrl(url)
    }catch(error){
      console.log("error uploading file, please try again:" ,error)
    }
  }

  async function CreateMarket(){
    const {name,description,price}=formInput
    if(!name||!description||!price||!fileUrl) return

    const data=JSON.stringify({
      name,description,image:fileUrl
    })
   
    try{
      const added=await client.add(data)
      const url=`http://saurabhs.infura-ipfs.io/ipfs/${added.path}`
      console.log(url)
      createSale(url)
    }catch(error){
      console.log('error uploading file:',error)
    }
  }

  async function createSale(url){
    const web3Modal=new Web3Modal()
    const connection=await web3Modal.connect()
    const provider=new ethers.providers.Web3Provider(connection)
    const signer=provider.getSigner()

    let contract=new ethers.Contract(nftaddress,NFT.abi,signer)
    let transaction=await contract.createToken(url)
    let tx=await transaction.wait()
    let event=tx.events[0]
    let value=event.args[2]
    let tokenId=value.toNumber()

    const price=ethers.utils.parseUnits(formInput.price,'ether')

    contract=new ethers.Contract(barteraddress,Barter.abi,signer)
    let listingPrice=await contract.getListingPrice()
    listingPrice=listingPrice.toString()

    transaction=await contract.createMarketItem(nftaddress,tokenId,price,{value: listingPrice})
    await transaction.wait()
    router.push('/')
  }

  return(

    <div className="flex justify-center">
    
      <div className="mt-8 w-1/2 flex flex-col pb-12">
        <div className="flex flex-col mb-4">
          <label className="text-white">NFT Name : </label>
          <input placeholder="Name of the NFT"
          className="border rounded p-2 h-12"
          onChange={e => updateFormInput({...formInput,name:e.target.value})}/>
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-white">Description : </label>
          <textarea 
          placeholder="Provide Metadata of the Product"
          className="border rounded p-2 h-72"
          onChange={e => updateFormInput({...formInput,description:e.target.value})}/>
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-white">NFT Price : </label>
          <input
          placeholder="Price of the NFT in ETH"
          className="border rounded p-2 h-12"
          onChange={e => updateFormInput({...formInput,price:e.target.value})}/>
        </div>

        <input
        type="file"
        name="asset"
        className="my-3 text-white"
        onChange={onChange}/>

        {
          fileUrl &&(
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }

        <button onClick={CreateMarket} className="font-bold mt-2 bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-green-400 hover:to-blue-500 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
      </div>

    </div>
  )

};
