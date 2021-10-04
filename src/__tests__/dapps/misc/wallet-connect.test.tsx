import React from 'react'
import { act, render, screen } from '@testing-library/react'
import * as useUserDataHook from  "renft-front/hooks/store/useUserData";
import * as useLookupAddressHook from "renft-front/hooks/queries/useLookupAddress";
import { WalletConnect } from 'renft-front/components/layouts/app-layout/wallet-connect'
import { sleep } from 'renft-front/utils';

const network = 'mainnet';


jest.mock('firebase/app');
jest.mock("react-ga")
jest.mock("@ethersproject/providers");
jest.mock('web3modal')


describe('Wallet display', () => {

    afterAll(() => {
        jest.resetAllMocks();
    });

    it('renders connect button', async () => {

        global.window.ethereum = jest.fn().mockImplementation().mockReturnValue({
            request: jest.fn().mockReturnValue(Promise.resolve([{
                caveats: { value: [] }
            }]))

        })

        render(<WalletConnect />)

        await act(async () => {
            await sleep(1)
        })
        await act(async () => {
            await sleep(1)
        })
        const testId = 'wallet-connect-button';
        const elem = screen.getByTestId(testId)

        expect(elem).toBeInTheDocument()
        expect(elem).toHaveTextContent(/connect wallet/i)
    })

    it('renders install metamask', async () => {
        global.window.ethereum = null;
        jest.mock('web3modal', () => {
            return null
        });

        render(<WalletConnect />)

        await act(async () => {
            await sleep(1)
        })
        await act(async () => {
            await sleep(1)
        })
        const testId = 'wallet-connect-install-metamask';
        const elem = screen.getByTestId(testId)

        expect(elem).toBeInTheDocument()
        expect(elem).toHaveTextContent(/install metamask/i)
    })

    it('renders wallet address', async () => {
        global.window.ethereum = {
            request: jest.fn().mockReturnValue(Promise.resolve([{
                caveats: ['', { value: ["incorrect value"] }]
            }]))
        }
        global.process.env.NEXT_PUBLIC_NETWORK_SUPPORTED = network

        render(<WalletConnect />)
        await act(async () => {
            await sleep(1)
        })
        await act(async () => {
            await sleep(1)
        })
        await act(async () => {
            await sleep(1)
        })

        const testId = 'wallet-address';
        const elem = screen.getByTestId(testId)

        expect(elem).toBeInTheDocument()
        expect(elem).toHaveTextContent('8897146...efc')

        const networkEl = screen.getByTestId('wallet-network')
        expect(networkEl).toBeInTheDocument()
        expect(networkEl).toHaveTextContent(network)
    })

    it('renders wallet account name saved in API', async () => {
        global.window.ethereum = {
            request: jest.fn().mockReturnValue(Promise.resolve([{
                caveats: ['', { value: ["incorrect value"] }]
            }]))
        }
        global.process.env.NEXT_PUBLIC_NETWORK_SUPPORTED = network

        const accountName = 'Account name';
        const spy = jest.spyOn(useUserDataHook, 'useUserData')
        // @ts-ignore
        spy.mockReturnValue({
            userData: {
                name: accountName
            }
        })

        render(<WalletConnect />)

        await act(async () => {
            await sleep(1)
        })
        await act(async () => {
            await sleep(1)
        })
        await act(async () => {
            await sleep(1)
        })
        const testId = 'wallet-address';
        const elem = screen.getByTestId(testId)

        expect(elem).toBeInTheDocument()
        expect(elem).toHaveTextContent(accountName)

        const networkEl = screen.getByTestId('wallet-network')
        expect(networkEl).toBeInTheDocument()
        expect(networkEl).toHaveTextContent(network)

    })

    it('renders reverse address name', () => {
        global.window.ethereum = {
            request: jest.fn().mockReturnValue(Promise.resolve([{
                caveats: ['', { value: ["incorrect value"] }]
            }]))
        }
        global.process.env.NEXT_PUBLIC_NETWORK_SUPPORTED = network

        const userDataSpy = jest.spyOn(useUserDataHook, 'useUserData')
        // @ts-ignore
        userDataSpy.mockReturnValue({
            userData: {}
        })
        const spy = jest.spyOn(useLookupAddressHook, 'useLookupAddress')
        const lookupAddress = 'someaddress.at.eth';
        spy.mockReturnValue(lookupAddress)


        render(<WalletConnect />)

        const testId = 'wallet-address';
        const elem = screen.getByTestId(testId)

        expect(elem).toBeInTheDocument()
        // TODO:eniko dm design, this doesn't look good
        expect(elem).toHaveTextContent("someadd...eth")

        const networkEl = screen.getByTestId('wallet-network')
        expect(networkEl).toBeInTheDocument()
        expect(networkEl).toHaveTextContent(network)
    })

});
