import"../styles/globals.css"
import Link from "next/link"

function Marketplace({Component,pageProps}){

   return(

    <div className="flex-col justify-center items-center bg-gray-700">
      {/* <nav>
        <p classNameName="text-4xl font-bold flex justify-center text-cyan-200">
          Smart Barter System
        </p>
        <div classNameName="flex justify-center p-8">

          <div classNameName="bg-black rounded-full py-2 px-4 mr-4">
            <Link href="/" classNameName="text-xl text-cyan-200">
                  Home
            </Link>
          </div>
          
          <div classNameName="bg-black rounded-full py-2 px-4 mr-4">
            <Link href="/createNFT" classNameName="text-xl text-cyan-200">
              Register Product
            </Link>
          </div>
          
          <div classNameName="bg-black rounded-full py-2 px-4 mr-4">
            <Link href="/myNFTs" classNameName="text-xl text-cyan-200">
              My NFTs
            </Link>
          </div>
          
          <div classNameName="bg-black rounded-full py-2 px-4">
            <Link href="/dashboard" classNameName="text-xl text-cyan-200">
              Dashboard
            </Link>
          </div>

        </div>

      </nav> */}

      <div>

        <nav className="flex justify-around flex-wrap bg-black p-6">

          <div className="flex flex-shrink-0 text-white mt-2">
            <img src="https://cdn-icons-png.flaticon.com/512/1969/1969111.png" className="h-10 w-10"></img>
            <span className="ml-2 font-semibold text-xl tracking-tight">Smart Barter System</span>
          </div>

          <div className="flex items-center w-auto">
            <div className="text-sm flex-grow">
              <a href="/" className="mt-4 inline-block text-teal-200 hover:text-white mr-4">
                Home
              </a>
              <a href="/createNFT" className="mt-4 inline-block text-teal-200 hover:text-white mr-4">
                Register Product
              </a>
              <a href="/myNFTs" className="mt-4 inline-block text-teal-200 hover:text-white mr-4">
                My NFT's
              </a>
              {/* <a href="/dashboard" className="mt-4 inline-block text-teal-200 hover:text-white mr-4">
                DashBoard
              </a> */}
                <a href="/nftRequests" className="mt-4 inline-block text-teal-200 hover:text-white">
                Requests
              </a>
            </div>
          </div>

        </nav>

      </div>

      <Component{...pageProps}/>

    </div>
   )


}
export default Marketplace