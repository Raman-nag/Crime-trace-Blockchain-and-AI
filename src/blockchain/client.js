import { BrowserProvider, Contract, keccak256, toUtf8Bytes, isAddress } from 'ethers';
import { CrimeTraceABI } from './crimeTraceAbi.js';

const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || '';
const CONTRACT_ADDRESS = import.meta.env.VITE_CRIME_TRACE_ADDRESS || '';

export function getAdminAddress() {
  return ADMIN_ADDRESS;
}

export function getContractAddress() {
  return CONTRACT_ADDRESS;
}

export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum wallet detected. Please install MetaMask.');
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const address = accounts[0];
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return { address, provider, signer };
}

export function getContractInstance(signerOrProvider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error('CrimeTrace contract address is not configured (VITE_CRIME_TRACE_ADDRESS).');
  }

  if (!isAddress(CONTRACT_ADDRESS)) {
    throw new Error(
      'CrimeTrace contract address in VITE_CRIME_TRACE_ADDRESS is invalid. Please set it to a valid 0x... address for the current network.'
    );
  }

  return new Contract(CONTRACT_ADDRESS, CrimeTraceABI, signerOrProvider);
}

export async function registerCitizenOnChain(signer, params) {
  const { aliasName, idType, idNumber, city, state, pincode, documentCid } = params;

  if (!idType || !idNumber) {
    throw new Error('ID type and ID number are required.');
  }

  const contract = getContractInstance(signer);

  const idHash = keccak256(toUtf8Bytes(`${idType}:${idNumber}`));
  const metadata = JSON.stringify({ city, state, pincode, documentCid });

  const tx = await contract.registerCitizen(aliasName || '', idType, idHash, metadata);
  const receipt = await tx.wait();
  const from = await signer.getAddress();

  return { address: from, txHash: tx.hash, receipt };
}
