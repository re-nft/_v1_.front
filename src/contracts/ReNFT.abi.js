module.exports = [
  {
    inputs: [
      {
        internalType: "address",
        name: "newResolver",
        type: "address"
      },
      {
        internalType: "address payable",
        name: "newBeneficiary",
        type: "address"
      },
      {
        internalType: "address",
        name: "newAdmin",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "is721",
        type: "bool"
      },
      {
        indexed: true,
        internalType: "address",
        name: "lenderAddress",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "nftAddress",
        type: "address"
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenID",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lendingID",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "maxRentDuration",
        type: "uint8"
      },
      {
        indexed: false,
        internalType: "bytes4",
        name: "dailyRentPrice",
        type: "bytes4"
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "lendAmount",
        type: "uint16"
      },
      {
        indexed: false,
        internalType: "enum IResolver.PaymentToken",
        name: "paymentToken",
        type: "uint8"
      }
    ],
    name: "Lend",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "renterAddress",
        type: "address"
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "lendingID",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "rentingID",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "rentAmount",
        type: "uint16"
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "rentDuration",
        type: "uint8"
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "rentedAt",
        type: "uint32"
      }
    ],
    name: "Rent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rentingID",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "collectedAt",
        type: "uint32"
      }
    ],
    name: "RentClaimed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "lendingID",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "stoppedAt",
        type: "uint32"
      }
    ],
    name: "StopLend",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rentingID",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "stoppedAt",
        type: "uint32"
      }
    ],
    name: "StopRent",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "enum IRegistry.NFTStandard[]",
        name: "nftStandard",
        type: "uint8[]"
      },
      {
        internalType: "address[]",
        name: "nftAddress",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "tokenID",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_lendingID",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_rentingID",
        type: "uint256[]"
      }
    ],
    name: "claimRent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "nftAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "tokenID",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_lendingID",
        type: "uint256"
      }
    ],
    name: "getLending",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      },
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4"
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16"
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16"
      },
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "nftAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "tokenID",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_rentingID",
        type: "uint256"
      }
    ],
    name: "getRenting",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16"
      },
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      },
      {
        internalType: "uint32",
        name: "",
        type: "uint32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "enum IRegistry.NFTStandard[]",
        name: "nftStandard",
        type: "uint8[]"
      },
      {
        internalType: "address[]",
        name: "nftAddress",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "tokenID",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "lendAmount",
        type: "uint256[]"
      },
      {
        internalType: "uint8[]",
        name: "maxRentDuration",
        type: "uint8[]"
      },
      {
        internalType: "bytes4[]",
        name: "dailyRentPrice",
        type: "bytes4[]"
      },
      {
        internalType: "enum IResolver.PaymentToken[]",
        name: "paymentToken",
        type: "uint8[]"
      }
    ],
    name: "lend",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]"
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    name: "onERC1155BatchReceived",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    name: "onERC1155Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "enum IRegistry.NFTStandard[]",
        name: "nftStandard",
        type: "uint8[]"
      },
      {
        internalType: "address[]",
        name: "nftAddress",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "tokenID",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_lendingID",
        type: "uint256[]"
      },
      {
        internalType: "uint8[]",
        name: "rentDuration",
        type: "uint8[]"
      },
      {
        internalType: "uint256[]",
        name: "rentAmount",
        type: "uint256[]"
      }
    ],
    name: "rent",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "rentFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "newBeneficiary",
        type: "address"
      }
    ],
    name: "setBeneficiary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "newPaused",
        type: "bool"
      }
    ],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newRentFee",
        type: "uint256"
      }
    ],
    name: "setRentFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "enum IRegistry.NFTStandard[]",
        name: "nftStandard",
        type: "uint8[]"
      },
      {
        internalType: "address[]",
        name: "nftAddress",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "tokenID",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_lendingID",
        type: "uint256[]"
      }
    ],
    name: "stopLend",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "enum IRegistry.NFTStandard[]",
        name: "nftStandard",
        type: "uint8[]"
      },
      {
        internalType: "address[]",
        name: "nftAddress",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "tokenID",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_lendingID",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_rentingID",
        type: "uint256[]"
      }
    ],
    name: "stopRent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4"
      }
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];
