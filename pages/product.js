import { useEffect, useState } from 'react'
import {ethers } from 'ethers'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Web3Modal from 'web3modal'
import {useRouter} from 'next/router'
import { nftaddress,barteraddress } from '../config'

// import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import Barter from "../artifacts/contracts/Barter.sol/Barter.json"



export default function product() {
  const searchParams = useSearchParams()
    const [nft,setNft]=useState()
    const [metaMaskAccount, setMetaMaskAccount] = useState("")
    const [show, setShow] = useState()

    // console.log(searchParams.get('data'))
    // console.log('line break')
    // const paramsData = searchParams.get('data')
    // const dataJSON = JSON.parse(paramsData)
    // console.log(dataJSON)

    const fetchNft = () => {

        const itemHome = searchParams.get('data');
        const itemHJ=JSON.parse(itemHome);
        setNft(itemHJ)
    }

    useEffect(() => {
        fetchNft()
    }, [])

    useEffect(() => {
        onInit()
    }, [nft])

    useEffect(() => {
        console.log('nft')
        console.log(nft)
        if(nft && metaMaskAccount && (metaMaskAccount.toLowerCase() !== nft.seller.toLowerCase())){
            console.log("nft seller")
            console.log(nft.seller.toLowerCase)
            console.log(" * ")
            console.log('metaAccount')
            console.log(metaMaskAccount.toLowerCase)
            setShow(true)
        }
    }, [metaMaskAccount])

    async function onInit() {
        await window.ethereum.enable();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0]; // wallet address
        setMetaMaskAccount(account)

        window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        // console.log(accounts[0])
        });
           
    }

    async function buyNFT(nft){
        const web3Modal=new Web3Modal()
        const connection =await web3Modal.connect()
        const provider=new ethers.providers.Web3Provider(connection)

        const signer=provider.getSigner()
        const bContract=new ethers.Contract(barteraddress,Barter.abi,signer)
        
        const price=ethers.utils.parseUnits(nft.price.toString(),'ether')


        // big Number exception=> gas limit
        const transaction=await bContract.createMarketSale(nftaddress,nft.tokenId,{
            value:price,
            gasLimit:2800000
        })
        await transaction.wait()
        
         router.push('/');
    }
    // async function onInit() {
    //     await window.ethereum.enable(); // depreceated
    //     const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    //     const account = accounts[0]; // wallet address

  
        
    //     console.log("Metamask account")
    //     console.log(metamaskAccount)

    //      console.log("nft")
    //     console.log(nft)

    //     if(nft && account!=nft.seller)
    //     setMetaMaskAccount(account)
    //      window.ethereum.on('accountsChanged', function (accounts) {
    //         // Time to reload your interface with accounts[0]!
    //         console.log(accounts[0])
    //        });
           
    // }
   
    

    return(
        <div className="min-h-screen">

            {nft  && (

                <div className="container mx-auto py-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    
                        <div className="md:order-2">
                            <img src={nft.image} alt="Product Image" className='rounded-lg' style={{height:'400px', width: '400px'}}/>
                        </div>

                    
                        <div className="md:order-1">

                            <div className='pl-60'>
                                <h1 className="text-3xl font-semibold mb-4">{nft.name}</h1>

                                <p className="text-gray-100 mb-4">{nft.description}</p>

                                <p className="text-2xl font-bold text-red-600 mb-4">{nft.price} ETH</p>
                            </div>
                            
                            {
                                show && ( 
                                <div className='flex flex-col gap-4 items-center py-5'>
                                    <button className="bg-blue-500 text-white px-36 py-2 rounded-md hover:bg-blue-600" onClick={() => buyNFT(nft)}>Buy</button>

                                    <Link 
                                        href={{
                                            pathname: '/requestPage',
                                            query: {
                                                data: JSON.stringify(nft),
                                            },
                                        }}
                                    >
                                        <div className="flex flex-row bg-purple-600 text-white font-bold py-2 px-32 rounded hover:bg-purple-700">
                                            Exchange
                                        </div>
                                        
                                    </Link>
                                </div>
                                ) 
                            }
                           

                        </div>

                    </div>
                    

                </div>

            )}
        </div>
    )

}

{/* <div className='border'>

                    <div class="flex flex-col md:flex-row p-4">
                    
                        <div class="md:w-1/3">
                            <img src={nft.image} alt="Placeholder" class="w-full rounded-md"/>
                        </div>

                        <div class="md:w-2/3 md:pl-4">
                            <h2 class="text-xl font-bold mb-2">Name: {nft.name}</h2>
                            <p class="text-xl font-bold mb-2">Description: {nft.description}</p>
                            <p class="text-xl font-bold mb-2">Price: {nft.price} ETH</p>
                        </div>

                    </div>

                    <div>
                        <button 
                            className="w-full bg-blue-600 text-white font-bold m-1 py-2 px-12 rounded" 
                            onClick={()=>buyNFT(nft)}>Buy
                        </button>

                        <Link 
                            href={{
                                pathname: '/requestPage',
                                query: {
                                    data: JSON.stringify(nft),
                                },
                            }}
                        >
                            <div className="flex flex-row w-full bg-purple-600 text-white font-bold m-1 py-2 px-32 rounded">
                                Exchange
                            </div>
                            
                        </Link>
                    </div>

                </div> */}

