import { renderHook, act } from '@testing-library/react-hooks'
import { useWallet } from '../../../hooks/store/useWallet'
import { sleep } from '../../../utils'


jest.mock('firebase/app');

jest.mock("react-ga")

const address = "889714669dB168bBdB3894929de608e57959FEFc"

jest.mock("@ethersproject/providers");
jest.mock('web3modal')

describe("useWallet", () => {
    afterAll(() => {
        jest.resetAllMocks();
      });
    it('should return default state', async() => {
        global.window.ethereum = undefined
        const { result } = renderHook(() => useWallet())
      
        await act(async()=>{
            await sleep(1)
        })
        await act(async()=>{
         await sleep(1)
         })  

        expect(result.current.address).toBe("")
        expect(result.current.network).toBe("")
        expect(result.current.signer).toBe(undefined)
      })

      it('should show empty address when not connected before', async() => {
        global.window.ethereum = {
            request: jest.fn().mockReturnValue(Promise.resolve([{
                caveats: []
            }]))
         }
        const { result } = renderHook(() => useWallet())
        await act(async()=>{
            await sleep(1)
        })
        await act(async()=>{
         await sleep(1)
         })  
        
        expect(result.current.address).toBe("")
        expect(result.current.network).toBe("")
        expect(result.current.signer).toBe(undefined)
      })

      it('should return address if connected before', async() => {
        global.window.ethereum = {
           request: jest.fn().mockReturnValue(Promise.resolve([{
               caveats: ['', { value: ["incorrect value"] }]
           }]))
        }
       const { result } = renderHook(() => useWallet())
       await act(async()=>{
           await sleep(1)
       })
       await act(async()=>{
        await sleep(1)
        })    
       
       expect(result.current.address).toBe(address.toLowerCase())
       expect(result.current.network).toBe("mainnet")
       expect(result.current.signer).not.toBe(null)
     })

     it('should connect when click on button and accept wallet permission', async() => {
        global.window.ethereum = {
            request: jest.fn().mockReturnValue(Promise.resolve([{
                caveats: []
            }]))
         }
        const { result } = renderHook(() => useWallet())
        await act(async()=>{
            result.current.connect()
        })
        await act(async()=>{
         await sleep(1)
         })  

         global.window.ethereum = {
            request: jest.fn().mockReturnValue(Promise.resolve([{
                caveats: ['', { value: ["incorrect value"] }]
            }]))
         }
        
         expect(result.current.address).toBe(address.toLowerCase())
       expect(result.current.network).toBe("mainnet")
       expect(result.current.signer).not.toBe(null)
      })
})
